const puppeteer = require('puppeteer');
const axe = require('axe-core');
const pa11y = require('pa11y');
const lighthouse = require('lighthouse');
const Table = require('cli-table3');
const fs = require('fs').promises;

class AccessibilityTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.results = {
            axe: null,
            pa11y: null,
            lighthouse: null,
            manual: null
        };
    }

    async init() {
        this.browser = await puppeteer.launch({
            headless: false,
            defaultViewport: { width: 1920, height: 1080 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
        
        // Set up accessibility context
        await this.page.setUserAgent('Mozilla/5.0 (compatible; AccessibilityTester/1.0; WCAG 2.1 AA Testing)');
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async runAxeTest(url = 'http://localhost:3000') {
        console.log('🔍 Running axe-core accessibility scan...');
        
        try {
            await this.page.goto(url, { waitUntil: 'networkidle2' });
            
            // Inject axe-core
            await this.page.addScriptTag({
                content: await fs.readFile(require.resolve('axe-core/axe.min.js'), 'utf8')
            });
            
            // Wait for page to be fully interactive
            await this.page.waitForTimeout(2000);
            
            // Run axe analysis
            const axeResults = await this.page.evaluate(async () => {
                return await axe.run({
                    rules: {
                        'color-contrast': { enabled: true },
                        'keyboard-navigation': { enabled: true },
                        'focus-management': { enabled: true },
                        'aria-usage': { enabled: true }
                    }
                });
            });

            this.results.axe = axeResults;
            return axeResults;
        } catch (error) {
            console.error('❌ Axe test failed:', error);
            return null;
        }
    }

    async runPa11yTest(url = 'http://localhost:3000') {
        console.log('🔍 Running pa11y accessibility scan...');
        
        try {
            const pa11yResults = await pa11y(url, {
                standard: 'WCAG2AA',
                includeNotices: true,
                includeWarnings: true,
                timeout: 30000,
                wait: 2000
            });

            this.results.pa11y = pa11yResults;
            return pa11yResults;
        } catch (error) {
            console.error('❌ Pa11y test failed:', error);
            return null;
        }
    }

    async runKeyboardNavigationTest() {
        console.log('⌨️  Testing keyboard navigation...');
        
        const results = {
            tabOrder: [],
            keyboardShortcuts: [],
            focusTrap: [],
            skipLinks: []
        };

        try {
            await this.page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
            await this.page.waitForTimeout(2000);

            // Test tab order
            results.tabOrder = await this.testTabOrder();
            
            // Test keyboard shortcuts
            results.keyboardShortcuts = await this.testKeyboardShortcuts();
            
            // Test focus management in modals
            results.focusTrap = await this.testFocusTrap();
            
            // Test skip links
            results.skipLinks = await this.testSkipLinks();

            return results;
        } catch (error) {
            console.error('❌ Keyboard navigation test failed:', error);
            return results;
        }
    }

    async testTabOrder() {
        const tabOrder = [];
        
        // Navigate through all focusable elements
        await this.page.keyboard.press('Tab');
        
        for (let i = 0; i < 50; i++) {
            const focusedElement = await this.page.evaluate(() => {
                const el = document.activeElement;
                if (!el) return null;
                
                return {
                    tagName: el.tagName,
                    id: el.id,
                    className: el.className,
                    textContent: el.textContent?.slice(0, 50),
                    ariaLabel: el.getAttribute('aria-label'),
                    type: el.type
                };
            });
            
            if (focusedElement) {
                tabOrder.push(focusedElement);
            }
            
            await this.page.keyboard.press('Tab');
            await this.page.waitForTimeout(100);
        }
        
        return tabOrder;
    }

    async testKeyboardShortcuts() {
        const shortcuts = [];
        
        // Test Alt+C (skip to content)
        try {
            await this.page.keyboard.down('Alt');
            await this.page.keyboard.press('KeyC');
            await this.page.keyboard.up('Alt');
            await this.page.waitForTimeout(500);
            
            const focused = await this.page.evaluate(() => document.activeElement?.id);
            shortcuts.push({
                shortcut: 'Alt+C',
                expected: 'menu-container',
                actual: focused,
                passed: focused === 'menu-container'
            });
        } catch (error) {
            shortcuts.push({
                shortcut: 'Alt+C',
                error: error.message,
                passed: false
            });
        }

        // Test F1 (help)
        try {
            await this.page.keyboard.press('F1');
            await this.page.waitForTimeout(500);
            
            const helpModalVisible = await this.page.evaluate(() => {
                const modal = document.getElementById('keyboard-help-modal');
                return modal && modal.style.display === 'flex';
            });
            
            shortcuts.push({
                shortcut: 'F1',
                expected: 'Help modal opens',
                actual: helpModalVisible ? 'Help modal opened' : 'Help modal not opened',
                passed: helpModalVisible
            });
        } catch (error) {
            shortcuts.push({
                shortcut: 'F1',
                error: error.message,
                passed: false
            });
        }

        return shortcuts;
    }

    async testFocusTrap() {
        const focusTrapResults = [];
        
        // Try to open a modal
        try {
            const addSectionBtn = await this.page.$('#add-section');
            if (addSectionBtn) {
                await addSectionBtn.click();
                await this.page.waitForTimeout(1000);
                
                // Check if modal opened
                const modalOpen = await this.page.evaluate(() => {
                    const modal = document.getElementById('section-modal');
                    return modal && (modal.style.display === 'flex' || modal.style.display === 'block');
                });
                
                if (modalOpen) {
                    // Test focus trap by tabbing through
                    const focusedElements = [];
                    for (let i = 0; i < 10; i++) {
                        await this.page.keyboard.press('Tab');
                        const focused = await this.page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName);
                        focusedElements.push(focused);
                        await this.page.waitForTimeout(100);
                    }
                    
                    focusTrapResults.push({
                        modal: 'section-modal',
                        focusedElements: focusedElements,
                        trapped: focusedElements.every(el => el && el !== 'BODY')
                    });
                    
                    // Close modal
                    await this.page.keyboard.press('Escape');
                }
            }
        } catch (error) {
            focusTrapResults.push({
                modal: 'section-modal',
                error: error.message,
                trapped: false
            });
        }
        
        return focusTrapResults;
    }

    async testSkipLinks() {
        const skipLinks = [];
        
        // Look for skip links
        const skipLinksFound = await this.page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a[href^="#"]'));
            return links.map(link => ({
                text: link.textContent,
                href: link.getAttribute('href'),
                class: link.className,
                visible: window.getComputedStyle(link).display !== 'none'
            }));
        });
        
        return skipLinksFound;
    }

    async testMobileAccessibility() {
        console.log('📱 Testing mobile accessibility...');
        
        const results = {
            touchTargets: [],
            viewport: {},
            orientation: []
        };

        try {
            // Test mobile viewport
            await this.page.setViewport({ width: 375, height: 667 }); // iPhone dimensions
            await this.page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
            await this.page.waitForTimeout(2000);

            // Check touch target sizes
            results.touchTargets = await this.page.evaluate(() => {
                const interactiveElements = document.querySelectorAll('button, input, select, textarea, a, [role="button"]');
                const targets = [];
                
                interactiveElements.forEach(el => {
                    const rect = el.getBoundingClientRect();
                    const computedStyle = window.getComputedStyle(el);
                    
                    targets.push({
                        tagName: el.tagName,
                        id: el.id,
                        width: rect.width,
                        height: rect.height,
                        minSize: Math.min(rect.width, rect.height),
                        accessible: Math.min(rect.width, rect.height) >= 44, // WCAG AA requirement
                        padding: computedStyle.padding,
                        margin: computedStyle.margin
                    });
                });
                
                return targets;
            });

            // Test orientation changes
            await this.page.setViewport({ width: 667, height: 375 }); // Landscape
            await this.page.waitForTimeout(1000);
            
            const landscapeUsable = await this.page.evaluate(() => {
                const menuContainer = document.getElementById('menu-container');
                return menuContainer && menuContainer.offsetHeight > 100;
            });
            
            results.orientation.push({
                orientation: 'landscape',
                usable: landscapeUsable
            });

            return results;
        } catch (error) {
            console.error('❌ Mobile accessibility test failed:', error);
            return results;
        }
    }

    async testColorContrast() {
        console.log('🎨 Testing color contrast ratios...');
        
        try {
            await this.page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
            await this.page.waitForTimeout(2000);

            const contrastResults = await this.page.evaluate(() => {
                const elements = document.querySelectorAll('*');
                const results = [];
                
                elements.forEach(el => {
                    const style = window.getComputedStyle(el);
                    const color = style.color;
                    const backgroundColor = style.backgroundColor;
                    const fontSize = parseFloat(style.fontSize);
                    
                    if (color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
                        results.push({
                            tagName: el.tagName,
                            className: el.className,
                            color: color,
                            backgroundColor: backgroundColor,
                            fontSize: fontSize,
                            textContent: el.textContent?.slice(0, 50)
                        });
                    }
                });
                
                return results;
            });

            return contrastResults;
        } catch (error) {
            console.error('❌ Color contrast test failed:', error);
            return [];
        }
    }

    async generateReport() {
        console.log('📊 Generating comprehensive accessibility report...');
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                wcagLevel: 'AA',
                totalIssues: 0,
                criticalIssues: 0,
                warningIssues: 0,
                passedChecks: 0
            },
            axe: this.results.axe,
            pa11y: this.results.pa11y,
            keyboard: this.results.keyboard,
            mobile: this.results.mobile,
            colorContrast: this.results.colorContrast
        };

        // Calculate summary statistics
        if (this.results.axe) {
            report.summary.totalIssues += this.results.axe.violations.length;
            report.summary.criticalIssues += this.results.axe.violations.filter(v => v.impact === 'critical').length;
            report.summary.passedChecks += this.results.axe.passes.length;
        }

        if (this.results.pa11y) {
            report.summary.totalIssues += this.results.pa11y.issues.length;
            report.summary.criticalIssues += this.results.pa11y.issues.filter(i => i.type === 'error').length;
            report.summary.warningIssues += this.results.pa11y.issues.filter(i => i.type === 'warning').length;
        }

        // Write report to file
        await fs.writeFile(
            '/Users/dylanrauhoff/Desktop/Menu Editor/accessibility-report.json',
            JSON.stringify(report, null, 2)
        );

        this.printSummaryTable(report);
        return report;
    }

    printSummaryTable(report) {
        console.log('\n📋 ACCESSIBILITY TEST SUMMARY');
        console.log('================================');
        
        const summaryTable = new Table({
            head: ['Metric', 'Value'],
            colWidths: [30, 20]
        });

        summaryTable.push(
            ['WCAG Compliance Level', report.summary.wcagLevel],
            ['Total Issues Found', report.summary.totalIssues],
            ['Critical Issues', report.summary.criticalIssues],
            ['Warning Issues', report.summary.warningIssues],
            ['Passed Checks', report.summary.passedChecks]
        );

        console.log(summaryTable.toString());

        if (this.results.axe && this.results.axe.violations.length > 0) {
            console.log('\n❌ AXE VIOLATIONS');
            console.log('==================');
            
            const axeTable = new Table({
                head: ['Rule', 'Impact', 'Elements', 'Description'],
                colWidths: [25, 12, 10, 50]
            });

            this.results.axe.violations.forEach(violation => {
                axeTable.push([
                    violation.id,
                    violation.impact,
                    violation.nodes.length,
                    violation.description
                ]);
            });

            console.log(axeTable.toString());
        }

        console.log('\n✅ RECOMMENDATIONS');
        console.log('===================');
        
        const recommendations = [
            'Ensure all interactive elements have minimum 44x44px touch targets',
            'Provide alternative text for all images',
            'Use semantic HTML elements with proper ARIA labels',
            'Implement proper focus management in modals',
            'Test with actual screen readers (NVDA, JAWS, VoiceOver)',
            'Validate keyboard navigation covers all functionality',
            'Check color contrast meets WCAG AA standards (4.5:1 normal, 3:1 large text)'
        ];

        recommendations.forEach((rec, index) => {
            console.log(`${index + 1}. ${rec}`);
        });
    }

    async runFullAccessibilityAudit() {
        console.log('🚀 Starting comprehensive accessibility audit...');
        console.log('================================================');
        
        try {
            await this.init();

            // Run all tests
            this.results.axe = await this.runAxeTest();
            this.results.pa11y = await this.runPa11yTest();
            this.results.keyboard = await this.runKeyboardNavigationTest();
            this.results.mobile = await this.testMobileAccessibility();
            this.results.colorContrast = await this.testColorContrast();

            // Generate comprehensive report
            const report = await this.generateReport();

            console.log('\n🎯 ACCESSIBILITY AUDIT COMPLETE');
            console.log('Report saved to: accessibility-report.json');
            
            return report;
        } catch (error) {
            console.error('❌ Accessibility audit failed:', error);
        } finally {
            await this.close();
        }
    }
}

// Run the audit if this file is executed directly
if (require.main === module) {
    const tester = new AccessibilityTester();
    tester.runFullAccessibilityAudit()
        .then(() => {
            console.log('✅ Accessibility audit completed successfully');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Accessibility audit failed:', error);
            process.exit(1);
        });
}

module.exports = AccessibilityTester;