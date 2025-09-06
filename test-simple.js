const { chromium } = require('playwright');

async function simpleTest() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 2000 
    });
    
    const page = await browser.newPage();
    
    try {
        console.log('🌐 Navigating to landing page...');
        await page.goto('http://localhost:3000');
        
        // Wait for page to load
        await page.waitForLoadState('networkidle');
        
        // Take screenshot of landing page
        await page.screenshot({ path: 'landing-page.png' });
        console.log('📸 Screenshot saved: landing-page.png');
        
        // Find and click Get Started button
        console.log('🔍 Looking for Get Started button...');
        const buttons = await page.locator('button').all();
        console.log(`Found ${buttons.length} buttons on page`);
        
        let foundButton = false;
        for (let i = 0; i < buttons.length; i++) {
            const text = await buttons[i].textContent();
            console.log(`Button ${i}: "${text}"`);
            if (text && (text.includes('Get Started') || text.includes('Free Trial'))) {
                console.log(`✅ Clicking button: "${text}"`);
                await buttons[i].click();
                foundButton = true;
                break;
            }
        }
        
        if (!foundButton) {
            console.log('❌ No Get Started button found');
            await browser.close();
            return;
        }
        
        // Wait a moment for modal to appear
        await page.waitForTimeout(2000);
        
        // Check if modal appeared
        const modal = await page.locator('#sign-up-modal').first();
        const isVisible = await modal.isVisible();
        console.log('🔍 Modal visible:', isVisible);
        
        if (isVisible) {
            await page.screenshot({ path: 'modal-visible.png' });
            console.log('📸 Modal screenshot saved: modal-visible.png');
            
            // Check form fields
            const fields = [
                'input[name="firstName"]',
                'input[name="lastName"]', 
                '#signup-email',
                '#signup-password'
            ];
            
            for (let field of fields) {
                const element = await page.locator(field).first();
                const exists = await element.count() > 0;
                const visible = exists ? await element.isVisible() : false;
                console.log(`Field ${field}: exists=${exists}, visible=${visible}`);
            }
        } else {
            await page.screenshot({ path: 'modal-not-visible.png' });
            console.log('📸 Screenshot saved: modal-not-visible.png');
        }
        
    } catch (error) {
        console.error('🚨 Error:', error);
        await page.screenshot({ path: 'error.png' });
    } finally {
        setTimeout(async () => {
            await browser.close();
            console.log('🏁 Test completed');
        }, 5000); // Give 5 seconds to view results
    }
}

simpleTest().catch(console.error);