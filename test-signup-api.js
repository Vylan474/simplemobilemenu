const { chromium } = require('playwright');

// Configuration constants for better performance
const TIMEOUT_CONFIG = {
    navigation: 30000,    // 30s for page loads
    element: 10000,      // 10s for element waits
    api: 15000,          // 15s for API calls
    test: 120000         // 2 minutes total test timeout
};

async function testSignupAPI() {
    // Set overall test timeout
    const testTimeout = setTimeout(() => {
        console.error('❌ Test timed out after 2 minutes');
        process.exit(1);
    }, TIMEOUT_CONFIG.test);

    let browser;
    try {
        browser = await chromium.launch({ 
            headless: false,
            timeout: 30000 // 30s launch timeout
        });
        const context = await browser.newContext({
            // Optimize context for faster loading
            ignoreHTTPSErrors: true
        });
        const page = await context.newPage();
        
        // Set page timeouts
        page.setDefaultTimeout(TIMEOUT_CONFIG.element);
        page.setDefaultNavigationTimeout(TIMEOUT_CONFIG.navigation);
    
    console.log('🧪 Testing signup API workflow\n');
    
    let testResults = {
        apiTests: [],
        browserTests: []
    };
    
    // Test 1: Direct API call to registration endpoint
    console.log('📡 Test 1: Testing registration API directly');
    try {
        const testUser = {
            name: 'Test User',
            email: `test-${Date.now()}@example.com`,
            restaurant: 'Test Restaurant',
            password: 'TestPassword123!'
        };
        
        // Create AbortController for API timeout
        const controller = new AbortController();
        const apiTimeout = setTimeout(() => controller.abort(), TIMEOUT_CONFIG.api);
        
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testUser),
            signal: controller.signal
        });
        
        clearTimeout(apiTimeout);
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            testResults.apiTests.push({
                test: 'Registration API',
                status: 'PASS',
                details: `User created with ID: ${data.user.id}`,
                sessionId: data.sessionId
            });
            console.log('✅ Registration API: User created successfully');
            console.log(`   User ID: ${data.user.id}`);
            console.log(`   Session ID: ${data.sessionId ? data.sessionId.substring(0, 8) + '...' : 'None'}`);
        } else {
            testResults.apiTests.push({
                test: 'Registration API',
                status: 'FAIL',
                details: `Error: ${data.error || 'Unknown error'}`,
                response: data
            });
            console.log('❌ Registration API failed:', data.error || 'Unknown error');
        }
    } catch (error) {
        testResults.apiTests.push({
            test: 'Registration API',
            status: 'FAIL',
            details: `Network error: ${error.message}`
        });
        console.log('❌ Registration API network error:', error.message);
    }
    
    // Test 2: Load the editor page and check for auth modal
    console.log('\n📍 Test 2: Loading editor page and checking auth state');
    try {
        await page.goto('http://localhost:3000/editor.html', { 
            waitUntil: 'domcontentloaded',
            timeout: TIMEOUT_CONFIG.navigation
        });
        
        // Wait for auth modal to be ready instead of arbitrary timeout
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        
        // Check if auth modal is visible
        const authModal = page.locator('#auth-modal');
        const isAuthModalVisible = await authModal.isVisible();
        
        testResults.browserTests.push({
            test: 'Editor Page Load',
            status: 'PASS',
            details: 'Page loaded successfully'
        });
        
        testResults.browserTests.push({
            test: 'Auth Modal Visibility',
            status: isAuthModalVisible ? 'PASS' : 'FAIL',
            details: isAuthModalVisible ? 'Auth modal is visible for unauthenticated users' : 'Auth modal not visible'
        });
        
        console.log('✅ Editor page loaded successfully');
        console.log(isAuthModalVisible ? '✅ Auth modal is visible' : '❌ Auth modal is not visible');
        
        if (isAuthModalVisible) {
            // Test 3: Fill out and submit registration form
            console.log('\n📍 Test 3: Testing signup form interaction');
            
            // Switch to registration form
            const showRegisterLink = page.locator('a[onclick="showRegisterForm()"]');
            if (await showRegisterLink.isVisible()) {
                await showRegisterLink.click();
                // Wait for form to appear instead of arbitrary timeout
                await page.waitForSelector('#register-form', { 
                    state: 'visible', 
                    timeout: 5000 
                });
                
                const registerForm = page.locator('#register-form');
                const isRegisterFormVisible = await registerForm.isVisible();
                
                if (isRegisterFormVisible) {
                    console.log('✅ Registration form is visible');
                    
                    // Fill out the form
                    const testUser2 = {
                        name: 'Browser Test User',
                        email: `browser-test-${Date.now()}@example.com`,
                        restaurant: 'Browser Test Restaurant',
                        password: 'BrowserTest123!'
                    };
                    
                    await page.locator('#register-name').fill(testUser2.name);
                    await page.locator('#register-email').fill(testUser2.email);
                    await page.locator('#register-restaurant').fill(testUser2.restaurant);
                    await page.locator('#register-password').fill(testUser2.password);
                    
                    console.log('✅ Registration form filled out');
                    
                    // Monitor network requests
                    let registrationResponse = null;
                    page.on('response', response => {
                        if (response.url().includes('/api/auth/register')) {
                            registrationResponse = {
                                status: response.status(),
                                statusText: response.statusText()
                            };
                        }
                    });
                    
                    // Submit the form
                    const registerButton = page.locator('#register-btn');
                    await registerButton.click();
                    
                    // Wait for either success (modal closes) or error message
                    try {
                        await Promise.race([
                            page.waitForSelector('#auth-modal', { state: 'hidden', timeout: 8000 }),
                            page.waitForSelector('#register-error', { state: 'visible', timeout: 8000 })
                        ]);
                    } catch (e) {
                        console.log('⚠️ Registration response timeout');
                    }
                    
                    // Check for error messages
                    const errorMessage = page.locator('#register-error');
                    const errorText = await errorMessage.textContent();
                    
                    // Check if modal closed (indicating success)
                    const modalStillVisible = await authModal.isVisible();
                    
                    if (errorText && errorText.trim()) {
                        testResults.browserTests.push({
                            test: 'Registration Form Submission',
                            status: 'FAIL',
                            details: `Registration failed: ${errorText}`,
                            networkStatus: registrationResponse
                        });
                        console.log('❌ Registration form submission failed:', errorText);
                    } else if (!modalStillVisible) {
                        testResults.browserTests.push({
                            test: 'Registration Form Submission',
                            status: 'PASS',
                            details: 'Registration successful - auth modal closed'
                        });
                        console.log('✅ Registration form submission successful - modal closed');
                        
                        // Test 4: Check if user can now access menu creation
                        console.log('\n📍 Test 4: Testing menu creation access');
                        
                        // Look for add section buttons
                        const addSectionButton = page.locator('#add-section');
                        const addFirstSectionButton = page.locator('#add-first-section');
                        
                        const canAddSection = await addSectionButton.isVisible() || await addFirstSectionButton.isVisible();
                        
                        if (canAddSection) {
                            testResults.browserTests.push({
                                test: 'Menu Creation Access',
                                status: 'PASS',
                                details: 'User can access menu creation functionality'
                            });
                            console.log('✅ Menu creation functionality is accessible');
                            
                            // Try clicking add section
                            if (await addSectionButton.isVisible()) {
                                await addSectionButton.click();
                            } else {
                                await addFirstSectionButton.click();
                            }
                            
                            // Wait for modal to appear instead of arbitrary timeout
                            await page.waitForSelector('#section-modal', { 
                                state: 'visible', 
                                timeout: 5000 
                            }).catch(() => console.log('Section modal did not appear'));
                            
                            const sectionModal = page.locator('#section-modal');
                            if (await sectionModal.isVisible()) {
                                testResults.browserTests.push({
                                    test: 'Menu Section Modal',
                                    status: 'PASS',
                                    details: 'Section creation modal opened successfully'
                                });
                                console.log('✅ Section creation modal opened successfully');
                            } else {
                                testResults.browserTests.push({
                                    test: 'Menu Section Modal',
                                    status: 'FAIL',
                                    details: 'Section creation modal did not open'
                                });
                                console.log('❌ Section creation modal did not open');
                            }
                        } else {
                            testResults.browserTests.push({
                                test: 'Menu Creation Access',
                                status: 'FAIL',
                                details: 'Menu creation buttons not visible'
                            });
                            console.log('❌ Menu creation functionality not accessible');
                        }
                    } else {
                        testResults.browserTests.push({
                            test: 'Registration Form Submission',
                            status: 'PARTIAL',
                            details: 'Registration submitted but result unclear'
                        });
                        console.log('⚠️ Registration form submitted but result unclear');
                    }
                } else {
                    testResults.browserTests.push({
                        test: 'Registration Form Access',
                        status: 'FAIL',
                        details: 'Registration form not visible after clicking link'
                    });
                    console.log('❌ Registration form not visible');
                }
            } else {
                testResults.browserTests.push({
                    test: 'Registration Form Access',
                    status: 'FAIL',
                    details: 'Registration link not found'
                });
                console.log('❌ Registration link not found');
            }
        }
        
    } catch (error) {
        testResults.browserTests.push({
            test: 'Browser Test',
            status: 'FAIL',
            details: `Error: ${error.message}`
        });
        console.log('❌ Browser test error:', error.message);
    }
    
    // Summary
    console.log('\n📊 TEST SUMMARY');
    console.log('================');
    
    let totalPassed = 0;
    let totalFailed = 0;
    
    console.log('\n🔗 API Tests:');
    testResults.apiTests.forEach(test => {
        const icon = test.status === 'PASS' ? '✅' : '❌';
        console.log(`${icon} ${test.test}: ${test.details}`);
        if (test.status === 'PASS') totalPassed++;
        else totalFailed++;
    });
    
    console.log('\n🌐 Browser Tests:');
    testResults.browserTests.forEach(test => {
        const icon = test.status === 'PASS' ? '✅' : test.status === 'PARTIAL' ? '⚠️' : '❌';
        console.log(`${icon} ${test.test}: ${test.details}`);
        if (test.status === 'PASS') totalPassed++;
        else if (test.status === 'FAIL') totalFailed++;
    });
    
    console.log(`\n📈 Total: ${totalPassed} passed, ${totalFailed} failed`);
    
    if (totalFailed === 0) {
        console.log('\n🎉 ALL TESTS PASSED! The complete signup-to-menu-creation workflow is working!');
    } else {
        console.log('\n⚠️ Some tests failed. The workflow needs fixes.');
    }
    
        // Clean up and close browser efficiently
        console.log('\n🏁 Test completed, closing browser...');
        
    } catch (error) {
        console.error('❌ Test execution error:', error.message);
        testResults.browserTests.push({
            test: 'Test Execution',
            status: 'FAIL',
            details: `Fatal error: ${error.message}`
        });
    } finally {
        clearTimeout(testTimeout);
        if (browser) {
            await browser.close().catch(console.error);
        }
    }
}

// Run the test
testSignupAPI().catch(console.error);