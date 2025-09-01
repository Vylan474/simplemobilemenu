const { sql } = require('@vercel/postgres');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { slug } = req.body;

    if (!slug || slug.trim() === '') {
      return res.status(400).json({ error: 'Slug is required' });
    }

    // Validate slug format (lowercase letters, numbers, dashes only)
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return res.status(400).json({ 
        available: false, 
        error: 'Slug must contain only lowercase letters, numbers, and dashes' 
      });
    }

    // Check if slug is already taken in published menus
    const result = await sql`
      SELECT id FROM menus 
      WHERE published_slug = ${slug} 
      AND status = 'published'
    `;

    const available = result.rows.length === 0;

    res.status(200).json({ 
      available,
      slug,
      message: available ? 'Slug is available' : 'Slug is already taken'
    });

  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}