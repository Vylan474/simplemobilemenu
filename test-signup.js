const { chromium } = require('playwright');

async function testSignupProcess() {
    const browser = await chromium.launch({ 
        headless: false, // Show browser for debugging
        slowMo: 1000 // Slow down actions to see what's happening
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        console.log('🚀 Starting signup test...');
        
        // Generate random user data
        const timestamp = Date.now();
        const userData = {
            firstName: 'Test',
            lastName: 'User',
            email: `test.user.${timestamp}@example.com`,
            phone: '555-123-4567',
            businessName: `Test Restaurant ${timestamp}`,
            businessType: 'restaurant',
            address: '123 Test St',
            city: 'Test City',
            state: 'CA',
            zip: '12345',
            password: 'TestPassword123!'
        };
        
        console.log('📧 Generated test user:', userData.email);
        
        // Navigate to landing page
        console.log('🌐 Navigating to landing page...');
        await page.goto('http://localhost:3000');
        
        // Wait for page to load and check for errors
        await page.waitForLoadState('networkidle');
        
        // Check console for errors
        const consoleMessages = [];
        page.on('console', msg => {
            console.log(`🖥️  Console [${msg.type()}]: ${msg.text()}`);
            consoleMessages.push({
                type: msg.type(),
                text: msg.text()
            });
        });
        
        // Check for JavaScript errors
        const errors = [];
        page.on('pageerror', error => {
            console.error('🚨 Page Error:', error.message);
            errors.push(error.message);
        });
        
        // Look for Get Started button and click it
        console.log('🔍 Looking for Get Started button...');
        await page.screenshot({ path: 'landing-page.png' });
        
        const getStartedButton = page.locator('button:has-text("Get Started"), button:has-text("Start Free Trial"), button:has-text("Start Your Free Trial")').first();
        
        if (await getStartedButton.isVisible()) {
            console.log('✅ Found Get Started button, clicking...');
            await getStartedButton.click();
        } else {
            console.log('❌ Get Started button not found, trying alternative selectors...');
            // Try clicking any button that might open signup modal
            const buttons = await page.locator('button').all();
            for (let button of buttons) {
                const text = await button.textContent();
                console.log(`Found button: "${text}"`);
                if (text && (text.includes('Get Started') || text.includes('Free Trial') || text.includes('Sign Up'))) {
                    console.log(`Clicking button: "${text}"`);
                    await button.click();
                    break;
                }
            }
        }
        
        // Wait for signup modal to appear
        console.log('⏳ Waiting for signup modal...');
        await page.waitForSelector('#sign-up-modal', { timeout: 5000 });
        
        // Take screenshot of modal
        await page.screenshot({ path: 'signup-modal.png' });
        
        // Fill out the form
        console.log('📝 Filling out signup form...');
        
        // Personal Information
        await page.fill('input[name="firstName"]', userData.firstName);
        await page.fill('input[name="lastName"]', userData.lastName);
        await page.fill('#signup-email', userData.email);
        await page.fill('input[name="phone"]', userData.phone);
        
        // Business Information
        await page.fill('input[name="businessName"]', userData.businessName);
        await page.selectOption('select[name="businessType"]', userData.businessType);
        await page.fill('input[name="address"]', userData.address);
        await page.fill('input[name="city"]', userData.city);
        await page.fill('input[name="state"]', userData.state);
        await page.fill('input[name="zip"]', userData.zip);
        
        // Password
        await page.fill('#signup-password', userData.password);
        await page.fill('#signup-confirm-password', userData.password);
        
        // Take screenshot of filled form
        await page.screenshot({ path: 'form-filled.png' });
        
        // Submit the form
        console.log('🚀 Submitting form...');
        const submitButton = page.locator('#sign-up-modal button[type="submit"], #sign-up-modal button:has-text("Create Account"), #sign-up-modal button:has-text("Sign Up")').first();
        await submitButton.click();
        
        // Wait for either redirect to editor or error message
        console.log('⏳ Waiting for response...');
        
        try {
            // Wait for either success redirect or error message
            await Promise.race([
                // Success case: redirect to editor
                page.waitForURL('**/editor.html', { timeout: 10000 }),
                // Error case: error message appears
                page.waitForSelector('.error-message, .alert-danger, [class*="error"]', { timeout: 10000 })
            ]);
            
            const currentUrl = page.url();
            console.log('📍 Current URL:', currentUrl);
            
            if (currentUrl.includes('editor.html')) {
                console.log('✅ SUCCESS: Redirected to editor page!');
                await page.screenshot({ path: 'success-editor.png' });
            } else {
                console.log('❌ ISSUE: Still on landing page, checking for errors...');
                await page.screenshot({ path: 'after-submit.png' });
                
                // Look for error messages
                const errorMessages = await page.locator('.error-message, .alert-danger, [class*="error"]').all();
                for (let error of errorMessages) {
                    const text = await error.textContent();
                    if (text && text.trim()) {
                        console.log('🚨 Error message found:', text);
                    }
                }
            }
            
        } catch (timeoutError) {
            console.log('⏰ Timeout waiting for response, taking screenshot...');
            await page.screenshot({ path: 'timeout-response.png' });
        }
        
        // Final check for console errors and network issues
        console.log('\n📊 SUMMARY:');
        console.log('Console Errors:', consoleMessages.filter(msg => msg.type === 'error'));
        console.log('Page Errors:', errors);
        console.log('Final URL:', page.url());
        
    } catch (error) {
        console.error('🚨 Test failed with error:', error);
        await page.screenshot({ path: 'test-failure.png' });
    } finally {
        console.log('🏁 Test completed, closing browser...');
        await browser.close();
    }
}

// Run the test
testSignupProcess().catch(console.error);