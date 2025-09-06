const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { createUser, getUserByEmail, createSession } = require('../../lib/hybrid-database');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      email, 
      password, 
      name, 
      firstName,
      lastName,
      phone,
      businessName,
      businessType,
      address,
      city,
      state,
      zip,
      marketingOptIn,
      // Legacy support
      restaurant
    } = req.body;

    // Validate input - support both new and legacy formats
    const userEmail = email?.toLowerCase()?.trim();
    const userName = name || (firstName && lastName ? `${firstName} ${lastName}`.trim() : '');
    const userBusinessName = businessName || restaurant;
    
    if (!userEmail || !password || !userName) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if user already exists
    const existingUserResult = await getUserByEmail(userEmail);
    if (!existingUserResult.success) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (existingUserResult.user) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const userId = uuidv4();
    const userData = {
      id: userId,
      email: userEmail,
      passwordHash,
      name: userName,
      firstName: firstName || userName.split(' ')[0] || '',
      lastName: lastName || userName.split(' ').slice(1).join(' ') || '',
      phone: phone || null,
      businessName: userBusinessName || '',
      businessType: businessType || 'restaurant',
      address: address || null,
      city: city || null,
      state: state || null,
      zip: zip || null,
      marketingOptIn: marketingOptIn || false,
      plan: 'free',
      maxMenus: 5,
      // Legacy field for backward compatibility
      restaurant: userBusinessName
    };

    const createResult = await createUser(userData);
    
    if (!createResult.success) {
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // CREATE SESSION FOR AUTO-LOGIN
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    try {
      await createSession(sessionId, userId, expiresAt);

      // Set cookie
      res.cookie('session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt
      });

      // Don't return password hash
      const { password_hash, ...userWithoutPassword } = createResult.user;

      res.status(201).json({ 
        success: true, 
        user: userWithoutPassword,
        sessionId: sessionId,
        message: 'User created successfully' 
      });
    } catch (sessionError) {
      console.error('Session creation error:', sessionError);
      // Still return success since user was created
      const { password_hash, ...userWithoutPassword } = createResult.user;
      res.status(201).json({ 
        success: true, 
        user: userWithoutPassword,
        message: 'User created successfully (manual login required)' 
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
}