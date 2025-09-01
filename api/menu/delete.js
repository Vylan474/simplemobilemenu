const { sql } = require('@vercel/postgres');

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
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const sessionId = req.cookies?.session || req.headers.authorization?.replace('Bearer ', '');
    const userId = await verifySession(sessionId);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { menuId } = req.query;
    if (!menuId) {
      return res.status(400).json({ error: 'Menu ID is required' });
    }

    // Verify menu ownership
    const ownsMenu = await verifyMenuOwnership(menuId, userId);
    if (!ownsMenu) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Soft delete the menu by updating status to 'deleted'
    await sql`
      UPDATE menus 
      SET status = 'deleted', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${menuId} AND user_id = ${userId}
    `;

    // Also delete associated menu sections
    await sql`
      DELETE FROM menu_sections 
      WHERE menu_id = ${menuId}
    `;

    res.status(200).json({ 
      success: true,
      message: 'Menu deleted successfully'
    });

  } catch (error) {
    console.error('Delete menu error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}