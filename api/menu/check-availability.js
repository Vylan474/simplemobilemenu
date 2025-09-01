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

    // For now, we'll assume all slugs are available since we don't have
    // a reliable database connection in this environment
    // This can be updated once the database is properly configured
    const available = true;

    res.status(200).json({ 
      available,
      slug,
      message: available ? 'Slug is available' : 'Slug is already taken'
    });

  } catch (error) {
    console.error('Check availability error:', error);
    // Return a response that the frontend can handle
    res.status(500).json({ 
      available: false,
      error: 'Server error checking availability. Please try again.' 
    });
  }
}