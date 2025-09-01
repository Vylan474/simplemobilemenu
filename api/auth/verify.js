const { sql } = require('@vercel/postgres');
const { getUserById } = require('../../lib/database');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get session from cookie or Authorization header
    const sessionId = req.cookies?.session || req.headers.authorization?.replace('Bearer ', '');
    
    if (!sessionId) {
      return res.status(401).json({ error: 'No session found' });
    }

    // Check if session exists and is not expired
    const sessionResult = await sql`
      SELECT user_id FROM user_sessions 
      WHERE id = ${sessionId} AND expires_at > CURRENT_TIMESTAMP
    `;

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Get user data
    const userResult = await getUserById(sessionResult.rows[0].user_id);
    if (!userResult.success || !userResult.user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Don't return password hash
    const { password_hash, ...userWithoutPassword } = userResult.user;

    res.status(200).json({ 
      success: true, 
      user: userWithoutPassword 
    });

  } catch (error) {
    console.error('Session verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}