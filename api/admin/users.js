const bcrypt = require('bcryptjs');
const { getAllUsers } = require('../../lib/database');

// Admin credentials - in production, these should be environment variables
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'MenuAdmin2024!'
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    // Validate admin credentials
    if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Get all users with their menu counts
    const result = await getAllUsers();
    
    if (!result.success) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    // Transform data for admin dashboard
    const users = result.users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      restaurant: user.restaurant,
      avatar: user.avatar,
      plan: user.plan,
      maxMenus: user.max_menus,
      menuCount: parseInt(user.menu_count) || 0,
      publishedCount: parseInt(user.published_count) || 0,
      createdAt: user.created_at,
      lastActive: user.last_active,
      updatedAt: user.updated_at
    }));

    // Calculate statistics
    const stats = {
      totalUsers: users.length,
      totalMenus: users.reduce((sum, user) => sum + user.menuCount, 0),
      publishedMenus: users.reduce((sum, user) => sum + user.publishedCount, 0),
      activeToday: users.filter(user => {
        if (!user.lastActive) return false;
        const today = new Date().toDateString();
        const lastActive = new Date(user.lastActive).toDateString();
        return lastActive === today;
      }).length
    };

    res.status(200).json({ 
      success: true, 
      users,
      stats
    });

  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}