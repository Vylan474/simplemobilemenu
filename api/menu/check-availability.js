export default function handler(req, res) {
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

  // For now, return available for all valid slugs
  return res.status(200).json({ 
    available: true,
    slug: slug,
    message: 'Slug is available'
  });
}