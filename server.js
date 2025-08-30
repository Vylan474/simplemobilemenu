const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.static('./')); // Serve static files from current directory

// Simple file-based storage for now (easy to migrate to database later)
const MENUS_DIR = path.join(__dirname, 'menus');
const USERS_DIR = path.join(__dirname, 'users');

// Ensure directories exist
async function ensureDirectories() {
    try {
        await fs.access(MENUS_DIR);
    } catch {
        await fs.mkdir(MENUS_DIR, { recursive: true });
    }
    
    try {
        await fs.access(USERS_DIR);
    } catch {
        await fs.mkdir(USERS_DIR, { recursive: true });
    }
}

// Generate unique menu ID
function generateMenuId() {
    return crypto.randomBytes(16).toString('hex');
}

// Validate menu slug (URL-safe)
function validateSlug(slug) {
    return /^[a-z0-9-]+$/.test(slug) && slug.length >= 3 && slug.length <= 50;
}

// Check if slug is available
async function isSlugAvailable(slug) {
    try {
        await fs.access(path.join(MENUS_DIR, `${slug}.json`));
        return false; // File exists, slug is taken
    } catch {
        return true; // File doesn't exist, slug is available
    }
}

// API Routes

// Check slug availability
app.get('/api/check-slug/:slug', async (req, res) => {
    const slug = req.params.slug.toLowerCase();
    
    if (!validateSlug(slug)) {
        return res.json({ 
            available: false, 
            error: 'Invalid slug format' 
        });
    }
    
    try {
        const available = await isSlugAvailable(slug);
        res.json({ available });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Create/Update menu
app.post('/api/menu', async (req, res) => {
    try {
        const { slug, title, subtitle, sections, menuId } = req.body;
        
        if (!slug || !title || !sections) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        if (!validateSlug(slug)) {
            return res.status(400).json({ error: 'Invalid slug format' });
        }
        
        // Check if slug is available (unless updating existing menu)
        if (!menuId) {
            const available = await isSlugAvailable(slug);
            if (!available) {
                return res.status(409).json({ error: 'Slug already taken' });
            }
        }
        
        const finalMenuId = menuId || generateMenuId();
        const menuData = {
            id: finalMenuId,
            slug,
            title,
            subtitle,
            sections,
            publishedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: '1.0'
        };
        
        // Save menu data
        await fs.writeFile(
            path.join(MENUS_DIR, `${slug}.json`), 
            JSON.stringify(menuData, null, 2)
        );
        
        res.json({ 
            success: true, 
            menuId: finalMenuId,
            slug,
            url: `/menu/${slug}`
        });
        
    } catch (error) {
        console.error('Error saving menu:', error);
        res.status(500).json({ error: 'Failed to save menu' });
    }
});

// Get menu by slug
app.get('/api/menu/:slug', async (req, res) => {
    try {
        const slug = req.params.slug.toLowerCase();
        
        if (!validateSlug(slug)) {
            return res.status(400).json({ error: 'Invalid slug' });
        }
        
        const menuPath = path.join(MENUS_DIR, `${slug}.json`);
        const menuData = await fs.readFile(menuPath, 'utf8');
        
        res.json(JSON.parse(menuData));
        
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ error: 'Menu not found' });
        } else {
            console.error('Error loading menu:', error);
            res.status(500).json({ error: 'Failed to load menu' });
        }
    }
});

// Serve the editor
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve published menu pages
app.get('/menu/:slug', async (req, res) => {
    try {
        const slug = req.params.slug.toLowerCase();
        
        if (!validateSlug(slug)) {
            return res.status(400).send('Invalid menu URL');
        }
        
        // Check if menu exists
        const menuPath = path.join(MENUS_DIR, `${slug}.json`);
        try {
            await fs.access(menuPath);
        } catch {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Menu Not Found</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                               text-align: center; padding: 60px 20px; color: #666; }
                        h1 { color: #333; margin-bottom: 20px; }
                        .icon { font-size: 64px; margin-bottom: 20px; }
                    </style>
                </head>
                <body>
                    <div class="icon">🍽️</div>
                    <h1>Menu Not Found</h1>
                    <p>The menu you're looking for doesn't exist or has been moved.</p>
                </body>
                </html>
            `);
        }
        
        // Serve the published menu page
        const publishedMenuHTML = await fs.readFile(path.join(__dirname, 'published-menu.html'), 'utf8');
        const customizedHTML = publishedMenuHTML.replace('{{MENU_SLUG}}', slug);
        
        res.send(customizedHTML);
        
    } catch (error) {
        console.error('Error serving menu:', error);
        res.status(500).send('Server error');
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Start server
async function startServer() {
    await ensureDirectories();
    app.listen(PORT, () => {
        console.log(`🚀 Menu Editor Server running at http://localhost:${PORT}`);
        console.log(`📝 Editor: http://localhost:${PORT}`);
        console.log(`🍽️ Example menu: http://localhost:${PORT}/menu/your-restaurant-name`);
    });
}

startServer().catch(console.error);