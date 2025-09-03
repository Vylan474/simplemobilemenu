# Menu Editor 🍽️

A comprehensive web application for creating, customizing, and publishing restaurant menus with modern styling options and real-time preview capabilities.

## ✨ Features

- **Menu Creation**: Create unlimited menu sections (Wine, Cocktails, Food, etc.)
- **Dynamic Customization**: Background images, fonts, color palettes, navigation themes
- **Real-time Preview**: See changes instantly with live preview mode
- **File Uploads**: Custom background images and logos with security validation
- **Multi-user Support**: Google OAuth authentication with individual user data
- **Menu Publishing**: Publish menus to public URLs with SEO-friendly slugs
- **Responsive Design**: Mobile-friendly interface and published menus
- **Admin Portal**: User management and analytics dashboard

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Vercel PostgreSQL recommended)
- Google OAuth client credentials

### Installation

1. **Clone and Install**
   ```bash
   git clone https://github.com/your-username/menu-editor.git
   cd menu-editor
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Configure your environment variables (see Configuration section)
   ```

3. **Database Setup**
   ```bash
   # Initialize database schema
   npm run init-db
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   # Server runs at http://localhost:3000
   ```

## 🔧 Configuration

### Required Environment Variables

Create a `.env` file with the following variables:

```env
# Database
POSTGRES_URL="your-postgresql-connection-string"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Application
NODE_ENV="development"
PORT=3000

# Security
SESSION_SECRET="your-secure-random-string"
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google OAuth API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000` (development)
   - `https://your-domain.com` (production)

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with hot reload |
| `npm run init-db` | Initialize database schema |
| `npm test` | Run tests (when implemented) |
| `npm run lint` | Run ESLint (when configured) |
| `npm run typecheck` | Run type checking (when configured) |
| `npm run format` | Format code (when configured) |

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL (Vercel PostgreSQL)
- **Authentication**: Google OAuth 2.0 + custom session management
- **File Storage**: Base64 encoding (temporary, migrating to Vercel Blob)
- **Deployment**: Vercel serverless functions

### Project Structure
```
├── api/                    # API endpoints (Vercel serverless functions)
│   ├── auth/              # Authentication endpoints
│   ├── menu/              # Menu CRUD operations  
│   ├── upload/            # File upload handlers
│   └── admin/             # Admin functionality
├── lib/                   # Database utilities and helpers
├── public/                # Static assets (CSS, images, fonts)
├── docs/                  # Documentation
│   ├── MAPPING.md         # Architecture documentation
│   └── TEST-PLAN.md       # Manual testing procedures
├── script.js              # Main client-side application logic
├── editor.html            # Primary application interface
├── published-menu.html    # Public menu template
└── server.js              # Express server configuration
```

## 🔐 Security Features

- **Input Validation**: Comprehensive validation on all API endpoints
- **File Upload Security**: MIME type checking, size limits, type restrictions
- **Authentication**: Secure session management with PostgreSQL storage
- **Authorization**: Menu ownership verification and access controls
- **SQL Injection Prevention**: Parameterized queries throughout
- **XSS Protection**: Input sanitization and output encoding

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth authentication
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Session verification

### Menu Management
- `POST /api/menu/create` - Create new menu
- `PUT /api/menu/update` - Update existing menu
- `DELETE /api/menu/delete` - Delete menu
- `GET /api/menu/list` - List user's menus
- `POST /api/menu/publish` - Publish menu to public URL
- `GET /api/menu/get-published` - Fetch published menu data

### File Uploads
- `POST /api/upload/background` - Upload background image
- `POST /api/upload/logo` - Upload logo image

### Public Routes
- `GET /menu/{slug}` - Public menu pages
- `GET /admin` - Admin portal

## 🧪 Testing

### Manual Testing
Run through the comprehensive test checklist:
```bash
# See TEST-PLAN.md for detailed smoke testing procedures
open docs/TEST-PLAN.md
```

### Critical Test Cases
- Menu section creation (should create exactly 1 section)
- Menu item addition (should add exactly 1 item)
- File upload validation (should reject invalid file types)
- Authentication flows (login/logout/session persistence)
- Menu publishing (public URLs should be accessible)

## 🐛 Known Issues & Limitations

### Current Limitations
- **File Storage**: Using base64 encoding temporarily (migrating to Vercel Blob)
- **Test Coverage**: Manual testing only (automated tests planned)
- **Type Safety**: JavaScript without TypeScript (considering migration)

### Recently Fixed
- ✅ "Add Section" creating multiple sections instead of 1
- ✅ "Add Menu Item" adding 3 items instead of 1  
- ✅ "Invalid Date" display in menu sidebar
- ✅ Event listener multiplication causing unpredictable behavior

## 🚦 Development Workflow

### Making Changes
1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Run manual smoke tests from `TEST-PLAN.md`
4. Commit with conventional format: `feat: add new feature`
5. Create pull request with detailed description

### Code Quality Guidelines
- Follow existing code patterns and naming conventions
- Add JSDoc documentation for new functions
- Validate inputs at API boundaries
- Handle errors gracefully with user-friendly messages
- Test changes with both authenticated and non-authenticated users

## 📊 Monitoring & Analytics

### Admin Portal
Access admin functionality at `/admin`:
- User activity monitoring
- Menu creation statistics  
- Error tracking and logging
- System health metrics

### Logging
Structured logging with categories:
- `[AUTH]` - Authentication events
- `[MENU]` - Menu operations  
- `[UPLOAD]` - File upload events
- `[ERROR]` - Error conditions
- `[UI]` - User interface interactions

## 🚀 Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
# Set up PostgreSQL database connection
```

### Environment Setup
1. Configure PostgreSQL database in Vercel
2. Set environment variables in Vercel dashboard
3. Configure Google OAuth redirect URLs for production domain
4. Test authentication and database connectivity

## 🤝 Contributing

### Pull Request Process
1. Follow the conventional commit format
2. Include tests for new functionality
3. Update documentation as needed
4. Ensure all manual smoke tests pass
5. Request review from maintainers

### Bug Reports
Include in bug reports:
- Steps to reproduce
- Expected vs actual behavior  
- Browser/OS information
- Console error messages
- Screenshots if UI-related

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check `docs/` folder for detailed guides
- **Issues**: Submit bug reports via GitHub Issues
- **Architecture**: See `MAPPING.md` for system overview
- **Testing**: Follow `TEST-PLAN.md` for manual verification

---

**Built with ❤️ for restaurant owners who want beautiful, functional menus**