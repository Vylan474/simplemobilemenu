const { put } = require('@vercel/blob');
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

    // Convert base64 to buffer
    const base64Data = fileData.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Validate file size (5MB limit)
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.round(Math.random() * 1E9);
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `logo-${timestamp}-${randomId}.${fileExtension}`;

    // Upload to Vercel Blob
    const blob = await put(uniqueFileName, buffer, {
      access: 'public',
      contentType: `image/${fileExtension}`,
    });

    // If menuId is provided, update the menu in database
    if (menuId) {
      try {
        // Verify menu ownership
        const menuResult = await sql`
          SELECT id FROM menus WHERE id = ${menuId} AND user_id = ${userId}
        `;
        
        if (menuResult.rows.length > 0) {
          // Update menu with new logo
          await sql`
            UPDATE menus 
            SET menu_logo = ${blob.url},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${menuId} AND user_id = ${userId}
          `;
        }
      } catch (error) {
        console.error('Error updating menu logo:', error);
        // Don't fail the upload if menu update fails
      }
    }

    res.status(200).json({
      success: true,
      url: blob.url,
      filename: uniqueFileName
    });

  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to upload logo' 
    });
  }
};