const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { createUser, getUserByEmail } = require('../../lib/database');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, name, restaurant } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if user already exists
    const existingUserResult = await getUserByEmail(email);
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
      email: email.toLowerCase(),
      passwordHash,
      name,
      restaurant,
      plan: 'free',
      maxMenus: 5
    };

    const createResult = await createUser(userData);
    
    if (!createResult.success) {
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Don't return password hash
    const { password_hash, ...userWithoutPassword } = createResult.user;

    res.status(201).json({ 
      success: true, 
      user: userWithoutPassword,
      message: 'User created successfully' 
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
}