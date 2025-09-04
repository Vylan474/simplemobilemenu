module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        res.status(200).json({
            googleClientId: process.env.GOOGLE_CLIENT_ID
        });
    } catch (error) {
        console.error('Config API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};