const { getUserById, getSession } = require('../../lib/hybrid-database');

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
    const session = await getSession(sessionId);

    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Get user data
    const userResult = await getUserById(session.user_id);
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