const { chromium } = require('playwright');

async function completeSignupTest() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 
    });
    
    const page = await browser.newPage();
    
    try {
        console.log('🚀 Starting complete signup test...');
        
        // Generate test user
        const timestamp = Date.now();
        const testUser = {
            firstName: 'Test',
            lastName: 'User',
            email: `playwright.test.${timestamp}@example.com`,
            phone: '555-123-4567',
            businessName: `Test Business ${timestamp}`,
            businessType: 'restaurant',
            address: '123 Test Street',
            city: 'Test City',
            state: 'CA',
            zip: '90210',
            password: 'TestPassword123!'
        };
        
        console.log('📧 Test user email:', testUser.email);
        
        // Navigate and open modal
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
        
        await page.locator('button:has-text("Get Started")').click();
        await page.waitForSelector('#sign-up-modal', { state: 'visible' });
        
        console.log('📝 Filling out signup form...');
        
        // Fill personal info
        await page.fill('input[name="firstName"]', testUser.firstName);
        await page.fill('input[name="lastName"]', testUser.lastName);
        await page.fill('#signup-email', testUser.email);
        await page.fill('input[name="phone"]', testUser.phone);
        
        // Fill business info
        await page.fill('input[name="businessName"]', testUser.businessName);
        await page.selectOption('select[name="businessType"]', testUser.businessType);
        await page.fill('input[name="address"]', testUser.address);
        await page.fill('input[name="city"]', testUser.city);
        await page.fill('input[name="state"]', testUser.state);
        await page.fill('input[name="zip"]', testUser.zip);
        
        // Fill passwords
        await page.fill('#signup-password', testUser.password);
        await page.fill('#signup-confirm-password', testUser.password);
        
        // Accept terms
        await page.check('input[name="terms"]');
        
        console.log('🎯 Form completed, taking screenshot...');
        await page.screenshot({ path: 'signup-form-ready.png' });
        
        // Submit form
        const submitButton = page.locator('#sign-up-modal button[type="submit"]');
        await submitButton.scrollIntoViewIfNeeded();
        await submitButton.click();
        
        console.log('🚀 Form submitted, waiting for result...');
        
        // Wait for either success (redirect to editor) or error
        try {
            await Promise.race([
                page.waitForURL('**/editor.html', { timeout: 15000 }),
                page.waitForSelector('.error-message, [class*="error"]', { timeout: 15000 }),
                page.waitForSelector('.alert-danger', { timeout: 15000 })
            ]);
        } catch (e) {
            console.log('⏰ Timeout waiting for response, checking current state...');
        }
        
        const finalUrl = page.url();
        console.log('📍 Final URL:', finalUrl);
        
        if (finalUrl.includes('editor.html')) {
            console.log('🎉 SUCCESS: User registration and redirect worked!');
            await page.screenshot({ path: 'signup-success.png' });
        } else {
            console.log('❌ ISSUE: Still on landing page');
            
            // Check for error messages
            const errorElements = await page.locator('.error-message, [class*="error"], .alert-danger').all();
            for (let error of errorElements) {
                const text = await error.textContent();
                if (text && text.trim()) {
                    console.log('🚨 Error found:', text.trim());
                }
            }
            
            await page.screenshot({ path: 'signup-failed.png' });
        }
        
    } catch (error) {
        console.error('🚨 Complete signup test failed:', error.message);
        await page.screenshot({ path: 'signup-test-error.png' });
    } finally {
        setTimeout(() => browser.close(), 5000);
        console.log('🏁 Complete signup test finished');
    }
}

completeSignupTest().catch(console.error);