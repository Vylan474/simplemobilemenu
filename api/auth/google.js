const { v4: uuidv4 } = require('uuid');
const { sql } = require('@vercel/postgres');
const { createUser, getUserByEmail, updateUserLastActive } = require('../../lib/database');

// Google OAuth verification (you'll need to install google-auth-library)
// npm install google-auth-library
let OAuth2Client;
try {
    const { OAuth2Client: GoogleOAuth2Client } = require('google-auth-library');
    OAuth2Client = GoogleOAuth2Client;
} catch (error) {
    console.error('google-auth-library not installed. Please install it: npm install google-auth-library');
}

async function verifyGoogleToken(credential) {
    if (!OAuth2Client) {
        throw new Error('Google OAuth client not available');
    }
    
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        return {
            success: true,
            user: {
                googleId: payload['sub'],
                email: payload['email'],
                name: payload['name'],
                picture: payload['picture'],
                emailVerified: payload['email_verified']
            }
        };
    } catch (error) {
        console.error('Google token verification failed:', error);
        return { success: false, error: 'Invalid Google token' };
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { credential } = req.body;
        
        if (!credential) {
            return res.status(400).json({ error: 'Google credential is required' });
        }

        // Verify Google token
        const verifyResult = await verifyGoogleToken(credential);
        if (!verifyResult.success) {
            return res.status(401).json({ error: verifyResult.error });
        }

        const googleUser = verifyResult.user;
        
        // Check if user already exists
        const existingUserResult = await getUserByEmail(googleUser.email);
        let userId;
        let isNewUser = false;

        if (existingUserResult.success && existingUserResult.user) {
            // User exists, update Google ID if not set
            userId = existingUserResult.user.id;
            
            // Update Google ID if not already set
            if (!existingUserResult.user.google_id) {
                await sql`
                    UPDATE users 
                    SET google_id = ${googleUser.googleId}, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${userId}
                `;
            }
        } else {
            // Create new user
            isNewUser = true;
            userId = uuidv4();
            
            const createResult = await createUser({
                id: userId,
                email: googleUser.email,
                name: googleUser.name,
                restaurant: 'My Restaurant', // Default restaurant name
                googleId: googleUser.googleId,
                profilePicture: googleUser.picture
            });

            if (!createResult.success) {
                return res.status(500).json({ error: 'Failed to create user account' });
            }
        }

        // Create session
        const sessionId = uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await sql`
            INSERT INTO user_sessions (id, user_id, expires_at)
            VALUES (${sessionId}, ${userId}, ${expiresAt})
        `;

        // Update last active
        await updateUserLastActive(userId);

        // Get updated user data
        const userResult = await getUserByEmail(googleUser.email);
        const { password_hash, ...userWithoutPassword } = userResult.user;

        // Set session cookie
        res.setHeader('Set-Cookie', [
            `session=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
        ]);

        res.status(200).json({ 
            success: true, 
            user: userWithoutPassword,
            sessionId,
            isNewUser
        });

    } catch (error) {
        console.error('Google OAuth error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}