const { chromium } = require('playwright');
const config = require('./test-config');

/**
 * Helper function for retry logic with exponential backoff
 */
async function retryOperation(operation, maxRetries = config.retry.maxRetries, baseDelay = config.retry.delay) {
    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            if (i === maxRetries) {
                throw error;
            }
            
            const delay = baseDelay * Math.pow(config.retry.backoff, i);
            console.log(`  ⚠️ Retry ${i + 1}/${maxRetries}: ${error.message} (waiting ${delay}ms)`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

/**
 * Create optimized browser instance
 */
async function createOptimizedBrowser() {
    return await chromium.launch(config.browserConfig);
}

/**
 * Create optimized page with proper timeout configuration
 */
async function createOptimizedPage(browser) {
    const context = await browser.newContext(config.contextConfig);
    const page = await context.newPage();
    
    // Set optimized timeouts
    page.setDefaultTimeout(config.timeouts.element);
    page.setDefaultNavigationTimeout(config.timeouts.navigation);
    
    return page;
}

/**
 * Enhanced element interaction with automatic retry
 */
async function safeClick(page, selector, options = {}) {
    return await retryOperation(async () => {
        await page.locator(selector).click(options);
    });
}

/**
 * Enhanced form filling with automatic retry
 */
async function safeFill(page, selector, value, options = {}) {
    return await retryOperation(async () => {
        await page.fill(selector, value, { ...options, timeout: config.timeouts.form });
    });
}

/**
 * Enhanced element waiting with proper timeout
 */
async function safeWaitForSelector(page, selector, options = {}) {
    return await retryOperation(async () => {
        return await page.waitForSelector(selector, {
            timeout: config.timeouts.element,
            ...options
        });
    });
}

/**
 * Navigate to page with optimized settings
 */
async function safeNavigate(page, url, options = {}) {
    return await retryOperation(async () => {
        await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: config.timeouts.navigation,
            ...options
        });
    });
}

/**
 * API request with timeout and retry
 */
async function safeApiRequest(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeouts.api);
    
    try {
        const response = await fetch(url, {
            signal: controller.signal,
            ...options
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

/**
 * Wait for either element to appear or disappear
 */
async function waitForElementState(page, selector, state, timeout = config.timeouts.element) {
    try {
        if (state === 'visible') {
            await page.waitForSelector(selector, { state: 'visible', timeout });
        } else if (state === 'hidden') {
            await page.waitForSelector(selector, { state: 'hidden', timeout });
        }
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Enhanced modal interaction helper
 */
async function handleModal(page, modalSelector, actionCallback, timeout = config.timeouts.modal) {
    await safeWaitForSelector(page, modalSelector, { state: 'visible', timeout });
    
    if (actionCallback) {
        await actionCallback();
    }
    
    // Wait for modal to close
    await safeWaitForSelector(page, modalSelector, { state: 'hidden', timeout });
}

/**
 * Test timeout wrapper to prevent indefinite hanging
 */
function withTestTimeout(testFunction, timeoutMs = config.timeouts.test) {
    return async (...args) => {
        return new Promise(async (resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(`Test timed out after ${timeoutMs}ms`));
            }, timeoutMs);
            
            try {
                const result = await testFunction(...args);
                clearTimeout(timeoutId);
                resolve(result);
            } catch (error) {
                clearTimeout(timeoutId);
                reject(error);
            }
        });
    };
}

/**
 * Batch operations with concurrency control
 */
async function batchOperations(operations, maxConcurrency = 3) {
    const results = [];
    
    for (let i = 0; i < operations.length; i += maxConcurrency) {
        const batch = operations.slice(i, i + maxConcurrency);
        const batchResults = await Promise.allSettled(
            batch.map(op => typeof op === 'function' ? op() : op)
        );
        results.push(...batchResults);
    }
    
    return results;
}

/**
 * Screenshot with error handling
 */
async function safeScreenshot(page, path, options = {}) {
    try {
        await page.screenshot({ path, ...options });
        console.log(`📸 Screenshot saved: ${path}`);
    } catch (error) {
        console.log(`⚠️ Screenshot failed: ${error.message}`);
    }
}

/**
 * Clean browser closure
 */
async function cleanupBrowser(browser) {
    if (browser) {
        try {
            await browser.close();
            console.log('🧹 Browser closed cleanly');
        } catch (error) {
            console.error('Error closing browser:', error.message);
        }
    }
}

module.exports = {
    retryOperation,
    createOptimizedBrowser,
    createOptimizedPage,
    safeClick,
    safeFill,
    safeWaitForSelector,
    safeNavigate,
    safeApiRequest,
    waitForElementState,
    handleModal,
    withTestTimeout,
    batchOperations,
    safeScreenshot,
    cleanupBrowser,
    config
};