// Test configuration for performance-optimized testing
module.exports = {
    // Timeout configurations (in milliseconds)
    timeouts: {
        navigation: 30000,      // 30s for page loads
        element: 8000,          // 8s for element waits
        modal: 5000,            // 5s for modal operations
        form: 3000,             // 3s for form operations
        api: 15000,             // 15s for API calls
        test: 180000,           // 3 minutes total test timeout
        short: 2000,            // 2s for quick operations
        long: 45000             // 45s for complex operations like publishing
    },

    // Browser configuration for optimal performance
    browserConfig: {
        headless: false,
        timeout: 30000,
        args: [
            '--start-maximized',
            '--disable-web-security',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
            '--disable-renderer-backgrounding',
            '--disable-backgrounding-occluded-windows',
            '--disable-background-timer-throttling'
        ]
    },

    // Context configuration for better performance
    contextConfig: {
        ignoreHTTPSErrors: true,
        // Disable images and CSS for faster loading during API tests
        // Can be overridden per test
        userAgent: 'Mozilla/5.0 (Test Runner) Chrome/120.0.0.0'
    },

    // Retry configuration
    retry: {
        maxRetries: 2,
        delay: 1000,
        backoff: 1.5 // Exponential backoff multiplier
    },

    // Performance optimization flags
    performance: {
        parallelOperations: true,
        fastFailOnCritical: true,
        skipNonEssentialScreenshots: false,
        enableNetworkOptimization: true
    },

    // Test data generators
    generateTestUser: (timestamp = Date.now()) => ({
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
    }),

    // Sample menu data for testing
    sampleMenuData: {
        sections: [
            {
                name: 'Appetizers',
                type: 'appetizers',
                items: [
                    { name: 'Crispy Calamari', description: 'Fresh squid rings with marinara sauce', price: '12.99' },
                    { name: 'Truffle Arancini', description: 'Risotto balls with truffle oil and parmesan', price: '14.99' }
                ]
            },
            {
                name: 'Main Courses',
                type: 'mains',
                items: [
                    { name: 'Grilled Salmon', description: 'Atlantic salmon with lemon herb butter', price: '28.99' },
                    { name: 'Ribeye Steak', description: '12oz prime cut with garlic mashed potatoes', price: '36.99' }
                ]
            }
        ]
    }
};