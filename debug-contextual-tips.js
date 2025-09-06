const { chromium } = require('playwright');

async function debugContextualTips() {
    console.log('🔍 Debugging contextual tips display...');
    
    const browser = await chromium.launch({ 
        headless: false, 
        slowMo: 500 
    });
    
    const page = await browser.newPage();
    
    // Listen to console messages
    page.on('console', msg => {
        console.log(`🖥️  Console [${msg.type()}]:`, msg.text());
    });
    
    try {
        // Navigate to the editor
        console.log('📍 Navigating to editor...');
        await page.goto('http://localhost:3000/editor.html');
        
        // Wait for initial load
        await page.waitForTimeout(3000);
        
        // Check if contextual tips element exists
        const tipsElement = await page.locator('#contextual-tips');
        const isVisible = await tipsElement.isVisible();
        console.log('🎯 Contextual tips element visible:', isVisible);
        
        if (isVisible) {
            // Get the tip content
            const titleText = await page.textContent('.tip-title');
            const descText = await page.textContent('.tip-description');
            
            console.log('📝 Tip content:');
            console.log('  Title:', titleText || '[EMPTY]');
            console.log('  Description:', descText || '[EMPTY]');
            
            // Get the tip position and size
            const bbox = await tipsElement.boundingBox();
            console.log('📐 Tip position/size:', bbox);
        }
        
        // Wait a bit longer to see what happens
        console.log('⏳ Waiting 10 seconds for observation...');
        await page.waitForTimeout(10000);
        
    } catch (error) {
        console.error('❌ Error during debugging:', error.message);
    }
    
    await browser.close();
    console.log('🏁 Debug complete');
}

// Run the debug
debugContextualTips().catch(console.error);