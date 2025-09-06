const fs = require('fs');
const path = require('path');

// File-based database for local development
class FileDatabase {
    constructor() {
        this.dataDir = path.join(__dirname, '..', 'data');
        this.ensureDataDirectory();
    }

    ensureDataDirectory() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
        
        // Initialize empty data files if they don't exist
        const files = ['users.json', 'menus.json', 'sessions.json', 'published_menus.json'];
        files.forEach(file => {
            const filePath = path.join(this.dataDir, file);
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, '[]');
            }
        });
    }

    readData(filename) {
        try {
            const filePath = path.join(this.dataDir, filename);
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error reading ${filename}:`, error);
            return [];
        }
    }

    writeData(filename, data) {
        try {
            const filePath = path.join(this.dataDir, filename);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            return true;
        } catch (error) {
            console.error(`Error writing ${filename}:`, error);
            return false;
        }
    }

    // User operations
    async createUser(userData) {
        try {
            const users = this.readData('users.json');
            users.push({
                ...userData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
            
            if (this.writeData('users.json', users)) {
                return { success: true, user: userData };
            } else {
                return { success: false, error: 'Failed to save user' };
            }
        } catch (error) {
            console.error('Create user error:', error);
            return { success: false, error: error.message };
        }
    }

    async getUserByEmail(email) {
        try {
            const users = this.readData('users.json');
            const user = users.find(u => u.email === email);
            return { success: true, user: user || null };
        } catch (error) {
            console.error('Get user by email error:', error);
            return { success: false, error: error.message };
        }
    }

    async getUserById(id) {
        try {
            const users = this.readData('users.json');
            const user = users.find(u => u.id === id);
            return { success: true, user: user || null };
        } catch (error) {
            console.error('Get user by ID error:', error);
            return { success: false, error: error.message };
        }
    }

    async updateUserLastActive(userId) {
        try {
            const users = this.readData('users.json');
            const userIndex = users.findIndex(u => u.id === userId);
            
            if (userIndex !== -1) {
                users[userIndex].last_active = new Date().toISOString();
                users[userIndex].updated_at = new Date().toISOString();
                
                if (this.writeData('users.json', users)) {
                    return { success: true };
                }
            }
            
            return { success: false, error: 'User not found' };
        } catch (error) {
            console.error('Update user last active error:', error);
            return { success: false, error: error.message };
        }
    }

    // Menu operations
    async createMenu(menuData) {
        try {
            const menus = this.readData('menus.json');
            const menu = {
                ...menuData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                status: 'draft'
            };
            
            menus.push(menu);
            
            if (this.writeData('menus.json', menus)) {
                return { success: true, menu };
            } else {
                return { success: false, error: 'Failed to save menu' };
            }
        } catch (error) {
            console.error('Create menu error:', error);
            return { success: false, error: error.message };
        }
    }

    async getUserMenus(userId) {
        try {
            const menus = this.readData('menus.json');
            const userMenus = menus.filter(m => m.user_id === userId && m.status !== 'deleted');
            
            // Add empty sections array to each menu for compatibility
            const menusWithSections = userMenus.map(menu => ({
                ...menu,
                sections: menu.sections || []
            }));
            
            return { success: true, menus: menusWithSections };
        } catch (error) {
            console.error('Get user menus error:', error);
            return { success: false, error: error.message };
        }
    }

    async updateMenu(menuId, updates) {
        try {
            const menus = this.readData('menus.json');
            const menuIndex = menus.findIndex(m => m.id === menuId);
            
            if (menuIndex !== -1) {
                menus[menuIndex] = {
                    ...menus[menuIndex],
                    ...updates,
                    updated_at: new Date().toISOString()
                };
                
                if (this.writeData('menus.json', menus)) {
                    return { success: true, menu: menus[menuIndex] };
                }
            }
            
            return { success: false, error: 'Menu not found' };
        } catch (error) {
            console.error('Update menu error:', error);
            return { success: false, error: error.message };
        }
    }

    // Session operations
    async createSession(sessionId, userId, expiresAt) {
        try {
            const sessions = this.readData('sessions.json');
            sessions.push({
                id: sessionId,
                user_id: userId,
                expires_at: expiresAt,
                created_at: new Date().toISOString()
            });
            
            return this.writeData('sessions.json', sessions);
        } catch (error) {
            console.error('Create session error:', error);
            return false;
        }
    }

    async getSession(sessionId) {
        try {
            const sessions = this.readData('sessions.json');
            const session = sessions.find(s => s.id === sessionId);
            
            if (session) {
                // Check if session is expired
                const now = new Date();
                const expiresAt = new Date(session.expires_at);
                
                if (now > expiresAt) {
                    // Clean up expired session
                    await this.deleteSession(sessionId);
                    return null;
                }
                
                return session;
            }
            
            return null;
        } catch (error) {
            console.error('Get session error:', error);
            return null;
        }
    }

    async deleteSession(sessionId) {
        try {
            const sessions = this.readData('sessions.json');
            const filteredSessions = sessions.filter(s => s.id !== sessionId);
            return this.writeData('sessions.json', filteredSessions);
        } catch (error) {
            console.error('Delete session error:', error);
            return false;
        }
    }

    // Admin operations
    async getAllUsers() {
        try {
            const users = this.readData('users.json');
            const menus = this.readData('menus.json');
            
            const usersWithCounts = users.map(user => {
                const userMenus = menus.filter(m => m.user_id === user.id);
                const publishedMenus = userMenus.filter(m => m.status === 'published');
                
                return {
                    ...user,
                    menu_count: userMenus.length,
                    published_count: publishedMenus.length
                };
            });
            
            return { success: true, users: usersWithCounts };
        } catch (error) {
            console.error('Get all users error:', error);
            return { success: false, error: error.message };
        }
    }

    // Initialize database (no-op for file system)
    async initializeDatabase() {
        try {
            this.ensureDataDirectory();
            console.log('File-based database initialized successfully');
            return { success: true };
        } catch (error) {
            console.error('File database initialization error:', error);
            return { success: false, error: error.message };
        }
    }

    // Menu sections operations (simplified for file storage)
    async saveMenuSections(menuId, sections) {
        try {
            const menus = this.readData('menus.json');
            const menuIndex = menus.findIndex(m => m.id === menuId);
            
            if (menuIndex !== -1) {
                menus[menuIndex].sections = sections;
                menus[menuIndex].updated_at = new Date().toISOString();
                
                if (this.writeData('menus.json', menus)) {
                    return { success: true };
                }
            }
            
            return { success: false, error: 'Menu not found' };
        } catch (error) {
            console.error('Save menu sections error:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = FileDatabase;