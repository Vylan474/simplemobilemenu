const { chromium } = require('playwright');

async function quickTest() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500 
    });
    
    const page = await browser.newPage();
    
    try {
        console.log('🌐 Going to landing page...');
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
        
        // Click Get Started
        await page.locator('button:has-text("Get Started")').click();
        await page.waitForSelector('#sign-up-modal', { state: 'visible' });
        
        // Take screenshot
        await page.screenshot({ path: 'test-after-fix.png' });
        
        // Check key fields
        const fields = [
            { name: 'firstName', selector: 'input[name="firstName"]' },
            { name: 'email', selector: '#signup-email' },
            { name: 'password', selector: '#signup-password' },
            { name: 'confirmPassword', selector: '#signup-confirm-password' }
        ];
        
        for (let field of fields) {
            const element = page.locator(field.selector).first();
            const count = await element.count();
            const isVisible = count > 0 ? await element.isVisible() : false;
            console.log(`${field.name}: found=${count > 0}, visible=${isVisible}`);
        }
        
        // Try to scroll to password field and check again
        const passwordField = page.locator('#signup-password').first();
        if (await passwordField.count() > 0) {
            await passwordField.scrollIntoViewIfNeeded();
            const visibleAfterScroll = await passwordField.isVisible();
            console.log(`Password field after scroll: ${visibleAfterScroll}`);
            
            if (visibleAfterScroll) {
                console.log('✅ SUCCESS: Password field is now visible!');
            } else {
                console.log('❌ ISSUE: Password field still not visible');
            }
        }
        
    } catch (error) {
        console.error('Test error:', error);
    } finally {
        setTimeout(() => browser.close(), 3000);
    }
}

quickTest().catch(console.error);