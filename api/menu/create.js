const { v4: uuidv4 } = require('uuid');
const { sql } = require('@vercel/postgres');
const { createMenu, saveMenuSections } = require('../../lib/database');

// Helper function to verify user session
async function verifySession(sessionId) {
  if (!sessionId) return null;
  
  const result = await sql`
    SELECT user_id FROM user_sessions 
    WHERE id = ${sessionId} AND expires_at > CURRENT_TIMESTAMP
  `;
  
  return result.rows[0]?.user_id || null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const sessionId = req.cookies?.session || req.headers.authorization?.replace('Bearer ', '');
    const userId = await verifySession(sessionId);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { 
      name, 
      description, 
      sections = [],
      backgroundType = 'none',
      backgroundValue = null,
      fontFamily = 'Inter',
      colorPalette = 'classic',
      navigationTheme = 'modern',
      menuLogo = null,
      logoSize = 'medium'
    } = req.body;

    // Input validation
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Menu name is required and must be a non-empty string' });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({ error: 'Menu name cannot exceed 100 characters' });
    }

    if (description && typeof description !== 'string') {
      return res.status(400).json({ error: 'Description must be a string' });
    }

    if (description && description.length > 500) {
      return res.status(400).json({ error: 'Description cannot exceed 500 characters' });
    }

    // Validate enum fields
    const validBackgroundTypes = ['none', 'image', 'color'];
    if (!validBackgroundTypes.includes(backgroundType)) {
      return res.status(400).json({ error: 'Invalid background type' });
    }

    const validFontFamilies = ['Inter', 'Playfair Display', 'Roboto', 'Montserrat', 'Open Sans', 'Georgia', 'Lato'];
    if (!validFontFamilies.includes(fontFamily)) {
      return res.status(400).json({ error: 'Invalid font family' });
    }

    const validColorPalettes = ['classic', 'modern', 'elegant', 'vibrant', 'minimal'];
    if (!validColorPalettes.includes(colorPalette)) {
      return res.status(400).json({ error: 'Invalid color palette' });
    }

    const validNavigationThemes = ['modern', 'classic', 'elegant', 'minimal', 'glass'];
    if (!validNavigationThemes.includes(navigationTheme)) {
      return res.status(400).json({ error: 'Invalid navigation theme' });
    }

    const validLogoSizes = ['small', 'medium', 'large'];
    if (!validLogoSizes.includes(logoSize)) {
      return res.status(400).json({ error: 'Invalid logo size' });
    }

    // Create menu
    const menuId = uuidv4();
    const menuData = {
      id: menuId,
      userId,
      name: name.trim(),
      description,
      backgroundType,
      backgroundValue,
      fontFamily,
      colorPalette,
      navigationTheme,
      menuLogo,
      logoSize
    };

    const createResult = await createMenu(menuData);
    
    if (!createResult.success) {
      return res.status(500).json({ error: 'Failed to create menu' });
    }

    // Save sections if provided
    if (sections.length > 0) {
      const sectionsResult = await saveMenuSections(menuId, sections);
      if (!sectionsResult.success) {
        console.error('Failed to save menu sections:', sectionsResult.error);
      }
    }

    res.status(201).json({ 
      success: true, 
      menu: createResult.menu,
      menuId 
    });

  } catch (error) {
    console.error('Create menu error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}