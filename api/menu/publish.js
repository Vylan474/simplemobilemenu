const { sql } = require('@vercel/postgres');
const { saveMenuSections } = require('../../lib/database');

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

    const { menuId, slug, title, subtitle } = req.body;

    if (!menuId || !slug || !title) {
      return res.status(400).json({ error: 'Menu ID, slug, and title are required' });
    }

    // Verify menu ownership
    const ownsMenu = await verifyMenuOwnership(menuId, userId);
    if (!ownsMenu) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return res.status(400).json({ 
        error: 'Slug must contain only lowercase letters, numbers, and dashes' 
      });
    }

    // Check if slug is already taken by another published menu
    const existingSlug = await sql`
      SELECT id FROM menus 
      WHERE published_slug = ${slug} 
      AND status = 'published'
      AND id != ${menuId}
    `;

    if (existingSlug.rows.length > 0) {
      return res.status(400).json({ error: 'This URL path is already taken' });
    }

    // Get the menu data to publish
    const menuResult = await sql`
      SELECT * FROM menus WHERE id = ${menuId} AND user_id = ${userId}
    `;

    if (menuResult.rows.length === 0) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    const menu = menuResult.rows[0];

    // Get menu sections
    const sectionsResult = await sql`
      SELECT * FROM menu_sections 
      WHERE menu_id = ${menuId} 
      ORDER BY section_id
    `;

    console.log(`[PUBLISH] Found ${sectionsResult.rows.length} sections for menu ${menuId}`);
    
    const sections = sectionsResult.rows.map(section => ({
      id: section.section_id,
      name: section.name,
      type: section.type,
      columns: section.columns,
      titleColumns: section.title_columns,
      items: section.items
    }));
    
    if (sectionsResult.rows.length > 0) {
      console.log(`[PUBLISH] First section: ${sections[0].name} with ${sections[0].items?.length || 0} items`);
    }

    // Update the menu with published info
    await sql`
      UPDATE menus 
      SET 
        status = 'published',
        published_slug = ${slug},
        published_title = ${title},
        published_subtitle = ${subtitle || null},
        published_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${menuId} AND user_id = ${userId}
    `;

    // Create the published menu URL
    const publishedUrl = `https://www.mymobilemenu.com/menu/${slug}`;

    res.status(200).json({
      success: true,
      publishedUrl,
      slug,
      title,
      subtitle: subtitle || null,
      message: 'Menu published successfully'
    });

  } catch (error) {
    console.error('Publish menu error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}