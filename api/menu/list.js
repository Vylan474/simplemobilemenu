const { getUserMenus, getSession } = require('../../lib/hybrid-database');

// Helper function to verify user session
async function verifySession(sessionId) {
  if (!sessionId) return null;
  
  const session = await getSession(sessionId);
  return session?.user_id || null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const sessionId = req.cookies?.session || req.headers.authorization?.replace('Bearer ', '');
    const userId = await verifySession(sessionId);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user's menus
    const result = await getUserMenus(userId);
    
    if (!result.success) {
      return res.status(500).json({ error: 'Failed to fetch menus' });
    }

    // Transform data to match the expected format
    const menus = result.menus.map(menu => ({
      id: menu.id,
      name: menu.name,
      description: menu.description,
      status: menu.status,
      slug: menu.slug,
      title: menu.title,
      subtitle: menu.subtitle,
      sections: menu.sections || [],
      sectionCounter: menu.section_counter || 0,
      createdAt: menu.created_at,
      updatedAt: menu.updated_at,
      publishedAt: menu.published_at,
      
      // Styling settings
      backgroundType: menu.background_type,
      backgroundValue: menu.background_value,
      fontFamily: menu.font_family,
      colorPalette: menu.color_palette,
      navigationTheme: menu.navigation_theme,
      menuLogo: menu.menu_logo,
      logoSize: menu.logo_size,
      
      // Published menu info
      publishedMenuId: menu.published_menu_id,
      publishedSlug: menu.published_slug,
      publishedTitle: menu.published_title,
      publishedSubtitle: menu.published_subtitle
    }));

    res.status(200).json({ 
      success: true, 
      menus 
    });

  } catch (error) {
    console.error('Get menus error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}