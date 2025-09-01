const fs = require('fs').promises;
const path = require('path');

module.exports = async function handler(req, res) {
  const { slug } = req.query;
  
  // Validate slug format
  if (!slug || !/^[a-z0-9-]+$/.test(slug) || slug.length < 3 || slug.length > 50) {
    return res.status(400).send('Invalid menu URL');
  }

  try {
    // Read the published-menu.html file
    const htmlPath = path.join(process.cwd(), 'published-menu.html');
    const publishedMenuHTML = await fs.readFile(htmlPath, 'utf8');
    
    // Replace the placeholder with the actual slug
    const customizedHTML = publishedMenuHTML.replace('{{MENU_SLUG}}', slug);
    
    // Set content type to HTML
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(customizedHTML);
    
  } catch (error) {
    console.error('Error serving menu page:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Server Error</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <h1>Server Error</h1>
        <p>Unable to load menu page. Please try again later.</p>
      </body>
      </html>
    `);
  }
};