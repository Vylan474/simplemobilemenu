const { sql } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const sessionId = req.cookies?.session || req.headers.authorization?.replace('Bearer ', '');
    if (!sessionId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify session
    const userResult = await sql`
      SELECT user_id FROM user_sessions 
      WHERE id = ${sessionId} AND expires_at > CURRENT_TIMESTAMP
    `;
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    const userId = userResult.rows[0].user_id;

    // Get file data from request body (base64 encoded)
    const { fileData, fileName, menuId } = req.body;
    
    if (!fileData || !fileName) {
      return res.status(400).json({ error: 'File data and name are required' });
    }

    // Validate file size (approximate - base64 is ~1.33x larger than binary)
    const approximateSize = (fileData.length * 3) / 4;
    if (approximateSize > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }

    // For now, store the base64 data directly in database
    // This is a temporary solution until Vercel Blob is set up
    const dataUrl = fileData; // Keep as data URL for immediate use
    
    // If menuId is provided, update the menu in database
    if (menuId) {
      try {
        // Verify menu ownership
        const menuResult = await sql`
          SELECT id FROM menus WHERE id = ${menuId} AND user_id = ${userId}
        `;
        
        if (menuResult.rows.length > 0) {
          // Update menu with logo data URL
          await sql`
            UPDATE menus 
            SET menu_logo = ${dataUrl},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${menuId} AND user_id = ${userId}
          `;
        }
      } catch (error) {
        console.error('Error updating menu logo:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to update menu with logo' 
        });
      }
    }

    res.status(200).json({
      success: true,
      url: dataUrl, // Return the data URL for immediate display
      filename: fileName
    });

  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to upload logo: ' + error.message 
    });
  }
};