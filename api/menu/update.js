const { sql } = require('@vercel/postgres');
const { updateMenu, saveMenuSections } = require('../../lib/database');

// Helper function to verify user session
async function verifySession(sessionId) {
  if (!sessionId) return null;
  
  const result = await sql`
    SELECT user_id FROM user_sessions 
    WHERE id = ${sessionId} AND expires_at > CURRENT_TIMESTAMP
  `;
  
  return result.rows[0]?.user_id || null;
}

// Helper function to verify menu ownership
async function verifyMenuOwnership(menuId, userId) {
  const result = await sql`
    SELECT id FROM menus WHERE id = ${menuId} AND user_id = ${userId}
  `;
  return result.rows.length > 0;
}

export default async function handler(req, res) {
  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const sessionId = req.cookies?.session || req.headers.authorization?.replace('Bearer ', '');
    console.log('🔍 Menu update auth check:', {
      hasSessionCookie: !!req.cookies?.session,
      hasAuthHeader: !!req.headers.authorization,
      sessionId: sessionId ? 'exists' : 'missing'
    });
    
    const userId = await verifySession(sessionId);
    console.log('🔍 Session verification result:', userId ? 'valid user' : 'no user found');
    
    if (!userId) {
      console.log('❌ Authentication failed in menu update');
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { menuId } = req.query;
    if (!menuId) {
      return res.status(400).json({ error: 'Menu ID is required' });
    }

    // Verify menu ownership
    console.log('🔍 Checking menu ownership:', { menuId, userId });
    const ownsMenu = await verifyMenuOwnership(menuId, userId);
    console.log('🔍 Menu ownership result:', ownsMenu ? 'user owns menu' : 'access denied');
    
    if (!ownsMenu) {
      console.log('❌ 403 Forbidden: User does not own menu');
      return res.status(403).json({ error: 'Access denied' });
    }

    const { sections, ...menuUpdates } = req.body;

    // Update menu data if provided
    if (Object.keys(menuUpdates).length > 0) {
      const updateResult = await updateMenu(menuId, menuUpdates);
      if (!updateResult.success) {
        return res.status(500).json({ error: 'Failed to update menu' });
      }
    }

    // Update sections if provided
    if (sections && Array.isArray(sections)) {
      const sectionsResult = await saveMenuSections(menuId, sections);
      if (!sectionsResult.success) {
        return res.status(500).json({ error: 'Failed to update menu sections' });
      }
    }

    res.status(200).json({ 
      success: true,
      message: 'Menu updated successfully'
    });

  } catch (error) {
    console.error('Update menu error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}