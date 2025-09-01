const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getUserByEmail, updateUserLastActive } = require('../../lib/database');
const { sql } = require('@vercel/postgres');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user by email
    const userResult = await getUserByEmail(email.toLowerCase());
    if (!userResult.success) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!userResult.user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, userResult.user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session
    const sessionId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await sql`
      INSERT INTO user_sessions (id, user_id, expires_at)
      VALUES (${sessionId}, ${userResult.user.id}, ${expiresAt})
    `;

    // Update last active
    await updateUserLastActive(userResult.user.id);

    // Don't return password hash
    const { password_hash, ...userWithoutPassword } = userResult.user;

    // Set session cookie
    res.setHeader('Set-Cookie', [
      `session=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    ]);

    res.status(200).json({ 
      success: true, 
      user: userWithoutPassword,
      sessionId // Also return for client-side storage if needed
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}