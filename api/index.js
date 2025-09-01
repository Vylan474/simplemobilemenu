const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.static('./')); // Serve static files from current directory

// Import all existing API routes
const initDbHandler = require('./init-db');
const statusHandler = require('./status');

// Auth routes
const loginHandler = require('./auth/login');
const registerHandler = require('./auth/register');
const verifyHandler = require('./auth/verify');
const googleHandler = require('./auth/google');

// Menu routes
const createMenuHandler = require('./menu/create');
const listMenuHandler = require('./menu/list');
const updateMenuHandler = require('./menu/update');
const deleteMenuHandler = require('./menu/delete');
const publishMenuHandler = require('./menu/publish');
const checkAvailabilityHandler = require('./menu/check-availability');
const getPublishedHandler = require('./menu/get-published');

// Admin routes
const adminUsersHandler = require('./admin/users');

// API Routes - wrap each handler to work with Express
app.post('/api/init-db', (req, res) => initDbHandler(req, res));
app.get('/api/status', (req, res) => statusHandler(req, res));

// Auth routes
app.post('/api/auth/login', (req, res) => loginHandler(req, res));
app.post('/api/auth/register', (req, res) => registerHandler(req, res));
app.get('/api/auth/verify', (req, res) => verifyHandler(req, res));
app.post('/api/auth/google', (req, res) => googleHandler(req, res));

// Menu routes
app.post('/api/menu/create', (req, res) => createMenuHandler(req, res));
app.get('/api/menu/list', (req, res) => listMenuHandler(req, res));
app.put('/api/menu/update', (req, res) => updateMenuHandler(req, res));
app.delete('/api/menu/delete', (req, res) => deleteMenuHandler(req, res));
app.post('/api/menu/publish', (req, res) => publishMenuHandler(req, res));
app.post('/api/menu/check-availability', (req, res) => checkAvailabilityHandler(req, res));
app.get('/api/menu/get-published', (req, res) => getPublishedHandler(req, res));

// Admin routes
app.post('/api/admin/users', (req, res) => adminUsersHandler(req, res));

// Validate menu slug (URL-safe)
function validateSlug(slug) {
    return /^[a-z0-9-]+$/.test(slug) && slug.length >= 3 && slug.length <= 50;
}

// Serve published menu pages
app.get('/menu/:slug', async (req, res) => {
    try {
        const slug = req.params.slug.toLowerCase();
        
        if (!validateSlug(slug)) {
            return res.status(400).send('Invalid menu URL');
        }
        
        // Serve the published menu page
        const publishedMenuHTML = await fs.readFile(path.join(process.cwd(), 'published-menu.html'), 'utf8');
        const customizedHTML = publishedMenuHTML.replace('{{MENU_SLUG}}', slug);
        
        res.setHeader('Content-Type', 'text/html');
        res.send(customizedHTML);
        
    } catch (error) {
        console.error('Error serving menu:', error);
        res.status(500).send('Server error');
    }
});

// Serve the editor
app.get('/', async (req, res) => {
    try {
        const html = await fs.readFile(path.join(process.cwd(), 'index.html'), 'utf8');
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (error) {
        console.error('Error serving index:', error);
        res.status(500).send('Server error');
    }
});

// Serve the admin portal
app.get('/admin', async (req, res) => {
    try {
        const html = await fs.readFile(path.join(process.cwd(), 'admin.html'), 'utf8');
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (error) {
        console.error('Error serving admin:', error);
        res.status(500).send('Server error');
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

module.exports = app;