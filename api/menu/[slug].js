const { sql } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { slug } = req.query;

    if (!slug) {
      return res.status(400).json({ error: 'Menu slug is required' });
    }

    // Get the published menu by slug
    const menuResult = await sql`
      SELECT m.*, u.name as user_name, u.restaurant
      FROM menus m
      JOIN users u ON m.user_id = u.id
      WHERE m.published_slug = ${slug} 
      AND m.status = 'published'
    `;

    if (menuResult.rows.length === 0) {
      return res.status(404).json({ error: 'Published menu not found' });
    }

    const menu = menuResult.rows[0];

    // Get menu sections
    const sectionsResult = await sql`
      SELECT * FROM menu_sections 
      WHERE menu_id = ${menu.id} 
      ORDER BY section_id
    `;

    const sections = sectionsResult.rows.map(section => ({
      id: section.section_id,
      name: section.name,
      type: section.type,
      columns: section.columns,
      titleColumns: section.title_columns,
      items: section.items
    }));

    // Format the response
    const publishedMenu = {
      id: menu.id,
      slug: menu.published_slug,
      title: menu.published_title,
      subtitle: menu.published_subtitle,
      restaurant: menu.restaurant,
      sections: sections,
      
      // Styling properties
      backgroundType: menu.background_type,
      backgroundValue: menu.background_value,
      fontFamily: menu.font_family,
      colorPalette: menu.color_palette,
      navigationTheme: menu.navigation_theme,
      menuLogo: menu.menu_logo,
      logoSize: menu.logo_size,
      
      publishedAt: menu.published_at,
      updatedAt: menu.updated_at
    };

    res.status(200).json({
      success: true,
      menu: publishedMenu
    });

  } catch (error) {
    console.error('Get published menu error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}