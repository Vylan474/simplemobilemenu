// Hybrid database that uses PostgreSQL in production and file storage in development
const FileDatabase = require('./file-database');

// Check if PostgreSQL is available
let usePostgres = false;
let sql = null;
let fileDb = null;

try {
    const { sql: pgSql } = require('@vercel/postgres');
    // Test if we have a connection string
    if (process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING) {
        sql = pgSql;
        usePostgres = true;
        console.log('✅ Using PostgreSQL database');
    } else {
        throw new Error('No PostgreSQL connection available');
    }
} catch (error) {
    console.log('⚠️ PostgreSQL not available, using file-based storage for development');
    fileDb = new FileDatabase();
    usePostgres = false;
}

// Database initialization - create tables if they don't exist
async function initializeDatabase() {
    if (usePostgres) {
        return await initializePostgres();
    } else {
        return await fileDb.initializeDatabase();
    }
}

async function initializePostgres() {
    try {
        // Create users table
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(255) PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255),
                name VARCHAR(255) NOT NULL,
                restaurant VARCHAR(255),
                avatar TEXT,
                google_id VARCHAR(255) UNIQUE,
                plan VARCHAR(50) DEFAULT 'free',
                max_menus INTEGER DEFAULT 5,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                last_active TIMESTAMP WITH TIME ZONE
            )
        `;
        
        // Add google_id column if it doesn't exist (for existing tables)
        await sql`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE
        `;
        
        // Add enhanced profile fields
        await sql`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS last_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
            ADD COLUMN IF NOT EXISTS business_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS business_type VARCHAR(100),
            ADD COLUMN IF NOT EXISTS address TEXT,
            ADD COLUMN IF NOT EXISTS city VARCHAR(255),
            ADD COLUMN IF NOT EXISTS state VARCHAR(10),
            ADD COLUMN IF NOT EXISTS zip VARCHAR(20),
            ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN DEFAULT false
        `;

        // Create menus table
        await sql`
            CREATE TABLE IF NOT EXISTS menus (
                id VARCHAR(255) PRIMARY KEY,
                user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                slug VARCHAR(255) UNIQUE,
                title VARCHAR(255),
                subtitle VARCHAR(255),
                status VARCHAR(50) DEFAULT 'draft',
                published_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                section_counter INTEGER DEFAULT 0,
                
                -- Menu styling settings
                background_type VARCHAR(50) DEFAULT 'none',
                background_value TEXT,
                font_family VARCHAR(100) DEFAULT 'Inter',
                color_palette VARCHAR(50) DEFAULT 'classic',
                navigation_theme VARCHAR(50) DEFAULT 'modern',
                menu_logo TEXT,
                logo_size VARCHAR(20) DEFAULT 'medium',
                
                -- Published menu data
                published_menu_id VARCHAR(255),
                published_slug VARCHAR(255),
                published_title VARCHAR(255),
                published_subtitle VARCHAR(255)
            )
        `;

        // Create menu_sections table
        await sql`
            CREATE TABLE IF NOT EXISTS menu_sections (
                id SERIAL PRIMARY KEY,
                menu_id VARCHAR(255) REFERENCES menus(id) ON DELETE CASCADE,
                section_id INTEGER NOT NULL,
                name VARCHAR(255) NOT NULL,
                type VARCHAR(50) NOT NULL,
                columns JSONB DEFAULT '[]',
                title_columns JSONB DEFAULT '[]',
                items JSONB DEFAULT '[]',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                
                UNIQUE(menu_id, section_id)
            )
        `;

        // Create user_sessions table for authentication
        await sql`
            CREATE TABLE IF NOT EXISTS user_sessions (
                id VARCHAR(255) PRIMARY KEY,
                user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Create published_menus table for tracking published menu URLs
        await sql`
            CREATE TABLE IF NOT EXISTS published_menus (
                id SERIAL PRIMARY KEY,
                menu_id VARCHAR(255) REFERENCES menus(id) ON DELETE CASCADE,
                slug VARCHAR(255) UNIQUE NOT NULL,
                title VARCHAR(255),
                subtitle TEXT,
                published_data JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Create indexes for better performance
        await sql`CREATE INDEX IF NOT EXISTS idx_menus_user_id ON menus(user_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_menus_slug ON menus(slug)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_menu_sections_menu_id ON menu_sections(menu_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_published_menus_slug ON published_menus(slug)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_published_menus_menu_id ON published_menus(menu_id)`;
        
        console.log('PostgreSQL database initialized successfully');
        return { success: true };
    } catch (error) {
        console.error('PostgreSQL database initialization error:', error);
        return { success: false, error: error.message };
    }
}

// User operations
async function createUser(userData) {
    if (usePostgres) {
        return await createUserPostgres(userData);
    } else {
        return await fileDb.createUser(userData);
    }
}

async function createUserPostgres(userData) {
    const { 
        id, email, passwordHash, name, restaurant, avatar, plan = 'free', maxMenus = 5,
        googleId, profilePicture, firstName, lastName, phone, businessName, businessType,
        address, city, state, zip, marketingOptIn
    } = userData;
    
    try {
        const result = await sql`
            INSERT INTO users (
                id, email, password_hash, name, restaurant, avatar, google_id, plan, max_menus,
                first_name, last_name, phone, business_name, business_type, address, city, state, zip, marketing_opt_in
            )
            VALUES (
                ${id}, 
                ${email}, 
                ${passwordHash || null}, 
                ${name}, 
                ${restaurant || null}, 
                ${avatar || profilePicture || null}, 
                ${googleId || null}, 
                ${plan}, 
                ${maxMenus},
                ${firstName || null},
                ${lastName || null},
                ${phone || null},
                ${businessName || null},
                ${businessType || null},
                ${address || null},
                ${city || null},
                ${state || null},
                ${zip || null},
                ${marketingOptIn || false}
            )
            RETURNING *
        `;
        return { success: true, user: result.rows[0] };
    } catch (error) {
        console.error('Create user error:', error);
        return { success: false, error: error.message };
    }
}

async function getUserByEmail(email) {
    if (usePostgres) {
        try {
            const result = await sql`SELECT * FROM users WHERE email = ${email}`;
            return { success: true, user: result.rows[0] || null };
        } catch (error) {
            console.error('Get user by email error:', error);
            return { success: false, error: error.message };
        }
    } else {
        return await fileDb.getUserByEmail(email);
    }
}

async function getUserById(id) {
    if (usePostgres) {
        try {
            const result = await sql`SELECT * FROM users WHERE id = ${id}`;
            return { success: true, user: result.rows[0] || null };
        } catch (error) {
            console.error('Get user by ID error:', error);
            return { success: false, error: error.message };
        }
    } else {
        return await fileDb.getUserById(id);
    }
}

async function updateUserLastActive(userId) {
    if (usePostgres) {
        try {
            await sql`
                UPDATE users 
                SET last_active = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                WHERE id = ${userId}
            `;
            return { success: true };
        } catch (error) {
            console.error('Update user last active error:', error);
            return { success: false, error: error.message };
        }
    } else {
        return await fileDb.updateUserLastActive(userId);
    }
}

// Menu operations
async function createMenu(menuData) {
    if (usePostgres) {
        return await createMenuPostgres(menuData);
    } else {
        return await fileDb.createMenu(menuData);
    }
}

async function createMenuPostgres(menuData) {
    const {
        id, userId, name, description = null, slug = null, title = null, subtitle = null,
        backgroundType = 'none', backgroundValue = null, fontFamily = 'Inter', 
        colorPalette = 'classic', navigationTheme = 'modern', menuLogo = null, logoSize = 'medium'
    } = menuData;
    
    try {
        const result = await sql`
            INSERT INTO menus (
                id, user_id, name, description, slug, title, subtitle,
                background_type, background_value, font_family, color_palette,
                navigation_theme, menu_logo, logo_size
            )
            VALUES (
                ${id}, ${userId}, ${name}, ${description}, ${slug}, ${title}, ${subtitle},
                ${backgroundType}, ${backgroundValue}, ${fontFamily}, ${colorPalette},
                ${navigationTheme}, ${menuLogo}, ${logoSize}
            )
            RETURNING *
        `;
        return { success: true, menu: result.rows[0] };
    } catch (error) {
        console.error('Create menu error:', error);
        return { success: false, error: error.message };
    }
}

async function getUserMenus(userId) {
    if (usePostgres) {
        try {
            const result = await sql`
                SELECT m.*, 
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'id', ms.section_id,
                                'name', ms.name,
                                'type', ms.type,
                                'columns', ms.columns,
                                'titleColumns', ms.title_columns,
                                'items', ms.items
                            ) ORDER BY ms.section_id
                        ) FILTER (WHERE ms.id IS NOT NULL), 
                        '[]'::json
                    ) as sections
                FROM menus m
                LEFT JOIN menu_sections ms ON m.id = ms.menu_id
                WHERE m.user_id = ${userId} AND m.status != 'deleted'
                GROUP BY m.id
                ORDER BY m.updated_at DESC
            `;
            return { success: true, menus: result.rows };
        } catch (error) {
            console.error('Get user menus error:', error);
            return { success: false, error: error.message };
        }
    } else {
        return await fileDb.getUserMenus(userId);
    }
}

async function updateMenu(menuId, updates) {
    if (usePostgres) {
        try {
            const setClause = [];
            const values = [];
            let paramCounter = 1;
            
            // Build dynamic SET clause
            for (const [key, value] of Object.entries(updates)) {
                // Convert camelCase to snake_case for database columns
                const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                setClause.push(`${dbKey} = $${paramCounter}`);
                values.push(value);
                paramCounter++;
            }
            
            setClause.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(menuId);
            
            const query = `
                UPDATE menus 
                SET ${setClause.join(', ')}
                WHERE id = $${paramCounter}
                RETURNING *
            `;
            
            const result = await sql.query(query, values);
            return { success: true, menu: result.rows[0] };
        } catch (error) {
            console.error('Update menu error:', error);
            return { success: false, error: error.message };
        }
    } else {
        return await fileDb.updateMenu(menuId, updates);
    }
}

// Menu sections operations
async function saveMenuSections(menuId, sections) {
    if (usePostgres) {
        try {
            // Delete existing sections
            await sql`DELETE FROM menu_sections WHERE menu_id = ${menuId}`;
            
            // Insert new sections
            for (const section of sections) {
                await sql`
                    INSERT INTO menu_sections (menu_id, section_id, name, type, columns, title_columns, items)
                    VALUES (
                        ${menuId}, 
                        ${section.id}, 
                        ${section.name}, 
                        ${section.type},
                        ${JSON.stringify(section.columns)},
                        ${JSON.stringify(section.titleColumns || section.columns)},
                        ${JSON.stringify(section.items || [])}
                    )
                `;
            }
            
            return { success: true };
        } catch (error) {
            console.error('Save menu sections error:', error);
            return { success: false, error: error.message };
        }
    } else {
        return await fileDb.saveMenuSections(menuId, sections);
    }
}

// Session operations (for authentication)
async function createSession(sessionId, userId, expiresAt) {
    if (usePostgres) {
        try {
            await sql`
                INSERT INTO user_sessions (id, user_id, expires_at)
                VALUES (${sessionId}, ${userId}, ${expiresAt})
            `;
            return true;
        } catch (error) {
            console.error('Create session error:', error);
            return false;
        }
    } else {
        return await fileDb.createSession(sessionId, userId, expiresAt);
    }
}

async function getSession(sessionId) {
    if (usePostgres) {
        try {
            const result = await sql`
                SELECT * FROM user_sessions 
                WHERE id = ${sessionId} AND expires_at > CURRENT_TIMESTAMP
            `;
            return result.rows[0] || null;
        } catch (error) {
            console.error('Get session error:', error);
            return null;
        }
    } else {
        return await fileDb.getSession(sessionId);
    }
}

async function deleteSession(sessionId) {
    if (usePostgres) {
        try {
            await sql`DELETE FROM user_sessions WHERE id = ${sessionId}`;
            return true;
        } catch (error) {
            console.error('Delete session error:', error);
            return false;
        }
    } else {
        return await fileDb.deleteSession(sessionId);
    }
}

// Admin operations
async function getAllUsers() {
    if (usePostgres) {
        try {
            const result = await sql`
                SELECT u.*, 
                    COUNT(m.id) as menu_count,
                    COUNT(CASE WHEN m.status = 'published' THEN 1 END) as published_count
                FROM users u
                LEFT JOIN menus m ON u.id = m.user_id
                GROUP BY u.id
                ORDER BY u.created_at DESC
            `;
            return { success: true, users: result.rows };
        } catch (error) {
            console.error('Get all users error:', error);
            return { success: false, error: error.message };
        }
    } else {
        return await fileDb.getAllUsers();
    }
}

module.exports = {
    initializeDatabase,
    createUser,
    getUserByEmail,
    getUserById,
    updateUserLastActive,
    createMenu,
    getUserMenus,
    updateMenu,
    saveMenuSections,
    createSession,
    getSession,
    deleteSession,
    getAllUsers
};