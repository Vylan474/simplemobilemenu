# Test Plan & Smoke Tests

## 🧪 Automated Test Setup

Currently, the project has no automated test framework. The following commands should be added to `package.json`:

```json
{
  "scripts": {
    "test": "echo 'No tests configured'",
    "lint": "echo 'No linting configured'", 
    "typecheck": "echo 'No TypeScript configured'"
  }
}
```

## 📋 Manual Smoke Test Checklist

### Prerequisites
1. **Environment Setup**
   ```bash
   npm install
   npm run dev
   ```
2. **Database Connection**: Ensure Vercel PostgreSQL is accessible
3. **Google OAuth**: Verify OAuth client is configured
4. **Test Browser**: Use Chrome/Firefox with dev tools open

### 🔐 Authentication Flow
**Critical Path**: User must be able to authenticate to access editor

- [ ] **Load Landing Page**
  - Navigate to `http://localhost:3000` or production URL
  - Verify landing page loads without errors
  - Check console for no JS errors

- [ ] **Google OAuth Login**
  - Click "Sign in with Google" button
  - Complete OAuth flow in popup/redirect
  - Verify user is redirected to editor
  - Check that auth modal disappears
  - Confirm user name appears in sidebar

- [ ] **Session Persistence**
  - Refresh the page
  - Verify user remains authenticated
  - Check that previous menu loads if exists

### 📝 Menu Management (Core Feature)
**Critical Path**: User must be able to create and edit menus

#### Menu Creation
- [ ] **Create New Menu**
  - Click sidebar hamburger → "Create New Menu"
  - Enter menu name, verify it appears in sidebar
  - Check that editor loads with empty menu

#### Section Management
- [ ] **Add Menu Section**
  - Click "Add Section" button
  - Select section type (e.g., "Wine", "Cocktails", "Food")
  - Verify section appears in editor
  - **BUG CHECK**: Ensure only ONE section is added per click

- [ ] **Edit Section**
  - Click pencil icon on section header
  - Modify section name
  - Verify changes persist after save

- [ ] **Delete Section**
  - Click trash icon on section
  - Confirm deletion modal appears
  - Verify section is removed

#### Menu Items Management
- [ ] **Add Menu Item**
  - Click "Add Item" within a section
  - **BUG CHECK**: Verify exactly ONE item is added (not 3)
  - Fill in item details (name, price, description)
  - Click save, verify item appears

- [ ] **Edit Menu Item**
  - Click edit icon on menu item
  - Modify details
  - Save and verify changes persist

- [ ] **Delete Menu Item**
  - Click delete icon on menu item
  - Confirm deletion
  - Verify item is removed

### 🎨 Styling & Customization
**Critical Path**: Styling options must work without breaking editor

- [ ] **Background Selection**
  - Click "Background" dropdown
  - Select predefined image
  - Verify background applies to preview areas
  - **BUG CHECK**: Ensure dropdown functions properly

- [ ] **Font Selection**
  - Click "Font" dropdown
  - Select different font family
  - Verify font changes in preview

- [ ] **Color Palette**
  - Click "Colors" dropdown  
  - Select different color scheme
  - Verify colors apply to menu elements

- [ ] **Navigation Theme**
  - Click "Navigation" dropdown
  - Select different navigation style
  - Verify navigation appearance changes

- [ ] **Dark Mode Toggle**
  - Click dark mode toggle in sidebar
  - **BUG CHECK**: Ensure toggle responds to clicks
  - Verify UI switches to dark theme
  - Toggle back to light mode

### 📤 File Uploads
**Critical Path**: Users must be able to upload custom assets

- [ ] **Logo Upload**
  - Click logo upload area
  - Select image file (< 5MB)
  - Verify logo appears in menu header
  - Check console for upload success

- [ ] **Background Image Upload**
  - Click background dropdown → "Upload Custom"
  - Select image file (< 5MB)
  - Verify background applies
  - **BUG CHECK**: Ensure base64 encoding works

### 📱 Live Preview
**Critical Path**: Users need to see menu as customers would

- [ ] **Toggle Preview**
  - Click "Toggle Live Preview"
  - Verify preview pane appears/disappears
  - Check that preview matches editor content

- [ ] **Mobile Preview**
  - Open preview in mobile view
  - Verify responsive layout works
  - Check navigation functionality

