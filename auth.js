// Authentication Management System
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.firebase = null;
        this.auth = null;
        this.googleProvider = null;
        
        this.initializeAuth();
    }
    
    async initializeAuth() {
        // Initialize Firebase if available
        if (typeof firebase !== 'undefined') {
            this.firebase = window.initializeFirebase();
            if (this.firebase) {
                this.auth = this.firebase.auth;
                this.googleProvider = this.firebase.googleProvider;
                
                // Listen for auth state changes
                this.auth.onAuthStateChanged((user) => {
                    this.handleAuthStateChange(user);
                });
            }
        }
        
        // Check for existing local user session
        this.loadLocalUser();
    }
    
    loadLocalUser() {
        const userData = localStorage.getItem('current-user');
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.notifyAuthChange(this.currentUser);
            } catch (error) {
                console.error('Error loading local user:', error);
                localStorage.removeItem('current-user');
            }
        }
    }
    
    handleAuthStateChange(firebaseUser) {
        if (firebaseUser) {
            // Firebase user signed in
            const user = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'User',
                email: firebaseUser.email,
                avatar: firebaseUser.photoURL,
                provider: 'google',
                isFirebaseUser: true,
                createdAt: new Date().toISOString(),
                maxMenus: 10 // Default limit for new users
            };
            
            this.currentUser = user;
            this.saveUserData();
            this.notifyAuthChange(user);
        } else if (!this.currentUser) {
            // No user signed in
            this.currentUser = null;
            this.notifyAuthChange(null);
        }
    }
    
    async signInWithGoogle() {
        if (!this.auth || !this.googleProvider) {
            throw new Error('Firebase not initialized');
        }
        
        try {
            const result = await this.auth.signInWithPopup(this.googleProvider);
            return result.user;
        } catch (error) {
            console.error('Google sign-in error:', error);
            throw error;
        }
    }
    
    async signInWithEmail(email, password) {
        // For demo purposes, create a local user
        // In production, this would validate against your backend
        
        // Check if user exists in local storage
        const existingUsers = this.getLocalUsers();
        const user = existingUsers.find(u => u.email === email);
        
        if (user && this.validatePassword(password, user.passwordHash)) {
            this.currentUser = user;
            this.saveUserData();
            this.notifyAuthChange(user);
            return user;
        } else {
            throw new Error('Invalid email or password');
        }
    }
    
    async signUpWithEmail(userData) {
        const { name, email, restaurant, password } = userData;
        
        // Check if user already exists
        const existingUsers = this.getLocalUsers();
        if (existingUsers.some(u => u.email === email)) {
            throw new Error('User already exists with this email');
        }
        
        // Create new user
        const newUser = {
            id: this.generateUserId(),
            name,
            email,
            restaurant,
            passwordHash: this.hashPassword(password),
            provider: 'email',
            isFirebaseUser: false,
            createdAt: new Date().toISOString(),
            maxMenus: 3, // Starter plan limit
            plan: 'starter'
        };
        
        // Save to local users list
        existingUsers.push(newUser);
        localStorage.setItem('app-users', JSON.stringify(existingUsers));
        console.log('User saved to localStorage. Total users now:', existingUsers.length);
        console.log('New user created:', newUser);
        
        // Set as current user
        this.currentUser = newUser;
        this.saveUserData();
        this.notifyAuthChange(newUser);
        
        return newUser;
    }
    
    async signInWithEmail(email, password) {
        console.log('Attempting sign in for email:', email);
        
        const existingUsers = this.getLocalUsers();
        console.log('Found existing users:', existingUsers.length);
        console.log('Existing user emails:', existingUsers.map(u => u.email));
        
        const user = existingUsers.find(u => u.email === email);
        console.log('Found user:', user ? 'Yes' : 'No');
        
        if (!user) {
            throw new Error('No account found with this email');
        }
        
        const providedHash = this.hashPassword(password);
        console.log('Password validation - provided hash:', providedHash, 'stored hash:', user.passwordHash);
        
        if (!this.validatePassword(password, user.passwordHash)) {
            throw new Error('Incorrect password');
        }
        
        // Set as current user
        this.currentUser = user;
        this.saveUserData();
        this.notifyAuthChange(user);
        
        console.log('Sign in successful for user:', user.name);
        return user;
    }
    
    async signOut() {
        // Sign out from Firebase if applicable
        if (this.auth && this.currentUser?.isFirebaseUser) {
            await this.auth.signOut();
        }
        
        // Clear local session
        this.currentUser = null;
        localStorage.removeItem('current-user');
        this.notifyAuthChange(null);
        
        // Redirect to landing page
        if (window.location.pathname.includes('index.html')) {
            window.location.href = 'landing.html';
        }
    }
    
    getLocalUsers() {
        try {
            return JSON.parse(localStorage.getItem('app-users') || '[]');
        } catch {
            return [];
        }
    }
    
    saveUserData() {
        if (this.currentUser) {
            localStorage.setItem('current-user', JSON.stringify(this.currentUser));
        }
    }
    
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    hashPassword(password) {
        // Simple hash for demo purposes
        // In production, use proper bcrypt or similar
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }
    
    validatePassword(password, hash) {
        return this.hashPassword(password) === hash;
    }
    
    notifyAuthChange(user) {
        // Dispatch custom event for other parts of the app to listen to
        const event = new CustomEvent('authStateChanged', { 
            detail: { user } 
        });
        document.dispatchEvent(event);
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    isSignedIn() {
        return !!this.currentUser;
    }
    
    getUserMenus() {
        if (!this.currentUser) return [];
        
        const allMenus = JSON.parse(localStorage.getItem('user-menus') || '{}');
        return allMenus[this.currentUser.id] || [];
    }
    
    saveUserMenu(menu) {
        if (!this.currentUser) return;
        
        const allMenus = JSON.parse(localStorage.getItem('user-menus') || '{}');
        if (!allMenus[this.currentUser.id]) {
            allMenus[this.currentUser.id] = [];
        }
        
        const userMenus = allMenus[this.currentUser.id];
        const existingIndex = userMenus.findIndex(m => m.id === menu.id);
        
        if (existingIndex >= 0) {
            userMenus[existingIndex] = menu;
        } else {
            userMenus.push(menu);
        }
        
        localStorage.setItem('user-menus', JSON.stringify(allMenus));
    }
    
    deleteUserMenu(menuId) {
        if (!this.currentUser) return;
        
        const allMenus = JSON.parse(localStorage.getItem('user-menus') || '{}');
        if (allMenus[this.currentUser.id]) {
            allMenus[this.currentUser.id] = allMenus[this.currentUser.id].filter(m => m.id !== menuId);
            localStorage.setItem('user-menus', JSON.stringify(allMenus));
        }
    }
    
    createMenu(menuData) {
        if (!this.currentUser) return { success: false, error: 'User not authenticated' };
        
        const newMenu = {
            id: 'menu_' + Date.now(),
            name: menuData.name || 'New Menu',
            description: menuData.description || '',
            sections: menuData.sections || [],
            sectionCounter: menuData.sectionCounter || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'draft',
            fontFamily: menuData.fontFamily || 'Inter',
            colorPalette: menuData.colorPalette || 'classic',
            backgroundType: menuData.backgroundType || 'none',
            backgroundValue: menuData.backgroundValue || null,
            menuLogo: menuData.menuLogo || null,
            logoSize: menuData.logoSize || 'medium',
            navigationTheme: menuData.navigationTheme || 'modern',
            publishedMenuId: null,
            publishedSlug: null,
            publishedTitle: null,
            publishedSubtitle: null
        };
        
        this.saveUserMenu(newMenu);
        return { success: true, menu: newMenu };
    }
    
    // Create demo data for new users
    createDemoMenu() {
        if (!this.currentUser) return null;
        
        const demoMenu = {
            id: 'menu_' + Date.now(),
            name: `${this.currentUser.restaurant || 'My Restaurant'} Menu`,
            description: 'Demo menu created automatically',
            sections: [
                {
                    id: 1,
                    name: 'Appetizers',
                    type: 'food',
                    columns: ['Item Name', 'Description', 'Price'],
                    titleColumns: ['Item Name'],
                    items: [
                        { 'Item Name': 'Caesar Salad', 'Description': 'Crisp romaine lettuce with parmesan and croutons', 'Price': '12' },
                        { 'Item Name': 'Truffle Arancini', 'Description': 'Creamy risotto balls with black truffle', 'Price': '16' }
                    ]
                },
                {
                    id: 2,
                    name: 'Cocktails',
                    type: 'cocktails',
                    columns: ['Cocktail Name', 'Description', 'Base Spirit', 'Price'],
                    titleColumns: ['Cocktail Name'],
                    items: [
                        { 'Cocktail Name': 'Old Fashioned', 'Description': 'Classic whiskey cocktail with bitters', 'Base Spirit': 'Bourbon', 'Price': '14' }
                    ]
                }
            ],
            sectionCounter: 2,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'draft',
            fontFamily: 'Inter',
            colorPalette: 'classic',
            backgroundType: 'none',
            backgroundValue: null,
            menuLogo: null,
            logoSize: 'medium'
        };
        
        this.saveUserMenu(demoMenu);
        return demoMenu;
    }
}

// Create global auth manager instance
window.authManager = new AuthManager();

// Export for use in other files
window.AuthManager = AuthManager;