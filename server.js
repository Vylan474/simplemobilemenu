const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.static('./')); // Serve static files from current directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

// Simple file-based storage for now (easy to migrate to database later)
const MENUS_DIR = path.join(__dirname, 'menus');
const USERS_DIR = path.join(__dirname, 'users');
const UPLOADS_DIR = path.join(__dirname, 'uploads', 'backgrounds');

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
    
    try {
        await fs.access(UPLOADS_DIR);
    } catch {
        await fs.mkdir(UPLOADS_DIR, { recursive: true });
    }
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: timestamp + random + original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'bg-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Check file type
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

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
        console.log('Received menu data:', req.body);
        const { slug, title, subtitle, sections, menuId, backgroundType, backgroundValue, fontFamily, colorPalette, navigationTheme, menuLogo, logoSize, uploadedBackgrounds } = req.body;
        
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
        
        // Load existing menu data to preserve uploadedBackgrounds
        let existingMenuData = {};
        if (menuId) {
            try {
                const existingMenuPath = path.join(MENUS_DIR, `${slug}.json`);
                const existingData = await fs.readFile(existingMenuPath, 'utf8');
                existingMenuData = JSON.parse(existingData);
            } catch (error) {
                // Menu doesn't exist yet, that's fine
            }
        }
        
        const menuData = {
            id: finalMenuId,
            slug,
            title,
            subtitle,
            sections,
            backgroundType: backgroundType || 'none',
            backgroundValue: backgroundValue || null,
            fontFamily: fontFamily || 'Inter',
            colorPalette: colorPalette || 'classic',
            navigationTheme: navigationTheme || 'modern',
            menuLogo: menuLogo || null,
            logoSize: logoSize || 'medium',
            uploadedBackgrounds: (uploadedBackgrounds && uploadedBackgrounds.length > 0) ? uploadedBackgrounds : (existingMenuData.uploadedBackgrounds || []),
            publishedAt: existingMenuData.publishedAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: '1.0'
        };
        
        console.log('Saving menu data to file:', menuData);
        
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

// Get menu by slug (must be before specific background route)
app.get('/api/menu/:slug', async (req, res, next) => {
    // Skip if this is actually a backgrounds request
    if (req.url.endsWith('/backgrounds')) {
        return next();
    }
    
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

// Get uploaded backgrounds for a menu  
app.get('/api/menu/:slug/backgrounds', async (req, res) => {
    try {
        const slug = req.params.slug.toLowerCase();
        
        if (!validateSlug(slug)) {
            return res.status(400).json({ error: 'Invalid slug' });
        }
        
        const menuPath = path.join(MENUS_DIR, `${slug}.json`);
        const menuData = JSON.parse(await fs.readFile(menuPath, 'utf8'));
        
        res.json({
            backgrounds: menuData.uploadedBackgrounds || [],
            currentBackground: menuData.backgroundValue
        });
        
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ error: 'Menu not found' });
        } else {
            console.error('Error loading menu backgrounds:', error);
            res.status(500).json({ error: 'Failed to load backgrounds' });
        }
    }
});

// Background image upload endpoint
app.post('/api/upload-background', upload.single('background'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const { slug } = req.body;
        
        // Return the URL where the file can be accessed
        const fileUrl = `/uploads/backgrounds/${req.file.filename}`;
        
        console.log('Background uploaded:', req.file.filename);
        
        // If slug is provided, update the menu's uploadedBackgrounds array
        if (slug) {
            try {
                const menuPath = path.join(MENUS_DIR, `${slug}.json`);
                const menuData = JSON.parse(await fs.readFile(menuPath, 'utf8'));
                
                // Add new upload to the beginning of the array
                if (!menuData.uploadedBackgrounds) {
                    menuData.uploadedBackgrounds = [];
                }
                
                const newBackground = {
                    url: fileUrl,
                    filename: req.file.filename,
                    uploadedAt: new Date().toISOString()
                };
                
                // Remove if already exists (to avoid duplicates)
                menuData.uploadedBackgrounds = menuData.uploadedBackgrounds.filter(bg => bg.url !== fileUrl);
                
                // Add to beginning and keep only last 3
                menuData.uploadedBackgrounds.unshift(newBackground);
                menuData.uploadedBackgrounds = menuData.uploadedBackgrounds.slice(0, 3);
                
                menuData.updatedAt = new Date().toISOString();
                
                // Save updated menu data
                await fs.writeFile(menuPath, JSON.stringify(menuData, null, 2));
            } catch (error) {
                console.error('Error updating menu uploadedBackgrounds:', error);
            }
        }
        
        res.json({ 
            success: true, 
            url: fileUrl,
            filename: req.file.filename
        });
        
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to upload image' 
        });
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