### 🌐 Publishing Flow
**Critical Path**: Menus must publish to public URLs correctly

- [ ] **Menu Publishing**
  - Click "Publish Menu" button
  - Enter custom URL slug
  - Add menu title and subtitle
  - Click "Publish Now"
  - Verify success message appears

- [ ] **Published Menu Access**
  - Copy published menu URL
  - Open in incognito/private browser window
  - **BUG CHECK**: Verify background images load correctly
  - Check that all menu sections display
  - Verify styling (fonts, colors, navigation) matches editor

- [ ] **Published Menu Updates**
  - Make changes in editor
  - Re-publish menu
  - Refresh published URL
  - Verify changes appear

### 💾 Data Persistence
**Critical Path**: User data must not be lost

- [ ] **Auto-save Functionality**
  - Make changes to menu
  - Wait for "Saved" indicator
  - Refresh page
  - Verify changes persist

- [ ] **Menu Switching**
  - Create multiple menus
  - Switch between menus in sidebar
  - Verify each menu loads correctly
  - Check that changes don't leak between menus

### 👥 Admin Portal
**Critical Path**: Admin functionality must be accessible

- [ ] **Admin Access**
  - Navigate to `/admin`
  - Verify admin dashboard loads
  - Check user list displays
  - Verify menu statistics appear

### 🚨 Error Scenarios
**Critical Path**: App should handle errors gracefully

- [ ] **Network Errors**
  - Disconnect internet during save
  - Verify error message appears
  - Reconnect and verify retry works

- [ ] **Invalid File Uploads**
  - Try uploading oversized file (> 5MB)
  - Verify appropriate error message
  - Try uploading non-image file
  - Verify rejection with clear message

- [ ] **Invalid Menu URLs**
  - Try publishing with invalid slug characters
  - Verify validation error
  - Try duplicate slug
  - Verify conflict error

## 🔍 Browser Console Checklist

### During Each Test, Monitor Console For:
- [ ] No JavaScript errors or exceptions
- [ ] No 404 errors for assets/API calls
- [ ] No authentication failures
- [ ] Successful API response logs
- [ ] Appropriate debug logging (not excessive)

### Network Tab Verification:
- [ ] API calls return expected status codes
- [ ] No failed resource loads
- [ ] Reasonable response times (< 2s for most operations)

## 📊 Performance Baseline

### Load Time Expectations:
- [ ] Initial page load: < 3 seconds
- [ ] Menu switching: < 1 second
- [ ] Publish operation: < 5 seconds
- [ ] Image upload: < 10 seconds for 5MB file

### Memory Usage:
- [ ] No obvious memory leaks during extended use
- [ ] Page refresh clears previous state properly

## 🐞 Known Bug Verification

### Recently Fixed Issues to Re-test:
- [ ] **Dark mode toggle**: Verify it responds to clicks
- [ ] **Menu sections loading**: Verify sections display after auth
- [ ] **Styling buttons**: Verify background/font/color/navigation dropdowns work
- [ ] **Background images on published pages**: Verify images display correctly

### Previously Reported Issues to Check:
- [ ] **"Add Menu Item" multiplier bug**: Verify only 1 item added per click
- [ ] **Duplicate event listeners**: Monitor for double-firing events
- [ ] **Session persistence**: Verify auth state survives page refresh

## ✅ Pass/Fail Criteria

### ❌ **Critical Failures** (Stop and Fix):
- Authentication completely broken
- Cannot create or edit menus
- Published menus don't display
- Data loss on page refresh
- JavaScript errors breaking core functionality

### ⚠️ **Minor Issues** (Document but Continue):
- Styling inconsistencies
- Non-critical UI glitches
- Performance slightly outside targets
- Minor console warnings

### ✅ **Success Criteria**:
- All critical paths complete without errors
- No data loss scenarios
- Published menus accessible and display correctly
- Core CRUD operations work reliably
- Authentication and authorization function properly

## 🎯 Regression Testing

After any refactoring, re-run this entire checklist to ensure no functionality was broken. Pay special attention to:

1. **State management changes** → Test menu switching and persistence
2. **Event listener modifications** → Test all interactive elements  
3. **API changes** → Test all CRUD operations
4. **Authentication changes** → Test login/logout flows
5. **Styling changes** → Test all customization options