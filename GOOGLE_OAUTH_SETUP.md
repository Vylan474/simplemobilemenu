# Google OAuth Setup Guide

## Overview
This guide explains how to set up Google Sign-In OAuth integration for the Menu Editor application.

## Prerequisites
- Google Cloud Console account
- Node.js application with the Menu Editor codebase

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API or Google Identity Services API

## Step 2: Create OAuth 2.0 Credentials

1. Navigate to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application" as the application type
4. Configure the OAuth consent screen if prompted
5. Set the authorized origins:
   - For development: `http://localhost:3000`
   - For production: `https://yourdomain.com`
6. Set authorized redirect URIs (if needed):
   - For development: `http://localhost:3000/auth/callback`
   - For production: `https://yourdomain.com/auth/callback`

## Step 3: Configure Environment Variables

The Google OAuth Client ID is already configured for `mymobilemenu.com` domain.

**Current Configuration:**
- Client ID: `911046669009-oevf7t3lhkui370ncavenvulu6fj8fu7.apps.googleusercontent.com`
- Authorized domains: `mymobilemenu.com`

**For Local Development:**
1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. The `.env` file already contains the correct Google Client ID for production.

**Note:** If you need to test locally, you'll need to add `http://localhost:3000` to the authorized origins in Google Cloud Console for this client ID, or create a separate client ID for development.

## Step 4: Database Schema Updates

The application automatically handles database schema updates. The following changes have been implemented:

- Added `google_id` field to the `users` table
- Made `password_hash` nullable for OAuth users
- Updated user creation to handle Google OAuth data

## Step 5: Test the Integration

1. Start the server:
   ```bash
   npm start
   ```

2. Open `http://localhost:3000` in your browser
3. Click "Sign In" or "Get Started"
4. Try the "Continue with Google" button

## How It Works

1. **Frontend**: Uses Google Identity Services library to handle OAuth flow
2. **Backend**: Verifies Google ID tokens using `google-auth-library`
3. **Database**: Creates or links users with Google accounts
4. **Session**: Maintains user sessions using the existing authentication system

## Implementation Details

### Frontend (`landing.js`)
- Loads Google Identity Services library
- Initializes Google Sign-In with client ID from server config
- Handles OAuth callback and sends ID token to backend

### Backend (`api/auth/google.js`)
- Verifies Google ID tokens server-side
- Creates new users or links existing accounts
- Generates session tokens compatible with existing auth system

### Database Integration
- Google users are stored with `google_id` field
- Existing email/password users can be linked with Google accounts
- All users use the same session management system

## Security Features

- Server-side token verification using Google's official library
- Session-based authentication with secure HTTP-only cookies
- CSRF protection through secure token handling
- Email verification status from Google

## Troubleshooting

### Common Issues

1. **"Google sign-in service is not available"**
   - Check if the Google Identity Services script is loading
   - Verify network connectivity
   - Check browser console for JavaScript errors

2. **"Invalid Google token"**
   - Verify the Google Client ID is correct
   - Check if the domain is authorized in Google Cloud Console
   - Ensure the token hasn't expired

3. **Database errors**
   - Run the server to auto-update database schema
   - Check PostgreSQL connection
   - Verify environment variables are set

### Development Notes

- The Google Client ID is fetched from `/api/config` endpoint
- In development, you can test with `demo-client-id` (won't work but won't break)
- Production requires a real Google Client ID

## Production Deployment

1. Set up environment variables on your hosting platform
2. Add your production domain to Google Cloud Console
3. Ensure HTTPS is enabled (required by Google for OAuth)
4. Test the complete OAuth flow in production

## Next Steps

Once Google OAuth is working, you can:
- Add additional OAuth providers (Facebook, Twitter, etc.)
- Implement account linking for existing users
- Add profile picture support from Google
- Implement Google account disconnection feature