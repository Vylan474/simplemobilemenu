const { initializeDatabase } = require('../lib/database');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await initializeDatabase();
    
    if (result.success) {
      res.status(200).json({ message: 'Database initialized successfully' });
    } else {
      res.status(500).json({ error: 'Database initialization failed', details: result.error });
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}