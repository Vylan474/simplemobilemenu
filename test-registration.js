const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false, slowMo: 1000 });
    const page = await browser.newPage();
    
    try {
        console.log('🔍 Testing complete user registration workflow...');
        
        // Navigate to the editor page
        await page.goto('http://localhost:3000/editor.html');
        await page.waitForTimeout(2000);
        
        // Verify auth modal is visible
        const authModal = page.locator('#auth-modal');
        await authModal.waitFor({ state: 'visible', timeout: 5000 });
        console.log('✅ Auth modal is visible');
        
        // Switch to signup form
        await page.click('text=Create one');
        await page.waitForTimeout(500);
        
        const registerForm = page.locator('#register-form');
        await registerForm.waitFor({ state: 'visible', timeout: 3000 });
        console.log('✅ Signup form is visible');
        
        // Fill in registration form
        const timestamp = Date.now();
        const testEmail = `testuser${timestamp}@example.com`;
        
        await page.fill('#register-name', 'Test User');
        await page.fill('#register-email', testEmail);
        await page.fill('#register-restaurant', 'Test Restaurant');
        await page.fill('#register-password', 'testpassword123');
        
        console.log('✅ Registration form filled with test data');
        
        // Submit registration
        await page.click('#register-btn');
        console.log('📤 Registration form submitted');
        
        // Wait for registration to complete and modal to close
        try {
            await authModal.waitFor({ state: 'hidden', timeout: 10000 });
            console.log('✅ Auth modal closed after registration');
            
            // Check if we're now in the authenticated state
            const userNameElement = page.locator('#user-name');
            const userName = await userNameElement.textContent({ timeout: 5000 });
            console.log('User name in sidebar:', userName);
            
            if (userName && userName.includes('Test User')) {
                console.log('✅ User successfully registered and logged in');
            } else {
                console.log('❌ User registration may have failed - name not updated');
            }
        } catch (error) {
            console.log('❌ Auth modal did not close, checking for error messages...');
            
            const registerError = page.locator('#register-error');
            const errorText = await registerError.textContent();
            if (errorText) {
                console.log('Registration error:', errorText);
            }
        }
        
        // Take screenshot
        await page.screenshot({ path: 'test-registration.png', fullPage: true });
        console.log('Screenshot saved as test-registration.png');
        
    } catch (error) {
        console.error('Test error:', error);
    } finally {
        await browser.close();
    }
})();