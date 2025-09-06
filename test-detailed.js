const { chromium } = require('playwright');

async function detailedTest() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 
    });
    
    const page = await browser.newPage();
    
    try {
        console.log('🌐 Navigating to landing page...');
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
        
        // Click Get Started
        const getStartedButton = page.locator('button:has-text("Get Started")');
        await getStartedButton.click();
        await page.waitForSelector('#sign-up-modal', { state: 'visible' });
        
        console.log('🔍 Modal opened, checking all form fields...');
        
        // Check all form fields with detailed information
        const fields = [
            'input[name="firstName"]',
            'input[name="lastName"]', 
            '#signup-email',
            'input[name="phone"]',
            'input[name="businessName"]',
            'select[name="businessType"]',
            'input[name="address"]',
            'input[name="city"]',
            'input[name="state"]',
            'input[name="zip"]',
            '#signup-password',
            '#signup-confirm-password'
        ];
        
        for (let fieldSelector of fields) {
            const element = page.locator(fieldSelector).first();
            const count = await element.count();
            
            if (count > 0) {
                const isVisible = await element.isVisible();
                const boundingBox = await element.boundingBox();
                const isInViewport = boundingBox && 
                    boundingBox.y >= 0 && 
                    boundingBox.y <= await page.evaluate(() => window.innerHeight);
                
                console.log(`${fieldSelector}: visible=${isVisible}, inViewport=${isInViewport}, bbox=${JSON.stringify(boundingBox)}`);
            } else {
                console.log(`${fieldSelector}: NOT FOUND`);
            }
        }
        
        // Check modal dimensions and scroll
        const modalInfo = await page.evaluate(() => {
            const modal = document.getElementById('sign-up-modal');
            const modalContent = modal ? modal.querySelector('.modal-content') : null;
            return {
                modalVisible: modal ? window.getComputedStyle(modal).display !== 'none' : false,
                modalHeight: modal ? modal.scrollHeight : null,
                modalScrollTop: modal ? modal.scrollTop : null,
                contentHeight: modalContent ? modalContent.scrollHeight : null,
                windowHeight: window.innerHeight
            };
        });
        
        console.log('📏 Modal dimensions:', modalInfo);
        
        // Try scrolling the modal to see more fields
        await page.evaluate(() => {
            const modal = document.getElementById('sign-up-modal');
            if (modal) {
                modal.scrollTop = modal.scrollHeight;
            }
        });
        
        console.log('⬇️  Scrolled modal to bottom, checking fields again...');
        
        // Check email and password fields again after scroll
        const emailVisible = await page.locator('#signup-email').isVisible();
        const passwordVisible = await page.locator('#signup-password').isVisible();
        
        console.log(`After scroll - Email visible: ${emailVisible}, Password visible: ${passwordVisible}`);
        
        // Take screenshot after scroll
        await page.screenshot({ path: 'modal-after-scroll.png' });
        
        // Try to fill out the form
        console.log('📝 Attempting to fill form...');
        
        const timestamp = Date.now();
        const testData = {
            firstName: 'Test',
            lastName: 'User',
            email: `test${timestamp}@example.com`,
            phone: '555-123-4567',
            businessName: `Test Business ${timestamp}`,
            address: '123 Test St',
            city: 'Test City',
            state: 'CA',
            zip: '12345',
            password: 'TestPassword123!'
        };
        
        // Fill visible fields first
        await page.fill('input[name="firstName"]', testData.firstName);
        await page.fill('input[name="lastName"]', testData.lastName);
        
        // Try to scroll to and fill email
        const emailField = page.locator('#signup-email');
        await emailField.scrollIntoViewIfNeeded();
        await emailField.fill(testData.email);
        
        // Fill other fields
        await page.fill('input[name="phone"]', testData.phone);
        await page.fill('input[name="businessName"]', testData.businessName);
        await page.selectOption('select[name="businessType"]', 'restaurant');
        await page.fill('input[name="address"]', testData.address);
        await page.fill('input[name="city"]', testData.city);
        await page.fill('input[name="state"]', testData.state);
        await page.fill('input[name="zip"]', testData.zip);
        
        // Scroll to password fields
        const passwordField = page.locator('#signup-password');
        await passwordField.scrollIntoViewIfNeeded();
        await passwordField.fill(testData.password);
        await page.fill('#signup-confirm-password', testData.password);
        
        // Accept terms
        await page.check('input[name="terms"]');
        
        console.log('✅ Form filled, taking screenshot...');
        await page.screenshot({ path: 'form-completed.png' });
        
        // Submit form
        const submitButton = page.locator('#sign-up-modal button[type="submit"]');
        await submitButton.scrollIntoViewIfNeeded();
        await submitButton.click();
        
        console.log('🚀 Form submitted, waiting for response...');
        
        // Wait for either success or error
        await Promise.race([
            page.waitForURL('**/editor.html', { timeout: 10000 }),
            page.waitForSelector('.error-message, [class*="error"]', { timeout: 10000 })
        ]);
        
        await page.screenshot({ path: 'final-result.png' });
        console.log('📍 Final URL:', page.url());
        
    } catch (error) {
        console.error('🚨 Test error:', error);
        await page.screenshot({ path: 'error-detailed.png' });
    } finally {
        setTimeout(async () => {
            await browser.close();
            console.log('🏁 Detailed test completed');
        }, 5000);
    }
}

detailedTest().catch(console.error);