const { sql } = require('@vercel/postgres');

// Constants
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB in bytes

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

    // Validate filename
    if (typeof fileName !== 'string' || fileName.trim() === '') {
      return res.status(400).json({ error: 'File name must be a non-empty string' });
    }

    // Validate file type by checking data URL format
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const dataUrlMatch = fileData.match(/^data:([^;]+);base64,/);
    
    if (!dataUrlMatch) {
      return res.status(400).json({ error: 'Invalid file format. Must be base64 data URL.' });
    }

    const mimeType = dataUrlMatch[1];
    if (!validImageTypes.includes(mimeType)) {
      return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.' });
    }

    // Validate file size (approximate - base64 is ~1.33x larger than binary)
    const approximateSize = (fileData.length * 3) / 4;
    if (approximateSize > MAX_FILE_SIZE) {
      return res.status(400).json({ error: 'File too large. Maximum size is 4MB. Please compress your image before uploading.' });
    }

    // Additional safety check for menuId if provided
    if (menuId && (typeof menuId !== 'string' || menuId.trim() === '')) {
      return res.status(400).json({ error: 'Menu ID must be a non-empty string if provided' });
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
          // Update menu with background data URL
          await sql`
            UPDATE menus 
            SET background_type = 'image', 
                background_value = ${dataUrl},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${menuId} AND user_id = ${userId}
          `;
        }
      } catch (error) {
        console.error('Error updating menu background:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to update menu with background' 
        });
      }
    }

    res.status(200).json({
      success: true,
      url: dataUrl, // Return the data URL for immediate display
      filename: fileName
    });

  } catch (error) {
    console.error('Background upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to upload background: ' + error.message 
    });
  }
};