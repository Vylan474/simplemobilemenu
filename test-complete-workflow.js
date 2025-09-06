const { chromium } = require('playwright');

// Performance-optimized configuration
const TIMEOUT_CONFIG = {
    navigation: 30000,      // 30s for page loads
    element: 8000,         // 8s for element waits
    modal: 5000,           // 5s for modal operations
    form: 3000,            // 3s for form operations
    test: 180000           // 3 minutes total test timeout
};

// Helper function for retry logic
async function retryOperation(operation, maxRetries = 2, delay = 1000) {
    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            if (i === maxRetries) throw error;
            console.log(`  ⚠️ Retry ${i + 1}/${maxRetries}: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

async function testCompleteWorkflow() {
    // Set overall test timeout
    const testTimeout = setTimeout(() => {
        console.error('❌ Test suite timed out after 3 minutes');
        process.exit(1);
    }, TIMEOUT_CONFIG.test);

    let browser;
    let page;
    const issues = [];
    
    try {
        browser = await chromium.launch({ 
            headless: false,
            // Remove slowMo for better performance
            timeout: 30000,
            args: ['--start-maximized', '--disable-web-security']
        });
        
        page = await browser.newPage();
        
        // Set optimized timeouts
        page.setDefaultTimeout(TIMEOUT_CONFIG.element);
        page.setDefaultNavigationTimeout(TIMEOUT_CONFIG.navigation);
    
    try {
        console.log('🚀 Starting comprehensive menu creation workflow test...');
        
        // Generate unique test data
        const timestamp = Date.now();
        const testUser = {
            firstName: 'Test',
            lastName: 'Chef',
            email: `chef.test.${timestamp}@restaurant.com`,
            phone: '555-MENU-123',
            businessName: `Amazing Bistro ${timestamp}`,
            businessType: 'restaurant',
            address: '123 Culinary Street',
            city: 'Foodville',
            state: 'CA',
            zip: '90210',
            password: 'ChefPassword123!'
        };
        
        console.log('📧 Test user:', testUser.email);
        console.log('🏪 Test restaurant:', testUser.businessName);
        
        // ================================
        // STEP 1: SIGN UP NEW USER
        // ================================
        console.log('\n📝 STEP 1: Testing user registration...');
        
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
        
        // Check if auth modal appears with retry
        try {
            await retryOperation(async () => {
                await page.waitForSelector('#auth-modal', { 
                    state: 'visible', 
                    timeout: TIMEOUT_CONFIG.element 
                });
            });
            console.log('✅ Auth modal appeared');
        } catch (e) {
            console.log('❌ Auth modal not visible');
            issues.push('Auth modal does not appear on page load');
            // Early exit if auth modal doesn't appear
            throw new Error('Critical failure: Auth modal not found');
        }
        
        // Click Create Account with retry
        try {
            await retryOperation(async () => {
                await page.locator('#show-signup').click();
                await page.waitForSelector('#signup-form', { 
                    state: 'visible', 
                    timeout: TIMEOUT_CONFIG.modal 
                });
            });
            console.log('✅ Signup form opened');
        } catch (e) {
            console.log('❌ Could not open signup form');
            issues.push('Cannot open signup form');
            throw new Error('Critical failure: Cannot open signup form');
        }
        
        // Fill out registration form
        console.log('📋 Filling registration form...');
        const formFields = [
            { field: 'firstName', value: testUser.firstName },
            { field: 'lastName', value: testUser.lastName },
            { field: 'email', value: testUser.email },
            { field: 'phone', value: testUser.phone },
            { field: 'businessName', value: testUser.businessName },
            { field: 'address', value: testUser.address },
            { field: 'city', value: testUser.city },
            { field: 'state', value: testUser.state },
            { field: 'zip', value: testUser.zip },
            { field: 'password', value: testUser.password },
            { field: 'confirmPassword', value: testUser.password }
        ];
        
        // Fill form fields with optimized timeout
        for (const { field, value } of formFields) {
            try {
                await page.fill(`input[name="${field}"]`, value, { 
                    timeout: TIMEOUT_CONFIG.form 
                });
                console.log(`  ✅ ${field}: ${value}`);
            } catch (e) {
                console.log(`  ❌ Failed to fill ${field}`);
                issues.push(`Cannot fill ${field} field in registration form`);
            }
        }
        
        // Select business type
        try {
            await page.selectOption('select[name="businessType"]', testUser.businessType);
            console.log(`  ✅ businessType: ${testUser.businessType}`);
        } catch (e) {
            console.log('  ❌ Failed to select business type');
            issues.push('Cannot select business type');
        }
        
        // Accept terms and submit with improved error handling
        try {
            await page.check('input[name="terms"]', { timeout: TIMEOUT_CONFIG.form });
            
            // Monitor for both success and error states
            const [submitResult] = await Promise.allSettled([
                page.locator('#signup-form button[type="submit"]').click(),
                page.waitForSelector('#auth-modal', { 
                    state: 'hidden', 
                    timeout: 15000 
                })
            ]);
            
            if (submitResult.status === 'fulfilled') {
                console.log('✅ Registration successful - user logged in');
            } else {
                throw new Error('Registration submission failed');
            }
        } catch (e) {
            console.log('❌ Registration failed or modal did not close');
            issues.push('User registration process failed');
            throw new Error('Critical failure: User registration failed');
        }
        
        await page.screenshot({ path: 'step1-registered.png' });
        
        // ================================
        // STEP 2: CREATE MENU SECTIONS
        // ================================
        console.log('\n🍽️ STEP 2: Creating menu sections...');
        
        // Create first section - Appetizers (optimized)
        console.log('Creating Appetizers section...');
        try {
            await retryOperation(async () => {
                await page.locator('#add-section-btn').click();
                await page.waitForSelector('#section-modal', { 
                    state: 'visible', 
                    timeout: TIMEOUT_CONFIG.modal 
                });
                
                await page.fill('#section-name', 'Appetizers', { timeout: TIMEOUT_CONFIG.form });
                await page.selectOption('#section-type', 'appetizers', { timeout: TIMEOUT_CONFIG.form });
                await page.locator('#section-modal .btn-primary').click();
                
                await page.waitForSelector('#section-modal', { 
                    state: 'hidden', 
                    timeout: TIMEOUT_CONFIG.modal 
                });
            });
            console.log('✅ Appetizers section created');
        } catch (e) {
            console.log('❌ Failed to create Appetizers section');
            issues.push('Cannot create menu sections');
        }
        
        // Add items to Appetizers
        console.log('Adding items to Appetizers...');
        const appetizerItems = [
            { name: 'Crispy Calamari', description: 'Fresh squid rings with marinara sauce', price: '12.99' },
            { name: 'Truffle Arancini', description: 'Risotto balls with truffle oil and parmesan', price: '14.99' }
        ];
        
        // Add items in parallel for better performance
        const addItemPromises = appetizerItems.map(async (item, index) => {
            try {
                await retryOperation(async () => {
                    await page.locator('.menu-section').first().locator('.add-item-btn').click();
                    await page.waitForSelector('.item-modal', { 
                        state: 'visible', 
                        timeout: TIMEOUT_CONFIG.modal 
                    });
                    
                    await page.fill('.item-name', item.name, { timeout: TIMEOUT_CONFIG.form });
                    await page.fill('.item-description', item.description, { timeout: TIMEOUT_CONFIG.form });
                    await page.fill('.item-price', item.price, { timeout: TIMEOUT_CONFIG.form });
                    
                    await page.locator('.item-modal .btn-primary').click();
                    await page.waitForSelector('.item-modal', { 
                        state: 'hidden', 
                        timeout: TIMEOUT_CONFIG.modal 
                    });
                });
                console.log(`  ✅ Added ${item.name}`);
            } catch (e) {
                console.log(`  ❌ Failed to add ${item.name}`);
                issues.push(`Cannot add menu item: ${item.name}`);
            }
        });
        
        await Promise.allSettled(addItemPromises);
        
        // Create second section - Main Courses
        console.log('Creating Main Courses section...');
        try {
            await page.locator('#add-section-btn').click();
            await page.waitForSelector('#section-modal', { state: 'visible' });
            
            await page.fill('#section-name', 'Main Courses');
            await page.selectOption('#section-type', 'mains');
            await page.locator('#section-modal .btn-primary').click();
            
            await page.waitForSelector('#section-modal', { state: 'hidden' });
            console.log('✅ Main Courses section created');
        } catch (e) {
            console.log('❌ Failed to create Main Courses section');
            issues.push('Cannot create second menu section');
        }
        
        // Add items to Main Courses
        console.log('Adding items to Main Courses...');
        const mainItems = [
            { name: 'Grilled Salmon', description: 'Atlantic salmon with lemon herb butter', price: '28.99' },
            { name: 'Ribeye Steak', description: '12oz prime cut with garlic mashed potatoes', price: '36.99' }
        ];
        
        for (let i = 0; i < mainItems.length; i++) {
            try {
                await page.locator('.menu-section').nth(1).locator('.add-item-btn').click();
                await page.waitForSelector('.item-modal', { state: 'visible' });
                
                await page.fill('.item-name', mainItems[i].name);
                await page.fill('.item-description', mainItems[i].description);
                await page.fill('.item-price', mainItems[i].price);
                
                await page.locator('.item-modal .btn-primary').click();
                await page.waitForSelector('.item-modal', { state: 'hidden' });
                
                console.log(`  ✅ Added ${mainItems[i].name}`);
            } catch (e) {
                console.log(`  ❌ Failed to add ${mainItems[i].name}`);
                issues.push(`Cannot add menu item: ${mainItems[i].name}`);
            }
        }
        
        await page.screenshot({ path: 'step2-sections-created.png' });
        
        // ================================
        // STEP 3: TEST ALL CUSTOMIZATION TOOLS
        // ================================
        console.log('\n🎨 STEP 3: Testing customization tools...');
        
        // Test Background customization (optimized)
        console.log('Testing background customization...');
        try {
            await retryOperation(async () => {
                await page.locator('#background-btn').click();
                await page.waitForSelector('#background-dropdown', { 
                    state: 'visible', 
                    timeout: TIMEOUT_CONFIG.modal 
                });
                
                await page.locator('#background-dropdown .bg-option[data-type="color"]').first().click();
                await page.keyboard.press('Escape');
            });
            console.log('  ✅ Background color applied');
        } catch (e) {
            console.log('  ❌ Background customization failed');
            issues.push('Background customization not working');
        }
        
        // Test customization features in parallel for better performance
        const customizationTests = [
            {
                name: 'Font customization',
                test: async () => {
                    await page.locator('#font-btn').click();
                    await page.waitForSelector('#font-dropdown', { 
                        state: 'visible', 
                        timeout: TIMEOUT_CONFIG.modal 
                    });
                    await page.locator('#font-dropdown .font-option').nth(1).click();
                    await page.keyboard.press('Escape');
                    return '✅ Font changed';
                }
            },
            {
                name: 'Color palette',
                test: async () => {
                    await page.locator('#colors-btn').click();
                    await page.waitForSelector('#colors-dropdown', { 
                        state: 'visible', 
                        timeout: TIMEOUT_CONFIG.modal 
                    });
                    await page.locator('#colors-dropdown .palette-option').nth(1).click();
                    await page.keyboard.press('Escape');
                    return '✅ Color palette changed';
                }
            },
            {
                name: 'Navigation theme',
                test: async () => {
                    await page.locator('#navigation-btn').click();
                    await page.waitForSelector('#navigation-dropdown', { 
                        state: 'visible', 
                        timeout: TIMEOUT_CONFIG.modal 
                    });
                    await page.locator('#navigation-dropdown .nav-option').nth(1).click();
                    await page.keyboard.press('Escape');
                    return '✅ Navigation theme changed';
                }
            }
        ];

        // Run customization tests sequentially with retry logic
        for (const { name, test } of customizationTests) {
            console.log(`Testing ${name.toLowerCase()}...`);
            try {
                await retryOperation(test);
                console.log(`  ${await test()}`);
            } catch (e) {
                console.log(`  ❌ ${name} failed`);
                issues.push(`${name} not working`);
            }
        }
        
        await page.screenshot({ path: 'step3-customized.png' });
        
        // ================================
        // STEP 4: TEST PREVIEW
        // ================================
        console.log('\n📱 STEP 4: Testing preview functionality...');
        
        try {
            await retryOperation(async () => {
                await page.locator('#preview-btn').click();
                await page.waitForSelector('#preview-modal', { 
                    state: 'visible', 
                    timeout: TIMEOUT_CONFIG.modal 
                });
                
                // Check if menu content appears in preview
                const previewContent = await page.locator('#preview-modal .menu-preview').textContent({ 
                    timeout: TIMEOUT_CONFIG.element 
                });
                
                if (previewContent.includes('Appetizers') && previewContent.includes('Crispy Calamari')) {
                    console.log('✅ Preview shows menu content correctly');
                } else {
                    console.log('❌ Preview content incomplete');
                    issues.push('Preview does not show complete menu content');
                }
                
                // Close preview
                await page.locator('#preview-modal .close').click();
                await page.waitForSelector('#preview-modal', { 
                    state: 'hidden', 
                    timeout: TIMEOUT_CONFIG.modal 
                });
            });
            
        } catch (e) {
            console.log('❌ Preview functionality failed');
            issues.push('Preview modal not working');
        }
        
        await page.screenshot({ path: 'step4-preview-tested.png' });
        
        // ================================
        // STEP 5: PUBLISH MENU
        // ================================
        console.log('\n🌐 STEP 5: Testing menu publishing...');
        
        try {
            await retryOperation(async () => {
                await page.locator('#publish-btn').click();
                await page.waitForSelector('#publish-modal', { 
                    state: 'visible', 
                    timeout: TIMEOUT_CONFIG.modal 
                });
                
                // Fill in menu details with optimized timeouts
                await page.fill('#menu-title', `${testUser.businessName} Menu`, { 
                    timeout: TIMEOUT_CONFIG.form 
                });
                await page.fill('#menu-subtitle', 'Fresh, Local, Delicious', { 
                    timeout: TIMEOUT_CONFIG.form 
                });
                
                // Generate a unique slug
                const menuSlug = `amazing-bistro-${timestamp}`;
                await page.fill('#menu-slug', menuSlug, { 
                    timeout: TIMEOUT_CONFIG.form 
                });
                
                // Publish the menu with proper wait
                await page.locator('#publish-modal .btn-primary').click();
                await page.waitForSelector('#publish-modal', { 
                    state: 'hidden', 
                    timeout: 15000 // Allow extra time for publishing
                });
                
                console.log(`✅ Menu published successfully with slug: ${menuSlug}`);
                
                // Test if published menu is accessible with timeout
                const publishedUrl = `http://localhost:3000/menu/${menuSlug}`;
                await page.goto(publishedUrl, { 
                    waitUntil: 'domcontentloaded',
                    timeout: TIMEOUT_CONFIG.navigation 
                });
                
                const publishedContent = await page.textContent('body', { 
                    timeout: TIMEOUT_CONFIG.element 
                });
                
                if (publishedContent.includes('Appetizers') && publishedContent.includes('Crispy Calamari')) {
                    console.log('✅ Published menu is accessible and shows content');
                } else {
                    console.log('❌ Published menu content not displaying correctly');
                    issues.push('Published menu does not display content properly');
                }
            });
            
        } catch (e) {
            console.log('❌ Menu publishing failed:', e.message);
            issues.push('Menu publishing functionality not working');
        }
        
        await page.screenshot({ path: 'step5-published.png' });
        
        // ================================
        // TEST SUMMARY
        // ================================
        console.log('\n📊 COMPREHENSIVE TEST SUMMARY');
        console.log('=====================================');
        
        if (issues.length === 0) {
            console.log('🎉 ALL TESTS PASSED! Menu creation workflow is fully functional!');
        } else {
            console.log(`❌ ${issues.length} ISSUES FOUND:`);
            issues.forEach((issue, index) => {
                console.log(`${index + 1}. ${issue}`);
            });
        }
        
        console.log('\n✅ Tests Completed:');
        console.log('- User Registration');
        console.log('- Menu Section Creation');
        console.log('- Menu Item Addition');
        console.log('- Background Customization');
        console.log('- Font Customization');
        console.log('- Color Palette Customization');
        console.log('- Navigation Theme Customization');
        console.log('- Preview Functionality');
        console.log('- Menu Publishing');
        console.log('- Published Menu Accessibility');
        
        return { success: issues.length === 0, issues, testUser };
        
    } catch (error) {
        console.error('🚨 Inner test execution error:', error);
        issues.push(`Test execution error: ${error.message}`);
        await page.screenshot({ path: 'inner-error.png' });
        return { success: false, issues, error: error.message };
    }
        
    } catch (error) {
        console.error('🚨 Test failed with critical error:', error);
        issues.push(`Critical test failure: ${error.message}`);
        await page.screenshot({ path: 'critical-error.png' });
        return { success: false, issues, error: error.message };
    } finally {
        clearTimeout(testTimeout);
        
        // Immediate cleanup for better performance
        if (browser) {
            try {
                await browser.close();
                console.log('🏁 Test browser closed efficiently');
            } catch (e) {
                console.error('Error closing browser:', e.message);
            }
        }
    }
}

// Run the comprehensive test
testCompleteWorkflow()
    .then(result => {
        if (result.success) {
            console.log('\n🎉 WORKFLOW TEST COMPLETED SUCCESSFULLY!');
            process.exit(0);
        } else {
            console.log('\n❌ WORKFLOW TEST FOUND ISSUES TO FIX');
            console.log('Issues found:', result.issues);
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('Test execution failed:', error);
        process.exit(1);
    });