const { sql } = require('@vercel/postgres');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { slug } = req.body || {};

    if (!slug || slug.trim() === '') {
      return res.status(400).json({ 
        available: false,
        error: 'Slug is required' 
      });
    }

    // Validate slug format (lowercase letters, numbers, dashes only)
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return res.status(400).json({ 
        available: false, 
        error: 'Slug must contain only lowercase letters, numbers, and dashes' 
      });
    }

    // Check if slug is already taken by a published menu
    // This matches the exact same query used in the publish endpoint
    const existingSlug = await sql`
      SELECT id FROM menus 
      WHERE published_slug = ${slug} 
      AND status = 'published'
    `;

    const available = existingSlug.rows.length === 0;

    return res.status(200).json({ 
      available,
      slug,
      message: available ? 'Slug is available' : 'Slug is already taken'
    });

  } catch (error) {
    console.error('Check availability error:', error);
    return res.status(500).json({ 
      available: false,
      error: 'Server error checking availability. Please try again.' 
    });
  }
}