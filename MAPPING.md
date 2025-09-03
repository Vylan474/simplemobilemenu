# Codebase Architecture Mapping

## 🏗️ Application Architecture

### High-Level Structure
This is a **Restaurant Menu Editor** web application with the following architecture:
- **Frontend**: Vanilla JavaScript/HTML/CSS single-page application
- **Backend**: Express.js server with PostgreSQL database (Vercel deployment)
- **Authentication**: Google OAuth + custom session management
- **File Storage**: Base64 encoding for images (temporary solution, Vercel Blob planned)

### Module Organization

#### 📁 Core Files
- `editor.html` - Main menu editor interface
- `script.js` - Primary application logic (~5000+ lines)
- `auth-db.js` - Database authentication manager
- `styles.css` - Main stylesheet
- `published-menu.html` - Public menu display template

#### 📁 API Layer (`/api/`)
```
api/
├── index.js           # Main API router & entry point
├── auth/              # Authentication endpoints
│   ├── google.js      # Google OAuth handler
│   ├── login.js       # Email/password login
│   ├── register.js    # User registration
│   └── verify.js      # Session verification
├── menu/              # Menu CRUD operations
│   ├── create.js      # Create new menu
│   ├── update.js      # Update existing menu
│   ├── delete.js      # Delete menu
│   ├── list.js        # List user's menus
│   ├── publish.js     # Publish menu to public URL
│   └── get-published.js # Fetch published menu data
├── upload/            # File upload handlers
│   ├── background.js  # Background image upload
│   └── logo.js        # Logo upload
└── admin/
    └── users.js       # Admin user management
```

#### 📁 Database Layer
- `lib/database.js` - Database utilities and schema helpers
- PostgreSQL tables: `users`, `user_sessions`, `menus`, `menu_sections`

### Data Flow

1. **User Authentication**: Google OAuth → session creation → cookie storage
2. **Menu Management**: Editor UI → API calls → PostgreSQL → UI updates
3. **Menu Publishing**: Editor → publish endpoint → public URL generation → published-menu.html
4. **File Uploads**: Base64 encoding → database storage → display

## 🔌 Public API/Contract List

### REST Endpoints (External Contracts)
```
POST /api/auth/google         # Google OAuth authentication
POST /api/auth/login          # Email/password login  
POST /api/auth/register       # User registration
GET  /api/auth/verify         # Session verification

POST /api/menu/create         # Create menu
PUT  /api/menu/update         # Update menu
DELETE /api/menu/delete       # Delete menu
GET  /api/menu/list           # List user menus
POST /api/menu/publish        # Publish menu
GET  /api/menu/get-published  # Get published menu data
POST /api/menu/check-availability # Check slug availability

POST /api/upload/background   # Upload background image
POST /api/upload/logo         # Upload logo

POST /api/admin/users         # Admin user management

GET  /menu/{slug}             # Public menu pages
GET  /admin                   # Admin portal
```

### Frontend JavaScript API (Internal Contracts)
```javascript
// MenuEditor Class (window.menuEditor)
class MenuEditor {
  // Core functionality
  addSection()
  editSection(sectionId)
  deleteSection(sectionId)
  addMenuItem(sectionId)
  editMenuItem(sectionId, itemIndex)
  deleteMenuItem(sectionId, itemIndex)
  
  // Styling
  selectBackgroundImage(imagePath)
  selectColorPalette(palette)
  selectFont(fontFamily)
  selectNavigationTheme(theme)
  
  // Publishing
  publishMenu()
  viewPublishedMenu()
  
  // Authentication
  handleAuthChange(user)
  showAuthModal()
}

// DatabaseAuthManager Class (window.authManager)
class DatabaseAuthManager {
  isAuthenticated()
  getCurrentUser()
  getUserMenus()
  updateMenu(menuId, data)
  deleteMenu(menuId)
  publishMenu(menuId, publishData)
}
```

### DOM Event Contracts
- Menu section CRUD operations via click handlers
- Form submissions for menu editing
- Dropdown toggles for styling options
- File upload triggers

## 🎯 Critical User Flows

### Primary Features
1. **Menu Creation & Editing**
   - Create new menu sections (Wine, Cocktails, Beer, etc.)
   - Add/edit/delete menu items within sections
   - Column management for different menu types

2. **Menu Styling**
   - Background image/color selection
   - Font family selection
   - Color palette themes
   - Navigation theme selection

3. **Menu Publishing**
   - Publish menu to public URL
   - Custom slug generation
   - SEO metadata (title, subtitle)

4. **User Management**
   - Google OAuth authentication
   - Session management
   - Multiple menu management per user

### Feature Flags & Toggles
- Dark mode toggle
- Live preview toggle
- Background upload vs. predefined images
- Different section types (wine, cocktails, beer, food, etc.)

## 🚨 "Don't Break" List

### Critical Interfaces (DO NOT CHANGE WITHOUT APPROVAL)
1. **API Endpoints**: All `/api/*` routes and their request/response formats
2. **Published Menu URLs**: `/menu/{slug}` pattern and data structure
3. **MenuEditor Class Methods**: Public methods used by event handlers
4. **Database Schema**: Table structures and relationships
5. **Authentication Flow**: Google OAuth integration and session management
6. **File Upload Format**: Base64 encoding and storage approach

### State Management Contracts
- `this.sections` array structure in MenuEditor
- `this.currentUser` object format
- localStorage keys and data formats
- Cookie-based session management

### External Dependencies
- Google OAuth client configuration
- Vercel PostgreSQL connection
- Font loading from Google Fonts
- FontAwesome icons

## 🏗️ High-Risk Areas Identified

1. **MenuEditor State Management** (`script.js:1-300`)
   - Complex state synchronization between UI and server
   - Multiple async operations without proper error handling

2. **Duplicate Event Listeners** (`script.js:4700-4900`)
   - Recently fixed but pattern may exist elsewhere
   - Risk of multiple bindings causing unexpected behavior

3. **Authentication State** (`auth-db.js`)
   - Session management across page reloads
   - User state synchronization between components

4. **Menu Publishing Flow** (`api/menu/publish.js`)
   - Complex data transformation and validation
   - Public URL generation and caching

5. **File Upload Processing** (`api/upload/*.js`)
   - Base64 encoding/decoding
   - Size limits and validation
   - Temporary storage approach

## 🔧 Known Technical Debt

1. **Base64 Image Storage**: Temporary solution, should migrate to Vercel Blob
2. **Monolithic script.js**: 5000+ lines, needs modularization
3. **Mixed Authentication Patterns**: Legacy localStorage + new database sessions
4. **Error Handling**: Inconsistent error reporting across components
5. **Type Safety**: No TypeScript, limited runtime validation

## 📦 Build & Deployment

- **Development**: `npm run dev` (nodemon)
- **Production**: `npm start` (node server.js)
- **Deployment**: Vercel serverless functions
- **Database**: Vercel PostgreSQL
- **Assets**: Static file serving via Express