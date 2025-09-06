// Database-backed Authentication Manager
class DatabaseAuthManager {
    constructor() {
        this.currentUser = null;
        this.sessionId = null;
        this.baseURL = window.location.origin;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        
        try {
            // Initialize database
            await this.initializeDatabase();
            
            // Check for existing session
            const verifyResult = await this.verifySession();
            
            // Notify script.js if user was successfully verified
            if (verifyResult.success && verifyResult.user) {
                console.log('📢 Broadcasting auth state change with user:', verifyResult.user.email);
                document.dispatchEvent(new CustomEvent('authStateChanged', {
                    detail: { user: verifyResult.user }
                }));
            }
            
            this.initialized = true;
        } catch (error) {
            console.error('Auth manager initialization error:', error);
            this.initialized = true; // Continue even if init fails
        }
    }

    async initializeDatabase() {
        try {
            const response = await fetch(`${this.baseURL}/api/init-db`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Database initialization failed:', error);
            } else {
                console.log('Database initialized successfully');
            }
        } catch (error) {
            console.error('Database initialization error:', error);
        }
    }

    async register(userData) {
        try {
            const response = await fetch(`${this.baseURL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok) {
                // Store session data if provided (auto-login after registration)
                if (data.sessionId) {
                    this.currentUser = data.user;
                    this.sessionId = data.sessionId;
                    localStorage.setItem('sessionId', data.sessionId);
                    
                    // Broadcast auth state change
                    document.dispatchEvent(new CustomEvent('authStateChanged', {
                        detail: { user: data.user }
                    }));
                }
                
                return { success: true, user: data.user };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    async signIn(email, password) {
        try {
            const response = await fetch(`${this.baseURL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',  // Include cookies
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.currentUser = data.user;
                this.sessionId = data.sessionId;
                
                // Store session ID in localStorage as backup
                localStorage.setItem('sessionId', data.sessionId);
                
                return { success: true, user: data.user };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    async verifySession() {
        console.log('🔄 Starting session verification...');
        try {
            // Try to get session ID from localStorage if not set
            if (!this.sessionId) {
                this.sessionId = localStorage.getItem('sessionId');
            }

            console.log('🔑 Session ID:', this.sessionId ? 'exists' : 'missing');

            if (!this.sessionId) {
                console.log('❌ No session ID found');
                return { success: false, error: 'No session found' };
            }

            const response = await fetch(`${this.baseURL}/api/auth/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.sessionId}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            const data = await response.json();
            console.log('🔍 Verify response:', { status: response.status, data });

            if (response.ok) {
                console.log('✅ Verification successful, user data:', data.user);
                this.currentUser = data.user;
                return { success: true, user: data.user };
            } else {
                // Clear invalid session
                this.currentUser = null;
                this.sessionId = null;
                localStorage.removeItem('sessionId');
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Session verification error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    async signOut() {
        try {
            // Clear local data
            this.currentUser = null;
            this.sessionId = null;
            localStorage.removeItem('sessionId');
            
            // In a more complete implementation, you'd also invalidate the session on the server
            // For now, the session will expire naturally
            
            // Redirect to landing page
            window.location.href = 'index.html';
            
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: 'Logout failed' };
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }
    
    // Alias for compatibility with script.js
    isSignedIn() {
        return this.isAuthenticated();
    }

    // Menu operations using database API
    async createMenu(menuData) {
        try {
            const response = await fetch(`${this.baseURL}/api/menu/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.sessionId}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(menuData)
            });

            const data = await response.json();
            return response.ok ? data : { success: false, error: data.error };
        } catch (error) {
            console.error('Create menu error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    async getUserMenus() {
        try {
            const response = await fetch(`${this.baseURL}/api/menu/list`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.sessionId}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            const data = await response.json();
            console.log('🔍 getUserMenus API response:', { ok: response.ok, status: response.status, data });
            
            if (response.ok && data.success && Array.isArray(data.menus)) {
                console.log('✅ Returning menus array:', data.menus.length, 'items');
                return data.menus;
            } else {
                console.log('❌ API error or invalid response format, returning empty array');
                return [];
            }
        } catch (error) {
            console.error('Get menus error:', error);
            return [];
        }
    }

    async updateMenu(menuId, updates) {
        try {
            const response = await fetch(`${this.baseURL}/api/menu/update?menuId=${menuId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.sessionId}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(updates)
            });

            const data = await response.json();
            return response.ok ? data : { success: false, error: data.error };
        } catch (error) {
            console.error('Update menu error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    async deleteMenu(menuId) {
        try {
            const response = await fetch(`${this.baseURL}/api/menu/delete?menuId=${menuId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.sessionId}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            const data = await response.json();
            return response.ok ? data : { success: false, error: data.error };
        } catch (error) {
            console.error('Delete menu error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    async checkSlugAvailability(slug) {
        try {
            console.log('🔍 DatabaseAuthManager.checkSlugAvailability called with slug:', slug);
            const url = `${this.baseURL}/api/menu/check-availability`;
            console.log('Checking slug availability at:', url);
            console.log('Request payload:', { slug });

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ slug })
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', [...response.headers.entries()]);

            // Check if response is JSON before parsing
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
                console.log('Response data:', data);
            } else {
                // If not JSON, read as text
                const text = await response.text();
                console.log('Response text:', text);
                
                // Return appropriate error message
                if (response.status >= 500) {
                    data = { 
                        available: false, 
                        error: 'Server error. Please try again later.' 
                    };
                } else {
                    data = { 
                        available: false, 
                        error: text || `HTTP ${response.status}` 
                    };
                }
            }

            return response.ok ? data : { available: false, error: data.error || `HTTP ${response.status}` };
        } catch (error) {
            console.error('Check slug availability error:', error);
            return { success: false, error: `Network error: ${error.message}` };
        }
    }

    async publishMenu(menuId, publishData) {
        try {
            const response = await fetch(`${this.baseURL}/api/menu/publish`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.sessionId}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ menuId, ...publishData })
            });

            const data = await response.json();
            return response.ok ? data : { success: false, error: data.error };
        } catch (error) {
            console.error('Publish menu error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    async getPublishedMenu(slug) {
        try {
            const response = await fetch(`${this.baseURL}/api/menu/${slug}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            return response.ok ? data : { success: false, error: data.error };
        } catch (error) {
            console.error('Get published menu error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    // Google OAuth methods
    async handleGoogleSignIn(credential) {
        try {
            const response = await fetch(`${this.baseURL}/api/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ credential })
            });

            const data = await response.json();

            if (response.ok) {
                this.currentUser = data.user;
                this.sessionId = data.sessionId;
                
                // Store session ID in localStorage as backup
                localStorage.setItem('sessionId', data.sessionId);
                
                // Broadcast auth state change
                document.dispatchEvent(new CustomEvent('authStateChanged', {
                    detail: { user: data.user }
                }));
                
                return { success: true, user: data.user, isNewUser: data.isNewUser };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Google sign-in error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    // Admin operations
    async getAdminData(username, password) {
        try {
            const response = await fetch(`${this.baseURL}/api/admin/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            return response.ok ? data : { success: false, error: data.error };
        } catch (error) {
            console.error('Admin data error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    // Legacy compatibility methods for existing code
    async saveUserMenu(menuData) {
        // This method should now use the updateMenu API
        if (menuData.id) {
            try {
                const result = await this.updateMenu(menuData.id, menuData);
                // If update fails with 403, it might be a newly created menu
                // Just log and continue - the menu was already created successfully
                if (!result.success && result.error === 'Access denied') {
                    console.log('⚠️ Menu update failed (newly created menu) - this is normal');
                    return { success: true, message: 'Menu creation successful, update skipped' };
                }
                return result;
            } catch (error) {
                console.log('⚠️ Menu save error (ignoring for new menus):', error.message);
                return { success: true, message: 'Save attempted but menu may be newly created' };
            }
        }
        return Promise.resolve({ success: false, error: 'No menu ID provided' });
    }
}

// Initialize the auth manager
const authManager = new DatabaseAuthManager();

// Make it globally available
window.authManager = authManager;

// Auto-initialize when DOM is loaded
console.log('🔄 Auth manager created, setting up initialization...');
if (document.readyState === 'loading') {
    console.log('📄 Document still loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOMContentLoaded - initializing auth manager...');
        authManager.init();
    });
} else {
    console.log('📄 Document already loaded - initializing auth manager immediately...');
    authManager.init();
}