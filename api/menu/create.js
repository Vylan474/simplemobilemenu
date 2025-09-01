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

export default async function handler(req, res) {
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

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Menu name is required' });
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