class MenuEditor {
    constructor() {
        this.sections = [];
        this.currentSectionId = null;
        this.sectionCounter = 0;
        this.sortableInstances = [];
        this.sidePreviewVisible = false;
        this.navExpanded = false;
        this.publishedMenuId = null;
        this.publishedSlug = null;
        this.publishedTitle = null;
        this.publishedSubtitle = null;
        
        // Multi-user and multi-menu support
        this.currentUser = null;
        this.currentMenuId = null;
        this.sidebarOpen = false;
        
        // Dark mode
        this.darkMode = localStorage.getItem('darkMode') === 'true';
        
        // Change tracking
        this.hasUnsavedChanges = false;
        this.lastSavedState = null;
        this.autoSaveTimeout = null;
        
        // Logo properties
        this.menuLogo = null;
        this.logoSize = 'medium'; // small, medium, large
        
        // Background properties
        this.backgroundType = 'none'; // 'none', 'image', 'color'
        this.backgroundValue = null; // image path or color hex
        this.backgroundDropdownOpen = false;
        
        // Typography properties
        this.fontFamily = 'Inter'; // default font family
        this.fontDropdownOpen = false;
        
        // Color palette properties
        this.colorPalette = 'classic'; // default color palette
        this.colorDropdownOpen = false;
        
        // Navigation theme properties
        this.navigationTheme = 'modern'; // default navigation theme
        this.navigationDropdownOpen = false;
        
        this.sectionTemplates = {
            food: {
                name: 'Food Items',
                columns: ['Item Name', 'Description', 'Price'],
                titleColumns: ['Item Name', 'Price']
            },
            beer: {
                name: 'Beer',
                columns: ['Beer Name', 'Brewery', 'Style', 'ABV', 'Price'],
                titleColumns: ['Beer Name', 'Price']
            },
            wine: {
                name: 'Wine',
                columns: ['Wine Name', 'Producer', 'Vintage', 'Region', 'Price'],
                titleColumns: ['Wine Name', 'Producer', 'Vintage', 'Price']
            },
            cocktails: {
                name: 'Cocktails',
                columns: ['Cocktail Name', 'Description', 'Base Spirit', 'Price'],
                titleColumns: ['Cocktail Name', 'Price']
            },
            coffee: {
                name: 'Coffee/Tea',
                columns: ['Item Name', 'Type', 'Size Options', 'Price'],
                titleColumns: ['Item Name', 'Price']
            },
            desserts: {
                name: 'Desserts',
                columns: ['Dessert Name', 'Description', 'Allergens', 'Price'],
                titleColumns: ['Dessert Name', 'Price']
            }
        };
        
        // Color palette definitions
        this.colorPalettes = {
            classic: {
                name: 'Classic',
                description: 'Timeless elegance',
                primaryText: '#2c3e50',      // Dark blue-gray for main text
                secondaryText: '#7f8c8d',    // Medium gray for descriptions
                headers: '#34495e',          // Darker blue-gray for headers
                accent: '#27ae60',           // Green for prices/accents
                background: '#ecf0f1',       // Very light gray for backgrounds
                muted: '#bdc3c7'            // Light gray for muted elements
            },
            ocean: {
                name: 'Ocean',
                description: 'Fresh blues & teals',
                primaryText: '#1e3a5f',      // Deep navy for main text
                secondaryText: '#5a6c7d',    // Blue-gray for descriptions  
                headers: '#2c5282',          // Rich blue for headers
                accent: '#3182ce',           // Bright blue for prices/accents
                background: '#ebf8ff',       // Very light blue for backgrounds
                muted: '#a0aec0'            // Blue-gray for muted elements
            },
            forest: {
                name: 'Forest',
                description: 'Natural greens & earth tones',
                primaryText: '#1a202c',      // Very dark gray for main text
                secondaryText: '#4a5568',    // Medium gray for descriptions
                headers: '#2d3748',          // Dark gray for headers
                accent: '#38a169',           // Forest green for prices/accents
                background: '#f0fff4',       // Very light green for backgrounds
                muted: '#9ca3af'            // Gray for muted elements
            },
            sunset: {
                name: 'Sunset',
                description: 'Warm oranges & reds',
                primaryText: '#742a2a',      // Dark red-brown for main text
                secondaryText: '#a0616a',    // Muted red for descriptions
                headers: '#9c2a2a',          // Rich red for headers
                accent: '#e53e3e',           // Bright red for prices/accents
                background: '#fffaf0',       // Warm off-white for backgrounds
                muted: '#cbd5e0'            // Cool gray for muted elements
            },
            monochrome: {
                name: 'Monochrome',
                description: 'Sophisticated grays',
                primaryText: '#1a1a1a',      // Almost black for main text
                secondaryText: '#4a4a4a',    // Dark gray for descriptions
                headers: '#2d2d2d',          // Very dark gray for headers
                accent: '#000000',           // Pure black for prices/accents
                background: '#f7f7f7',       // Light gray for backgrounds
                muted: '#9a9a9a'            // Medium gray for muted elements
            },
            wine: {
                name: 'Wine',
                description: 'Deep purples & burgundy',
                primaryText: '#4c1d95',      // Deep purple for main text
                secondaryText: '#6b46c1',    // Medium purple for descriptions
                headers: '#581c87',          // Rich purple for headers
                accent: '#7c3aed',           // Bright purple for prices/accents
                background: '#faf5ff',       // Very light purple for backgrounds
                muted: '#a78bfa'            // Light purple for muted elements
            },
            cream: {
                name: 'Cream',
                description: 'Warm ivory & gold tones',
                primaryText: '#f8f6f0',      // Warm off-white for main text
                secondaryText: '#e8e2d4',    // Cream for descriptions
                headers: '#d4c5a9',          // Light gold for headers
                accent: '#c9a96e',           // Gold for prices/accents
                background: '#2d2a24',       // Dark brown for backgrounds
                muted: '#b8ab94'            // Muted gold for muted elements
            },
            pearl: {
                name: 'Pearl',
                description: 'Clean silver & whites',
                primaryText: '#f7f7f7',      // Almost white for main text
                secondaryText: '#e0e0e0',    // Light gray for descriptions
                headers: '#c4c4c4',          // Silver for headers
                accent: '#a8a8a8',           // Gray for prices/accents
                background: '#1a1a1a',       // Dark gray for backgrounds
                muted: '#d3d3d3'            // Light silver for muted elements
            },
            mint: {
                name: 'Mint',
                description: 'Fresh light greens',
                primaryText: '#f0fdf4',      // Very light green for main text
                secondaryText: '#bbf7d0',    // Light mint for descriptions
                headers: '#86efac',          // Medium mint for headers
                accent: '#4ade80',           // Bright mint for prices/accents
                background: '#1a2e05',       // Dark forest green for backgrounds
                muted: '#a7f3d0'            // Light mint for muted elements
            },
            blush: {
                name: 'Blush',
                description: 'Soft pink & coral tones',
                primaryText: '#fef7f7',      // Very light pink for main text
                secondaryText: '#fecaca',    // Light pink for descriptions
                headers: '#f87171',          // Coral for headers
                accent: '#dc2626',           // Red for prices/accents
                background: '#2d1b1b',       // Dark red-brown for backgrounds
                muted: '#fbb6b6'            // Light coral for muted elements
            }
        };
        
        // Navigation theme definitions
        this.navigationThemes = {
            modern: {
                name: 'Modern',
                description: 'Clean and contemporary'
            },
            glass: {
                name: 'Liquid Glass',
                description: 'Translucent glass effect'
            },
            minimal: {
                name: 'Minimal',
                description: 'Simple and understated'
            }
        };
        
        // Initialize authentication and user data
        this.initializeAuth();
        
        // Initialize user and load menu from server
        this.initializeUser();
        
        // Initialize dark mode
        this.initializeDarkMode();
        
        this.initializeEvents();
        this.renderMenu();
        
        // Force side preview update after a short delay
        setTimeout(() => {
            this.updateSidePreview();
        }, 500);
        
        // Initialize layout state
        this.initializeLayout();
    }
    
    // === AUTHENTICATION INTEGRATION ===
    
    initializeAuth() {
        // Check authentication state
        document.addEventListener('authStateChanged', (event) => {
            this.handleAuthChange(event.detail.user);
        });
        
        // Check if user is already authenticated
        if (window.authManager) {
            const user = window.authManager.getCurrentUser();
            this.handleAuthChange(user);
        } else {
            // Redirect to landing if no auth manager
            window.location.href = 'landing.html';
        }
    }
    
    handleAuthChange(user) {
        if (user) {
            this.currentUser = user;
            this.updateUserInterface(user);
            this.loadUserData();
        } else {
            // No user signed in, redirect to landing
            window.location.href = 'landing.html';
        }
    }
    
    updateUserInterface(user) {
        // Update user info in sidebar
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        
        if (userName) userName.textContent = user.name;
        if (userEmail) userEmail.textContent = user.email;
        
        // Update avatar if Google user with photo
        if (user.avatar) {
            const userAvatar = document.querySelector('.user-avatar');
            if (userAvatar) {
                userAvatar.innerHTML = `<img src="${user.avatar}" alt="User Avatar" style="width: 100%; height: 100%; border-radius: 50%;">`;
            }
        }
    }
    
    loadUserData() {
        if (!window.authManager) return;
        
        // Load user's menus
        const userMenus = window.authManager.getUserMenus();
        
        // If no current menu, create or load the first one
        if (!this.currentMenuId) {
            if (userMenus.length > 0) {
                this.loadMenu(userMenus[0]);
            } else {
                this.createNewMenu();
            }
        }
        
        // Update sidebar with user's menus
        this.loadUserMenus();
    }
    
    getUserMenus() {
        return window.authManager ? window.authManager.getUserMenus() : [];
    }
    
    saveUserMenu(menu) {
        if (window.authManager) {
            window.authManager.saveUserMenu(menu);
        }
    }
    
    loadMenu(menuData) {
        console.log('Loading menu:', menuData.name, 'Published data:', {
            publishedSlug: menuData.publishedSlug,
            publishedTitle: menuData.publishedTitle,
            status: menuData.status
        });
        
        this.currentMenuId = menuData.id;
        this.sections = menuData.sections || [];
        this.sectionCounter = menuData.sectionCounter || 0;
        this.publishedMenuId = menuData.publishedMenuId || null;
        this.publishedSlug = menuData.publishedSlug || null;
        this.publishedTitle = menuData.publishedTitle || null;
        this.publishedSubtitle = menuData.publishedSubtitle || null;
        this.menuLogo = menuData.menuLogo || null;
        this.logoSize = menuData.logoSize || 'medium';
        this.backgroundType = menuData.backgroundType || 'none';
        this.backgroundValue = menuData.backgroundValue || null;
        this.fontFamily = menuData.fontFamily || 'Inter';
        this.colorPalette = menuData.colorPalette || 'classic';
        this.navigationTheme = menuData.navigationTheme || 'modern';
        
        // Update UI
        document.getElementById('current-menu-name').textContent = menuData.name;
        this.renderMenu();
        this.updateCurrentMenuDisplay();
        this.updatePublishButtonVisibility();
        
        // Apply styling
        setTimeout(() => {
            this.applyBackground();
            this.applyFontFamily();
            this.applyColorPalette();
            this.applyNavigationTheme();
        }, 100);
    }
    
    createNewMenu() {
        const menuName = `${this.currentUser.restaurant || this.currentUser.name}'s Menu`;
        
        const newMenu = {
            id: 'menu_' + Date.now(),
            name: menuName,
            description: 'Restaurant menu',
            sections: [],
            sectionCounter: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'draft',
            fontFamily: 'Inter',
            colorPalette: 'classic',
            navigationTheme: 'modern',
            backgroundType: 'none',
            backgroundValue: null,
            menuLogo: null,
            logoSize: 'medium'
        };
        
        this.loadMenu(newMenu);
        this.saveToStorage();
    }
    
    async handleSignOut() {
        if (window.authManager) {
            await window.authManager.signOut();
        }
    }
    
    saveToStorage() {
        if (!this.currentUser || !this.currentMenuId) return;
        
        const menu = {
            id: this.currentMenuId,
            name: document.getElementById('current-menu-name').textContent,
            sections: this.sections,
            sectionCounter: this.sectionCounter,
            updatedAt: new Date().toISOString(),
            publishedMenuId: this.publishedMenuId,
            publishedSlug: this.publishedSlug,
            publishedTitle: this.publishedTitle,
            publishedSubtitle: this.publishedSubtitle,
            menuLogo: this.menuLogo,
            logoSize: this.logoSize,
            backgroundType: this.backgroundType,
            backgroundValue: this.backgroundValue,
            fontFamily: this.fontFamily,
            colorPalette: this.colorPalette,
            navigationTheme: this.navigationTheme,
            status: this.publishedSlug ? 'published' : 'draft'
        };
        
        this.saveUserMenu(menu);
        
        // Clear unsaved changes flag
        this.hasUnsavedChanges = false;
        
        // Update displays
        this.updateCurrentMenuDisplay();
        this.updatePublishButtonVisibility();
        this.loadUserMenus();
        
        // Show saved indicator
        setTimeout(() => {
            this.updateChangeIndicator('saved');
        }, 500);
    }
    
    loadUserMenus() {
        const menusList = document.getElementById('menus-list');
        const menus = this.getUserMenus();
        
        let html = '';
        
        // Add existing menus
        menus.forEach(menu => {
            const isActive = menu.id === this.currentMenuId;
            const updatedDate = new Date(menu.updatedAt).toLocaleDateString();
            
            html += `
                <div class="menu-item ${isActive ? 'active' : ''}" data-menu-id="${menu.id}">
                    <i class="fas fa-utensils"></i>
                    <div class="menu-info">
                        <div class="menu-name">${menu.name}</div>
                        <div class="menu-meta">
                            <span>${updatedDate}</span>
                            <span>${menu.status}</span>
                            <span>${(menu.sections || []).length} sections</span>
                        </div>
                    </div>
                    <div class="menu-actions">
                        <button class="menu-action" onclick="menuEditor.duplicateMenu('${menu.id}')" title="Duplicate">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="menu-action" onclick="menuEditor.renameMenu('${menu.id}')" title="Rename">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${!isActive ? `<button class="menu-action" onclick="menuEditor.deleteMenu('${menu.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>` : ''}
                    </div>
                </div>
            `;
        });
        
        // Add "New Menu" option if under limit
        if (menus.length < this.currentUser.maxMenus) {
            html += `
                <div class="new-menu-item" onclick="menuEditor.createNewMenu()">
                    <i class="fas fa-plus"></i>
                    <span>Create New Menu</span>
                </div>
            `;
        }
        
        menusList.innerHTML = html;
        
        // Add click handlers for menu items
        const menuItems = menusList.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const menuId = item.dataset.menuId;
                if (menuId !== this.currentMenuId) {
                    const menu = menus.find(m => m.id === menuId);
                    if (menu) {
                        this.loadMenu(menu);
                    }
                }
            });
        });
    }
    
    initializeLayout() {
        // Start in full-width mode since live preview is hidden by default
        const mainContent = document.querySelector('.main-content');
        const pageContainer = document.querySelector('.container');
        
        mainContent.classList.add('no-preview');
        pageContainer.classList.add('full-width');
    }
    
    initializeEvents() {
        document.getElementById('add-section').addEventListener('click', () => this.openSectionModal());
        document.getElementById('save-section').addEventListener('click', () => this.saveSection());
        document.getElementById('cancel-section').addEventListener('click', () => this.closeSectionModal());
        document.getElementById('save-menu').addEventListener('click', () => this.saveToStorage());
        document.getElementById('export-menu').addEventListener('click', () => this.exportMenu());
        document.getElementById('import-menu').addEventListener('click', () => this.triggerImport());
        document.getElementById('import-file').addEventListener('change', (e) => this.importMenu(e));
        document.getElementById('add-custom-column').addEventListener('click', () => this.addCustomColumn());
        document.getElementById('section-type').addEventListener('change', (e) => this.handleSectionTypeChange(e));
        document.getElementById('toggle-live-preview').addEventListener('click', () => this.toggleSidePreview());
        document.getElementById('close-side-preview').addEventListener('click', () => this.hideSidePreview());
        document.getElementById('refresh-side-preview').addEventListener('click', () => this.refreshSidePreview());
        document.getElementById('publish-menu').addEventListener('click', () => this.openPublishModal());
        document.getElementById('check-availability').addEventListener('click', () => this.checkPathAvailability());
        document.getElementById('publish-menu-confirm').addEventListener('click', () => this.publishMenu());
        document.getElementById('cancel-publish').addEventListener('click', () => this.closePublishModal());
        document.getElementById('menu-url-path').addEventListener('input', (e) => this.updatePreviewUrl(e));
        document.getElementById('menu-title-publish').addEventListener('input', () => this.updatePublishPreview());
        document.getElementById('menu-subtitle-publish').addEventListener('input', () => this.updatePublishPreview());
        
        // Sidebar event listeners
        document.getElementById('toggle-sidebar').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('close-sidebar').addEventListener('click', () => this.closeSidebar());
        document.getElementById('sidebar-overlay').addEventListener('click', () => this.closeSidebar());
        document.getElementById('menus-section-header').addEventListener('click', () => this.toggleSection('menus'));
        document.getElementById('settings-section-header').addEventListener('click', () => this.toggleSection('settings'));
        document.getElementById('view-published-menu').addEventListener('click', () => this.viewPublishedMenu());
        
        // Sign out functionality
        document.getElementById('sign-out-item').addEventListener('click', () => this.handleSignOut());
        
        // Discard functionality
        document.getElementById('discard-changes').addEventListener('click', () => this.openDiscardModal());
        document.getElementById('revert-to-saved').addEventListener('click', () => this.revertToSaved());
        document.getElementById('revert-to-published').addEventListener('click', () => this.revertToPublished());
        document.getElementById('cancel-discard').addEventListener('click', () => this.closeDiscardModal());
        
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                
                // Handle specific modals with their proper close methods
                if (modal.id === 'section-modal') {
                    this.closeSectionModal();
                } else if (modal.id === 'preview-modal') {
                    modal.style.display = 'none';
                    this.cleanupScrollAnimations();
                } else {
                    // Generic modal close
                    modal.style.display = 'none';
                }
            });
        });
        
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
                if (e.target.id === 'preview-modal') {
                    this.cleanupScrollAnimations();
                }
            }
        });
    }
    
    openSectionModal(sectionId = null) {
        console.log('Opening section modal for section ID:', sectionId);
        console.log('Available sections:', this.sections.map(s => ({ id: s.id, name: s.name })));
        
        this.currentSectionId = sectionId;
        const modal = document.getElementById('section-modal');
        const nameInput = document.getElementById('section-name');
        const typeSelect = document.getElementById('section-type');
        const customColumns = document.getElementById('custom-columns');
        
        if (sectionId) {
            const section = this.sections.find(s => s.id === sectionId);
            console.log('Found section for editing:', section);
            
            if (section) {
                nameInput.value = section.name;
                typeSelect.value = section.type;
            } else {
                console.error('Section not found for ID:', sectionId);
                nameInput.value = '';
                typeSelect.value = 'food';
            }
            
            if (section.type === 'custom') {
                customColumns.style.display = 'block';
                this.populateCustomColumns(section.columns);
            } else {
                customColumns.style.display = 'none';
            }
            
            this.populateTitleColumns(section.columns, section.titleColumns || []);
        } else {
            nameInput.value = '';
            typeSelect.value = 'food';
            customColumns.style.display = 'none';
            this.updateTitleColumnsForType('food');
        }
        
        modal.style.display = 'block';
    }
    
    closeSectionModal() {
        document.getElementById('section-modal').style.display = 'none';
        this.clearCustomColumns();
        this.currentSectionId = null; // Reset section ID to prevent editing wrong section
    }
    
    handleSectionTypeChange(e) {
        const customColumns = document.getElementById('custom-columns');
        const nameInput = document.getElementById('section-name');
        
        if (e.target.value === 'custom') {
            customColumns.style.display = 'block';
            if (!this.currentSectionId) {
                this.clearCustomColumns();
                this.addCustomColumn();
                this.populateTitleColumns([], []);
            }
        } else {
            customColumns.style.display = 'none';
            if (!this.currentSectionId && this.sectionTemplates[e.target.value]) {
                nameInput.value = this.sectionTemplates[e.target.value].name;
            }
            this.updateTitleColumnsForType(e.target.value);
        }
    }
    
    addCustomColumn() {
        const columnBuilder = document.getElementById('column-builder');
        const columnItem = document.createElement('div');
        columnItem.className = 'column-builder-item';
        
        columnItem.innerHTML = `
            <i class="fas fa-grip-vertical drag-handle"></i>
            <input type="text" placeholder="Column name" class="column-name-input">
            <button type="button" class="btn btn-danger btn-small" onclick="this.parentElement.remove(); menuEditor.updateCustomTitleColumns();">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        // Add event listener for column name changes
        const input = columnItem.querySelector('.column-name-input');
        input.addEventListener('input', () => this.updateCustomTitleColumns());
        
        columnBuilder.appendChild(columnItem);
        
        new Sortable(columnBuilder, {
            handle: '.drag-handle',
            animation: 150,
            ghostClass: 'sortable-ghost'
        });
    }
    
    populateCustomColumns(columns) {
        this.clearCustomColumns();
        columns.forEach(column => {
            this.addCustomColumn();
            const inputs = document.querySelectorAll('.column-name-input');
            inputs[inputs.length - 1].value = column;
        });
    }
    
    clearCustomColumns() {
        document.getElementById('column-builder').innerHTML = '';
    }
    
    updateTitleColumnsForType(type) {
        if (this.sectionTemplates[type]) {
            const columns = this.sectionTemplates[type].columns;
            const titleColumns = this.sectionTemplates[type].titleColumns;
            this.populateTitleColumns(columns, titleColumns);
        }
    }
    
    populateTitleColumns(columns, selectedTitleColumns = []) {
        const titleColumnsList = document.getElementById('title-columns-list');
        titleColumnsList.innerHTML = '';
        
        // Auto-include Price column if it exists and not already selected
        const priceColumn = columns.find(col => col.toLowerCase().includes('price'));
        if (priceColumn && !selectedTitleColumns.includes(priceColumn)) {
            selectedTitleColumns = [...selectedTitleColumns, priceColumn];
        }
        
        // First, add selected columns in their current order
        selectedTitleColumns.forEach(column => {
            if (columns.includes(column)) {
                this.addTitleColumnItem(titleColumnsList, column, true);
            }
        });
        
        // Then add unselected columns
        columns.forEach(column => {
            if (!selectedTitleColumns.includes(column)) {
                this.addTitleColumnItem(titleColumnsList, column, false);
            }
        });
        
        // Make the list sortable
        new Sortable(titleColumnsList, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            handle: '.title-drag-handle',
            onEnd: () => {
                // Update the order after drag and drop
                this.updateTitleColumnOrder();
            }
        });
    }
    
    addTitleColumnItem(container, column, isChecked) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'title-column-item';
        itemDiv.dataset.column = column;
        
        itemDiv.innerHTML = `
            <i class="fas fa-grip-vertical title-drag-handle"></i>
            <input type="checkbox" id="title-${column}" ${isChecked ? 'checked' : ''} value="${column}">
            <label for="title-${column}">${column}</label>
        `;
        
        container.appendChild(itemDiv);
    }
    
    updateTitleColumnOrder() {
        // This method is called after drag and drop to maintain order
        // The order is already correct in the DOM, getTitleColumns will read it correctly
    }
    
    getTitleColumns() {
        const checkboxes = document.querySelectorAll('#title-columns-list input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }
    
    updateCustomTitleColumns() {
        setTimeout(() => {
            const columnInputs = document.querySelectorAll('.column-name-input');
            const columns = Array.from(columnInputs).map(input => input.value.trim()).filter(col => col);
            const currentTitleColumns = this.getTitleColumns();
            this.populateTitleColumns(columns, currentTitleColumns);
        }, 0);
    }
    
    saveSection() {
        const nameInput = document.getElementById('section-name');
        const typeSelect = document.getElementById('section-type');
        const name = nameInput.value.trim();
        const type = typeSelect.value;
        
        if (!name) {
            alert('Please enter a section name');
            return;
        }
        
        let columns;
        if (type === 'custom') {
            const columnInputs = document.querySelectorAll('.column-name-input');
            columns = Array.from(columnInputs).map(input => input.value.trim()).filter(col => col);
            
            if (columns.length === 0) {
                alert('Please add at least one column');
                return;
            }
        } else {
            columns = this.sectionTemplates[type].columns;
        }
        
        const titleColumns = this.getTitleColumns();
        
        if (this.currentSectionId) {
            const sectionIndex = this.sections.findIndex(s => s.id === this.currentSectionId);
            this.sections[sectionIndex] = {
                ...this.sections[sectionIndex],
                name,
                type,
                columns,
                titleColumns
            };
        } else {
            const newSection = {
                id: ++this.sectionCounter,
                name,
                type,
                columns,
                titleColumns,
                items: []
            };
            this.sections.push(newSection);
        }
        
        this.closeSectionModal();
        this.renderMenu();
        this.updateSidePreview();
        this.markAsChanged();
    }
    
    deleteSection(sectionId) {
        if (confirm('Are you sure you want to delete this section?')) {
            this.sections = this.sections.filter(s => s.id !== sectionId);
            this.renderMenu();
            this.updateSidePreview();
            this.markAsChanged();
        }
    }
    
    addMenuItem(sectionId) {
        const section = this.sections.find(s => s.id === sectionId);
        const newItem = {};
        section.columns.forEach(column => {
            newItem[column] = '';
        });
        
        section.items.push(newItem);
        this.renderMenu();
        this.updateSidePreview();
    }
    
    deleteMenuItem(sectionId, itemIndex) {
        const section = this.sections.find(s => s.id === sectionId);
        section.items.splice(itemIndex, 1);
        this.renderMenu();
        this.updateSidePreview();
        this.markAsChanged();
    }
    
    updateMenuItem(sectionId, itemIndex, column, value) {
        const section = this.sections.find(s => s.id === sectionId);
        section.items[itemIndex][column] = value;
        this.updateSidePreview();
        this.markAsChanged();
    }
    
    addColumn(sectionId) {
        const section = this.sections.find(s => s.id === sectionId);
        const newColumnName = prompt('Enter column name:', 'New Column');
        
        if (newColumnName && newColumnName.trim()) {
            const columnName = newColumnName.trim();
            
            // Check if column already exists
            if (section.columns.includes(columnName)) {
                alert('A column with this name already exists.');
                return;
            }
            
            // Add column to section
            section.columns.push(columnName);
            
            // Add empty values for existing items
            section.items.forEach(item => {
                item[columnName] = '';
            });
            
            this.renderMenu();
            this.updateSidePreview();
            this.markAsChanged();
        }
    }
    
    openAddColumnModal(sectionId) {
        this.currentAddColumnSectionId = sectionId;
        const modal = document.getElementById('add-column-modal');
        modal.style.display = 'block';
        
        // Reset form
        document.getElementById('custom-column-name').value = '';
        document.querySelectorAll('.preset-column-option').forEach(option => {
            option.classList.remove('selected');
        });
    }
    
    closeAddColumnModal() {
        const modal = document.getElementById('add-column-modal');
        modal.style.display = 'none';
        this.currentAddColumnSectionId = null;
    }
    
    addPresetColumn(columnName) {
        if (!this.currentAddColumnSectionId) return;
        
        const section = this.sections.find(s => s.id === this.currentAddColumnSectionId);
        if (!section) return;
        
        // Check if column already exists
        if (section.columns.includes(columnName)) {
            alert('A column with this name already exists.');
            return;
        }
        
        // Add column to section
        section.columns.push(columnName);
        
        // Add empty values for existing items
        section.items.forEach(item => {
            item[columnName] = '';
        });
        
        this.renderMenu();
        this.updateSidePreview();
        this.markAsChanged();
        this.closeAddColumnModal();
    }
    
    addCustomColumn() {
        const customColumnName = document.getElementById('custom-column-name').value.trim();
        
        if (!customColumnName) {
            alert('Please enter a column name.');
            return;
        }
        
        this.addPresetColumn(customColumnName);
    }
    
    deleteColumn(sectionId, columnName) {
        const section = this.sections.find(s => s.id === sectionId);
        
        if (section.columns.length <= 1) {
            alert('Cannot delete the last column. Sections must have at least one column.');
            return;
        }
        
        if (confirm(`Are you sure you want to delete the "${columnName}" column? This will remove all data in this column.`)) {
            // Remove column from columns array
            section.columns = section.columns.filter(col => col !== columnName);
            
            // Remove column data from all items
            section.items.forEach(item => {
                delete item[columnName];
            });
            
            this.renderMenu();
            this.updateSidePreview();
            this.markAsChanged();
        }
    }
    
    editColumnName(sectionId, oldColumnName) {
        const section = this.sections.find(s => s.id === sectionId);
        const newColumnName = prompt('Enter new column name:', oldColumnName);
        
        if (newColumnName && newColumnName.trim() && newColumnName.trim() !== oldColumnName) {
            const columnName = newColumnName.trim();
            
            // Check if column already exists
            if (section.columns.includes(columnName)) {
                alert('A column with this name already exists.');
                return;
            }
            
            // Update column name in columns array
            const columnIndex = section.columns.indexOf(oldColumnName);
            section.columns[columnIndex] = columnName;
            
            // Update column data in all items
            section.items.forEach(item => {
                if (item.hasOwnProperty(oldColumnName)) {
                    item[columnName] = item[oldColumnName];
                    delete item[oldColumnName];
                }
            });
            
            this.renderMenu();
            this.updateSidePreview();
            this.markAsChanged();
        }
    }
    
    renderMenu() {
        const container = document.getElementById('menu-container');
        
        if (this.sections.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-utensils"></i>
                    <h3>No sections yet</h3>
                    <p>Add your first menu section to get started</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.sections.map(section => this.renderSection(section)).join('');
        this.initializeSortable();
    }
    
    renderSection(section) {
        console.log('Rendering section:', section.name, 'with ID:', section.id);
        const gridClass = `grid-${Math.min(section.columns.length, 5)}`;
        
        return `
            <div class="menu-section" data-section-id="${section.id}">
                <div class="section-header">
                    <div>
                        <span class="section-title">${section.name}</span>
                        <span class="section-type-badge">${section.type}</span>
                    </div>
                    <div class="section-controls">
                        <button onclick="menuEditor.openSectionModal(${section.id})" title="Edit Section">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="menuEditor.deleteSection(${section.id})" title="Delete Section">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="section-content">
                    <div class="column-headers ${gridClass}" data-section-id="${section.id}">
                        ${section.columns.map(column => `
                            <div class="column-header" data-column="${column}">
                                <span class="column-name" onclick="menuEditor.editColumnName(${section.id}, '${column}')">${column}</span>
                                <div class="column-controls">
                                    <i class="fas fa-edit column-edit" onclick="menuEditor.editColumnName(${section.id}, '${column}')" title="Rename Column"></i>
                                    ${section.columns.length > 1 ? `<i class="fas fa-trash column-delete" onclick="menuEditor.deleteColumn(${section.id}, '${column}')" title="Delete Column"></i>` : ''}
                                    <i class="fas fa-grip-vertical drag-handle" title="Drag to Reorder"></i>
                                </div>
                            </div>
                        `).join('')}
                        <div class="add-column-header">
                            <button class="add-column-btn" onclick="menuEditor.openAddColumnModal(${section.id})" title="Add Column">
                                <i class="fas fa-plus"></i> Add Column
                            </button>
                        </div>
                    </div>
                    <div class="menu-items">
                        ${section.items.map((item, index) => this.renderMenuItem(section, item, index)).join('')}
                    </div>
                    <button class="add-item-btn" onclick="menuEditor.addMenuItem(${section.id})">
                        <i class="fas fa-plus"></i> Add Menu Item
                    </button>
                </div>
            </div>
        `;
    }
    
    renderMenuItem(section, item, index) {
        const gridClass = `grid-${Math.min(section.columns.length, 5)}`;
        
        return `
            <div class="menu-item ${gridClass}">
                ${section.columns.map(column => `
                    <input 
                        type="text" 
                        placeholder="${column}"
                        value="${item[column] || ''}"
                        onchange="menuEditor.updateMenuItem(${section.id}, ${index}, '${column}', this.value)"
                    >
                `).join('')}
                <div class="item-controls">
                    <button class="btn btn-secondary btn-small" onclick="menuEditor.duplicateMenuItem(${section.id}, ${index})" title="Duplicate Item">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn btn-danger btn-small" onclick="menuEditor.deleteMenuItem(${section.id}, ${index})" title="Delete Item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    initializeSortable() {
        this.sortableInstances.forEach(instance => instance.destroy());
        this.sortableInstances = [];
        
        const menuContainer = document.getElementById('menu-container');
        if (menuContainer.children.length > 0) {
            const sectionsortable = new Sortable(menuContainer, {
                animation: 150,
                ghostClass: 'sortable-ghost',
                chosenClass: 'sortable-chosen',
                onStart: (evt) => {
                    evt.item.classList.add('dragging');
                },
                onEnd: (evt) => {
                    evt.item.classList.remove('dragging');
                    const oldIndex = evt.oldIndex;
                    const newIndex = evt.newIndex;
                    
                    if (oldIndex !== newIndex) {
                        const movedSection = this.sections.splice(oldIndex, 1)[0];
                        this.sections.splice(newIndex, 0, movedSection);
                        this.saveToStorage();
                    }
                }
            });
            this.sortableInstances.push(sectionsortable);
        }
        
        document.querySelectorAll('.column-headers').forEach(columnHeader => {
            const sectionId = parseInt(columnHeader.dataset.sectionId);
            const columnSortable = new Sortable(columnHeader, {
                animation: 150,
                ghostClass: 'sortable-ghost',
                handle: '.drag-handle',
                onEnd: (evt) => {
                    const section = this.sections.find(s => s.id === sectionId);
                    const oldIndex = evt.oldIndex;
                    const newIndex = evt.newIndex;
                    
                    if (oldIndex !== newIndex) {
                        const movedColumn = section.columns.splice(oldIndex, 1)[0];
                        section.columns.splice(newIndex, 0, movedColumn);
                        
                        // Update titleColumns array to maintain correct order
                        if (section.titleColumns && section.titleColumns.length > 0) {
                            // Create a map of old column names to new positions
                            const columnPositionMap = {};
                            section.columns.forEach((col, index) => {
                                columnPositionMap[col] = index;
                            });
                            
                            // Sort titleColumns based on their new positions in the columns array
                            section.titleColumns.sort((a, b) => {
                                const posA = columnPositionMap[a];
                                const posB = columnPositionMap[b];
                                return posA - posB;
                            });
                        }
                        
                        section.items.forEach(item => {
                            const keys = Object.keys(item);
                            const movedKey = keys.splice(oldIndex, 1)[0];
                            keys.splice(newIndex, 0, movedKey);
                            
                            const newItem = {};
                            keys.forEach(key => {
                                newItem[key] = item[key];
                            });
                            Object.assign(item, newItem);
                        });
                        
                        this.renderMenu();
                        this.saveToStorage();
                        this.markAsChanged();
                    }
                }
            });
            this.sortableInstances.push(columnSortable);
        });
        
        // Make menu items sortable within each section
        document.querySelectorAll('.menu-items').forEach(menuItems => {
            const sectionElement = menuItems.closest('.menu-section');
            const sectionId = parseInt(sectionElement.dataset.sectionId);
            
            const itemSortable = new Sortable(menuItems, {
                animation: 150,
                ghostClass: 'sortable-ghost',
                chosenClass: 'sortable-chosen',
                onStart: (evt) => {
                    evt.item.classList.add('dragging');
                },
                onEnd: (evt) => {
                    evt.item.classList.remove('dragging');
                    const section = this.sections.find(s => s.id === sectionId);
                    const oldIndex = evt.oldIndex;
                    const newIndex = evt.newIndex;
                    
                    if (oldIndex !== newIndex && section) {
                        const movedItem = section.items.splice(oldIndex, 1)[0];
                        section.items.splice(newIndex, 0, movedItem);
                        this.saveToStorage();
                        this.markAsChanged();
                    }
                }
            });
            this.sortableInstances.push(itemSortable);
        });
    }
    
    showPreview() {
        const modal = document.getElementById('preview-modal');
        const content = document.getElementById('preview-content');
        
        // Create menu header
        const menuHeader = `
            <div class="preview-menu-header">
                ${this.menuLogo ? `<img src="${this.menuLogo}" alt="Menu Logo" class="menu-logo ${this.logoSize}">` : ''}
                <div class="preview-menu-title">Our Menu</div>
                <div class="preview-menu-subtitle">Crafted with care and passion</div>
            </div>
        `;
        
        // Create sections in a grid container
        const sectionsHTML = `
            <div class="preview-menu-container">
                ${this.sections.map(section => {
                    const titleColumns = section.titleColumns || [section.columns[0]];
                    const descriptionColumn = section.columns.find(col => 
                        col.toLowerCase().includes('description')
                    );
                    
                    // Filter out title and description columns from headers
                    const visibleColumns = section.columns.filter(col => 
                        !titleColumns.includes(col) && col !== descriptionColumn
                    );
                    
                    return `
                        <div class="preview-section">
                            <h2>${section.name}</h2>
                            <div class="preview-items">
                                ${section.items.map(item => this.generatePreviewItem(item, section)).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        content.innerHTML = menuHeader + sectionsHTML;
        modal.style.display = 'block';
        
        // Generate navigation
        this.generatePreviewNavigation();
        
        // Debug: Check if modal navigation elements exist
        console.log('Modal nav elements:', {
            modalNavContainer: !!document.getElementById('modal-nav-dock-container'),
            modalNavTab: !!document.getElementById('modal-nav-tab')
        });
        
        // Initialize scroll-triggered animations
        this.initializeScrollAnimations();
        
        // Apply background, font, and colors after content is rendered
        setTimeout(() => {
            console.log('Applying background in preview modal:', this.backgroundType, this.backgroundValue);
            console.log('Modal elements check:', {
                modal: !!document.getElementById('preview-modal'),
                previewContent: !!document.getElementById('preview-content'),
                smartphoneContent: !!document.querySelector('#preview-modal .smartphone-content')
            });
            this.applyBackground();
            this.applyFontFamily();
            this.applyColorPalette();
            this.applyNavigationTheme();
            
            // Force background size to contain for modal elements
            this.forceModalBackgroundSize();
        }, 100);
    }
    
    forceModalBackgroundSize() {
        const modalElements = document.querySelectorAll('#preview-modal .smartphone-content, #preview-modal #preview-content, #preview-modal .preview-menu-container');
        
        modalElements.forEach(element => {
            if (element.style.backgroundImage) {
                element.style.backgroundSize = 'contain';
                console.log('Forced background-size to contain for:', element.className || element.id);
            }
        });
        
        // Set up a mutation observer to watch for style changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const element = mutation.target;
                    if (element.closest('#preview-modal') && element.style.backgroundImage) {
                        if (element.style.backgroundSize !== 'contain') {
                            element.style.backgroundSize = 'contain';
                            console.log('Observer: Reset background-size to contain for:', element.className || element.id);
                        }
                    }
                }
            });
        });
        
        modalElements.forEach(element => {
            observer.observe(element, { attributes: true, attributeFilter: ['style'] });
        });
    }
    
    initializeScrollAnimations() {
        const container = document.querySelector('#side-preview-content').closest('.smartphone-content');
        const sections = document.querySelectorAll('#side-preview-content .preview-section');
        
        if (!container || sections.length === 0) return;
        
        // Track scroll direction
        let lastScrollTop = container.scrollTop;
        let scrollDirection = 'down';
        
        // Create intersection observer with more precise thresholds
        const observerOptions = {
            root: container,
            rootMargin: '0px 0px 0px 0px', // No margin for precise detection
            threshold: [0, 0.1, 0.25, 0.5, 0.75, 1]
        };
        
        // Track scroll direction
        container.addEventListener('scroll', () => {
            const currentScrollTop = container.scrollTop;
            scrollDirection = currentScrollTop > lastScrollTop ? 'down' : 'up';
            lastScrollTop = currentScrollTop;
        });
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const section = entry.target;
                const rect = section.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                
                // Calculate relative position
                const isAboveViewport = rect.bottom < containerRect.top;
                const isBelowViewport = rect.top > containerRect.bottom;
                const isInViewport = !isAboveViewport && !isBelowViewport;
                
                if (isInViewport && entry.isIntersecting) {
                    // Section is visible in viewport
                    section.classList.remove('section-hidden', 'section-exiting', 'section-exiting-down');
                    section.classList.add('section-visible');
                } else if (isAboveViewport) {
                    // Section has scrolled up and out of view
                    if (section.classList.contains('section-visible')) {
                        section.classList.remove('section-visible', 'section-hidden', 'section-exiting-down');
                        section.classList.add('section-exiting');
                        // Transition to hidden after exit animation
                        setTimeout(() => {
                            if (section.classList.contains('section-exiting')) {
                                section.classList.remove('section-exiting');
                                section.classList.add('section-hidden');
                            }
                        }, 600); // Match transition duration
                    } else {
                        section.classList.remove('section-visible', 'section-exiting', 'section-exiting-down');
                        section.classList.add('section-hidden');
                    }
                } else if (isBelowViewport) {
                    // Section is below viewport
                    if (section.classList.contains('section-visible')) {
                        section.classList.remove('section-visible', 'section-hidden', 'section-exiting');
                        section.classList.add('section-exiting-down');
                        // Transition to hidden after exit animation
                        setTimeout(() => {
                            if (section.classList.contains('section-exiting-down')) {
                                section.classList.remove('section-exiting-down');
                                section.classList.add('section-hidden');
                            }
                        }, 600); // Match transition duration
                    } else {
                        section.classList.remove('section-visible', 'section-exiting', 'section-exiting-down');
                        section.classList.add('section-hidden');
                    }
                }
            });
        }, observerOptions);
        
        // Initialize all sections as hidden initially
        sections.forEach(section => {
            section.classList.add('section-hidden');
            observer.observe(section);
        });
        
        // Store observer for cleanup
        this.scrollObserver = observer;
    }
    
    cleanupScrollAnimations() {
        if (this.scrollObserver) {
            this.scrollObserver.disconnect();
            this.scrollObserver = null;
        }
    }
    
    toggleSidePreview() {
        const panel = document.getElementById('side-preview-panel');
        const button = document.getElementById('toggle-live-preview');
        
        if (this.sidePreviewVisible) {
            this.hideSidePreview();
        } else {
            this.showSidePreview();
        }
    }
    
    showSidePreview() {
        const panel = document.getElementById('side-preview-panel');
        const container = document.getElementById('menu-container');
        const mainContent = document.querySelector('.main-content');
        const pageContainer = document.querySelector('.container');
        const button = document.getElementById('toggle-live-preview');
        
        panel.classList.remove('hidden');
        container.classList.add('with-side-preview');
        mainContent.classList.remove('no-preview');
        pageContainer.classList.remove('full-width');
        this.sidePreviewVisible = true;
        
        // Update button state
        button.innerHTML = '<i class="fas fa-mobile-alt"></i> Hide Preview';
        button.classList.add('btn-primary');
        button.classList.remove('btn-secondary');
        
        // Generate side preview content
        setTimeout(() => {
            this.updateSidePreview();
        }, 100);
    }
    
    hideSidePreview() {
        const panel = document.getElementById('side-preview-panel');
        const container = document.getElementById('menu-container');
        const mainContent = document.querySelector('.main-content');
        const pageContainer = document.querySelector('.container');
        const button = document.getElementById('toggle-live-preview');
        
        panel.classList.add('hidden');
        container.classList.remove('with-side-preview');
        mainContent.classList.add('no-preview');
        pageContainer.classList.add('full-width');
        this.sidePreviewVisible = false;
        
        // Update button state
        button.innerHTML = '<i class="fas fa-mobile-alt"></i> Live Preview';
        button.classList.remove('btn-primary');
        button.classList.add('btn-secondary');
    }
    
    updateSidePreview() {
        const content = document.getElementById('side-preview-content');
        if (!content) {
            return;
        }
        
        // Use the exact same content generation as the full preview modal
        // Create menu header
        const menuHeader = `
            <div class="preview-menu-header">
                ${this.menuLogo ? `<img src="${this.menuLogo}" alt="Menu Logo" class="menu-logo ${this.logoSize}">` : ''}
                <div class="preview-menu-title">Our Menu</div>
                <div class="preview-menu-subtitle">Crafted with care and passion</div>
            </div>
        `;
        
        // Create sections in a grid container (exactly like showPreview method)
        const sectionsHTML = `
            <div class="preview-menu-container">
                ${this.sections.map(section => {
                    const titleColumns = section.titleColumns || [section.columns[0]];
                    const descriptionColumn = section.columns.find(col => 
                        col.toLowerCase().includes('description')
                    );
                    
                    // Filter out title and description columns from headers
                    const visibleColumns = section.columns.filter(col => 
                        !titleColumns.includes(col) && col !== descriptionColumn
                    );
                    
                    return `
                        <div class="preview-section">
                            <h2>${section.name}</h2>
                            <div class="preview-items">
                                ${section.items.map(item => this.generatePreviewItem(item, section)).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        content.innerHTML = menuHeader + sectionsHTML;
        this.generatePreviewNavigation();
        this.initializeScrollAnimations();
        
        // Apply background, font, and colors after content is rendered with slight delay
        setTimeout(() => {
            this.applyBackground();
            this.applyFontFamily();
            this.applyColorPalette();
        }, 100);
    }
    
    generatePreviewNavigation() {
        // Generate navigation for side preview
        const sideNavContainer = document.getElementById('nav-dock-container');
        const sideNavTab = document.getElementById('nav-tab');
        
        // Generate navigation for modal preview
        const modalNavContainer = document.getElementById('modal-nav-dock-container');
        const modalNavTab = document.getElementById('modal-nav-tab');
        
        if (this.sections.length === 0) {
            // Hide navigation if no sections
            if (sideNavTab) sideNavTab.style.display = 'none';
            if (modalNavTab) modalNavTab.style.display = 'none';
            return;
        }
        
        // Show navigation tabs
        if (sideNavTab) sideNavTab.style.display = 'flex';
        if (modalNavTab) modalNavTab.style.display = 'flex';
        
        // Generate navigation HTML
        const dockHTML = `
            <div class="nav-dock">
                ${this.sections.map((section, index) => `
                    <div class="nav-dock-item" data-section-index="${index}">
                        ${section.name}
                    </div>
                `).join('')}
            </div>
        `;
        
        // Update both navigation containers
        if (sideNavContainer) {
            sideNavContainer.innerHTML = dockHTML;
            this.attachNavigationListeners(sideNavContainer, sideNavTab, 'side');
        }
        
        if (modalNavContainer) {
            modalNavContainer.innerHTML = dockHTML;
            this.attachNavigationListeners(modalNavContainer, modalNavTab, 'modal');
        }
        
        // Apply navigation theme after generating
        this.applyNavigationTheme();
    }
    
    attachNavigationListeners(dockContainer, navTab, context) {
        // Attach click listener to nav tab
        if (navTab) {
            navTab.onclick = () => this.toggleNavigation(context);
        }
        
        // Attach click listeners to dock items
        const dockItems = dockContainer.querySelectorAll('.nav-dock-item');
        dockItems.forEach((item, index) => {
            item.onclick = () => this.scrollToSectionAndClose(index, context);
        });
    }
    
    refreshSidePreview() {
        const screen = document.getElementById('side-smartphone-screen');
        
        // Add refresh animation
        screen.classList.add('refreshing');
        
        // Update content after animation starts
        setTimeout(() => {
            this.updateSidePreview();
        }, 100);
        
        // Remove animation class after animation completes
        setTimeout(() => {
            screen.classList.remove('refreshing');
        }, 600);
    }
    
    
    generateCollapsibleDock(container) {
        // Generate dock items in the container
        const dockContainer = container.querySelector('#nav-dock-container');
        
        if (dockContainer) {
            const dockHTML = `
                <div class="nav-dock">
                    ${this.sections.map((section, index) => {
                        return `
                            <div class="nav-dock-item" 
                                 data-section-index="${index}" 
                                 title="${section.name}">
                                ${section.name}
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
            dockContainer.innerHTML = dockHTML;
            
            // Attach click events properly
            const dockItems = dockContainer.querySelectorAll('.nav-dock-item');
            dockItems.forEach((item, index) => {
                item.addEventListener('click', () => {
                    this.scrollToSectionAndClose(index);
                });
            });
        }
        
        // Add click event to nav tab
        const navTab = container.querySelector('#nav-tab');
        if (navTab) {
            navTab.onclick = () => {
                this.toggleNavigation();
            };
        }
    }
    
    getShortSectionName(name) {
        // Create short names for dock items
        const words = name.split(' ');
        if (words.length === 1) {
            return words[0].substring(0, 4).toUpperCase();
        } else if (words.length === 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        } else {
            return words.map(w => w[0]).join('').substring(0, 3).toUpperCase();
        }
    }
    
    toggleNavigation(context = 'side') {
        const containerId = context === 'modal' ? 'modal-nav-dock-container' : 'nav-dock-container';
        const dockContainer = document.getElementById(containerId);
        if (dockContainer) {
            this.navExpanded = !this.navExpanded;
            dockContainer.classList.toggle('expanded', this.navExpanded);
        }
    }
    
    scrollToSectionAndClose(sectionIndex, context = 'side') {
        // First close the navigation
        this.toggleNavigation(context);
        
        // Then scroll to section after a small delay
        setTimeout(() => {
            this.scrollToSection(sectionIndex, context);
        }, 200);
    }
    
    scrollToSection(sectionIndex, context = 'side') {
        const contentId = context === 'modal' ? 'preview-content' : 'side-preview-content';
        const previewContent = document.getElementById(contentId);
        const previewSections = document.querySelectorAll(`#${contentId} .preview-section`);
        
        // Find the actual scrollable container
        const scrollContainer = context === 'modal' ? 
            previewContent.closest('.smartphone-content') : 
            previewContent.closest('.smartphone-content');
        
        if (previewSections[sectionIndex] && scrollContainer) {
            // Update active state
            this.updateNavigationActiveState(sectionIndex, context);
            
            // Calculate position to scroll section to top with proper offset
            const sectionTop = previewSections[sectionIndex].offsetTop;
            
            console.log('Scrolling to section', sectionIndex, 'at position', sectionTop, 'in context', context);
            
            // Smooth scroll to bring section to top of visible area
            scrollContainer.scrollTo({
                top: sectionTop - 15, // Account for content padding
                behavior: 'smooth'
            });
        }
    }
    
    updateNavigationActiveState(activeIndex, context = 'side') {
        // Remove active class from context-specific nav items
        const containerId = context === 'modal' ? 'modal-nav-dock-container' : 'nav-dock-container';
        const container = document.getElementById(containerId);
        if (container) {
            const navItems = container.querySelectorAll('.nav-dock-item');
            navItems.forEach(item => item.classList.remove('active'));
            
            // Add active class to clicked item in this context
            const activeItem = container.querySelector(`[data-section-index="${activeIndex}"]`);
            if (activeItem) {
                activeItem.classList.add('active');
            }
        }
    }
    
    generatePreviewItem(item, section) {
        const titleColumns = section.titleColumns || [section.columns[0]];
        const descriptionColumn = section.columns.find(col => 
            col.toLowerCase().includes('description')
        );
        
        // Generate title from selected title columns in the user's specified order
        const titleParts = [];
        const priceInTitle = [];
        
        // Use titleColumns order directly to preserve user's arrangement
        titleColumns.forEach(col => {
            const value = item[col] || '';
            if (value.trim()) {
                if (col.toLowerCase().includes('price')) {
                    priceInTitle.push(value);
                } else {
                    titleParts.push(value);
                }
            }
        });
        
        // Combine non-price title parts
        const titleText = titleParts.join(' ');
        const titlePrice = priceInTitle.join(' ');
        
        const description = descriptionColumn ? (item[descriptionColumn] || '') : '';
        
        // Filter visible columns (exclude title and description columns)
        const visibleColumns = section.columns.filter(col => 
            !titleColumns.includes(col) && col !== descriptionColumn
        );
        
        // Generate data row for visible columns only
        const dataRow = visibleColumns.map(col => {
            const value = item[col] || '';
            const isPrice = col.toLowerCase().includes('price');
            
            return `<span class="preview-data-cell ${isPrice ? 'preview-price-cell' : ''}">${value}</span>`;
        }).join('');
        
        return `
            <div class="preview-item">
                ${(titleText || titlePrice) ? `
                    <div class="preview-item-title">
                        <span class="preview-title-text">${titleText}</span>
                        ${titlePrice ? `<span class="preview-title-price">${titlePrice}</span>` : ''}
                    </div>
                ` : ''}
                ${description ? `<div class="preview-item-description">${description}</div>` : ''}
                ${visibleColumns.length > 0 ? `
                    <div class="preview-item-data" style="grid-template-columns: ${visibleColumns.map(col => col.toLowerCase().includes('price') ? 'auto' : '1fr').join(' ')};">
                        ${dataRow}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    getColumnValue(item, columns, keyword) {
        const column = columns.find(col => col.toLowerCase().includes(keyword.toLowerCase()));
        return column ? item[column] : null;
    }
    
    saveToStorage() {
        // Manual save current menu
        this.saveCurrentMenu();
    }
    
    loadFromStorage() {
        // Legacy method - now handled by user system
        // Could migrate old data here if needed
    }
    
    exportMenu() {
        const data = {
            sections: this.sections,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `menu-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    triggerImport() {
        document.getElementById('import-file').click();
    }
    
    importMenu(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.sections && Array.isArray(data.sections)) {
                    if (confirm('This will replace your current menu. Continue?')) {
                        this.sections = data.sections;
                        this.sectionCounter = Math.max(...this.sections.map(s => s.id), 0);
                        this.renderMenu();
                        this.saveToStorage();
                        alert('Menu imported successfully!');
                    }
                } else {
                    alert('Invalid menu file format');
                }
            } catch (error) {
                alert('Error reading menu file');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }
    
    // Publish functionality
    openPublishModal() {
        if (this.sections.length === 0) {
            alert('Please add at least one menu section before publishing.');
            return;
        }
        
        const modal = document.getElementById('publish-modal');
        const pathInput = document.getElementById('menu-url-path');
        const titleInput = document.getElementById('menu-title-publish');
        const subtitleInput = document.getElementById('menu-subtitle-publish');
        const validation = document.getElementById('path-validation');
        const checkButton = document.getElementById('check-availability');
        const publishButton = document.getElementById('publish-menu-confirm');
        
        modal.style.display = 'block';
        
        if (this.publishedSlug) {
            // Previously published - reuse existing path and settings
            pathInput.value = this.publishedSlug;
            titleInput.value = this.publishedTitle || 'Our Menu';
            subtitleInput.value = this.publishedSubtitle || 'Crafted with care and passion';
            
            // Path is already validated, show success and enable publish
            validation.className = 'validation-message success';
            validation.textContent = '✓ Using existing menu path - ready to update';
            
            // Explicitly enable the publish button for existing menus
            publishButton.disabled = false;
            publishButton.removeAttribute('disabled');
            publishButton.innerHTML = '<i class="fas fa-sync"></i> Update Menu';
            publishButton.classList.remove('disabled');
            
            // Disable path editing and availability check for existing menus
            pathInput.disabled = true;
            checkButton.style.display = 'none';
            
            this.updatePreviewUrl({ target: { value: this.publishedSlug } });
        } else {
            // First-time publish - allow path selection
            const defaultPath = this.generateDefaultPath();
            pathInput.value = defaultPath;
            titleInput.value = 'Our Menu';
            subtitleInput.value = 'Crafted with care and passion';
            
            // Reset validation state
            validation.className = 'validation-message';
            validation.textContent = '';
            publishButton.disabled = true;
            publishButton.innerHTML = '<i class="fas fa-rocket"></i> Publish Menu';
            
            // Enable path editing and availability check
            pathInput.disabled = false;
            checkButton.style.display = 'inline-flex';
            
            this.updatePreviewUrl({ target: { value: defaultPath } });
        }
    }
    
    closePublishModal() {
        const modal = document.getElementById('publish-modal');
        const pathInput = document.getElementById('menu-url-path');
        const checkButton = document.getElementById('check-availability');
        const validation = document.getElementById('path-validation');
        const publishButton = document.getElementById('publish-menu-confirm');
        
        modal.style.display = 'none';
        
        // Reset form state (but keep published info in memory)
        validation.className = 'validation-message';
        validation.textContent = '';
        
        // Reset UI elements to default state (they'll be set correctly on next open)
        pathInput.disabled = false;
        checkButton.style.display = 'inline-flex';
        publishButton.disabled = false;
        publishButton.innerHTML = '<i class="fas fa-rocket"></i> Publish Menu';
    }
    
    generateDefaultPath() {
        // Create a default path from current timestamp and random string
        const timestamp = Date.now().toString().slice(-6);
        const randomStr = Math.random().toString(36).substring(2, 6);
        return `menu-${timestamp}-${randomStr}`;
    }
    
    updatePreviewUrl(e) {
        const path = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        e.target.value = path;
        
        const previewUrl = document.getElementById('preview-url-display');
        previewUrl.textContent = `${window.location.origin}/menu/${path || 'your-path-here'}`;
        
        // Only reset validation and disable button for new menus
        if (!this.publishedSlug) {
            // Reset validation when path changes
            const validation = document.getElementById('path-validation');
            validation.className = 'validation-message';
            validation.textContent = '';
            
            // Disable publish button until availability is checked
            document.getElementById('publish-menu-confirm').disabled = true;
        }
    }
    
    async checkPathAvailability() {
        const path = document.getElementById('menu-url-path').value;
        const validation = document.getElementById('path-validation');
        
        if (!path) {
            validation.className = 'validation-message error';
            validation.textContent = 'Please enter a URL path.';
            return;
        }
        
        if (!/^[a-z0-9-]+$/.test(path)) {
            validation.className = 'validation-message error';
            validation.textContent = 'Path can only contain lowercase letters, numbers, and dashes.';
            return;
        }
        
        if (path.length < 3) {
            validation.className = 'validation-message error';
            validation.textContent = 'Path must be at least 3 characters long.';
            return;
        }
        
        // Show checking status
        validation.className = 'validation-message checking';
        validation.textContent = 'Checking availability...';
        
        try {
            const response = await fetch(`/api/check-slug/${encodeURIComponent(path)}`);
            const data = await response.json();
            
            if (data.available) {
                validation.className = 'validation-message success';
                validation.textContent = '✓ This path is available!';
                document.getElementById('publish-menu-confirm').disabled = false;
            } else {
                validation.className = 'validation-message error';
                validation.textContent = data.error || '✗ This path is already taken. Please try another.';
                document.getElementById('publish-menu-confirm').disabled = true;
            }
        } catch (error) {
            validation.className = 'validation-message error';
            validation.textContent = 'Error checking availability. Please try again.';
            console.error('Error checking path availability:', error);
        }
    }
    
    
    async publishMenu() {
        const slug = document.getElementById('menu-url-path').value;
        const title = document.getElementById('menu-title-publish').value || 'Our Menu';
        const subtitle = document.getElementById('menu-subtitle-publish').value || 'Crafted with care and passion';
        
        console.log('Publishing with slug:', slug);
        console.log('Will save to key:', `published-menu-${slug}`);
        
        // Set the slug as a property for uploads
        this.slug = slug;
        
        if (!slug || this.sections.length === 0) {
            alert('Please ensure you have a valid path and at least one menu section.');
            return;
        }
        
        try {
            // First load current menu data to preserve uploadedBackgrounds
            let existingData = {};
            if (this.publishedMenuId) {
                try {
                    const existingResponse = await fetch(`/api/menu/${slug}`);
                    if (existingResponse.ok) {
                        existingData = await existingResponse.json();
                    }
                } catch (error) {
                    console.log('Could not load existing menu data:', error);
                }
            }
            
            const publishData = {
                slug: slug,
                title: title,
                subtitle: subtitle,
                sections: this.sections,
                menuLogo: this.menuLogo,
                logoSize: this.logoSize,
                backgroundType: this.backgroundType,
                backgroundValue: this.backgroundValue,
                fontFamily: this.fontFamily,
                colorPalette: this.colorPalette,
                navigationTheme: this.navigationTheme,
                menuId: this.publishedMenuId, // Pass existing menuId for updates
                // Only include uploadedBackgrounds if we have existing data, otherwise let server preserve it
                ...(existingData.uploadedBackgrounds && { uploadedBackgrounds: existingData.uploadedBackgrounds })
            };
            
            console.log('Publishing with data:', publishData);
            
            const response = await fetch('/api/menu', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(publishData)
            });
            
            console.log('Server response status:', response.status);
            const data = await response.json();
            console.log('Server response data:', data);
            
            if (response.ok) {
                // Save published menu information for future updates
                this.publishedMenuId = data.menuId;
                this.publishedSlug = slug;
                this.publishedTitle = title;
                this.publishedSubtitle = subtitle;
                
                // Update current menu with publish data
                const menus = this.getUserMenus();
                const currentMenu = menus.find(m => m.id === this.currentMenuId);
                if (currentMenu) {
                    currentMenu.lastPublishedAt = new Date().toISOString();
                    currentMenu.status = 'published';
                    currentMenu.publishedMenuId = data.menuId;
                    currentMenu.publishedSlug = slug;
                    currentMenu.publishedTitle = title;
                    currentMenu.publishedSubtitle = subtitle;
                    this.saveUserMenu(currentMenu);
                }
                
                // Save to localStorage to persist published info
                this.saveToStorage();
                
                // Save a copy of the published menu data for revert functionality
                const publishedMenuData = {
                    title: title,
                    subtitle: subtitle,
                    sections: JSON.parse(JSON.stringify(this.sections)), // deep copy
                    menuLogo: this.menuLogo,
                    logoSize: this.logoSize,
                    backgroundType: this.backgroundType,
                    backgroundValue: this.backgroundValue,
                    fontFamily: this.fontFamily,
                    colorPalette: this.colorPalette,
                    navigationTheme: this.navigationTheme,
                    publishedAt: new Date().toISOString()
                };
                localStorage.setItem(`published-menu-${slug}`, JSON.stringify(publishedMenuData));
                console.log('Saved published menu data with key:', `published-menu-${slug}`, publishedMenuData);
                
                // Verify the save worked
                const testLoad = localStorage.getItem(`published-menu-${slug}`);
                console.log('Verification - can load saved data:', testLoad ? 'YES' : 'NO');
                
                // Show custom success modal
                const isUpdate = this.publishedMenuId && this.publishedMenuId === data.menuId;
                const action = isUpdate ? 'Updated' : 'Published';
                const menuUrl = `${window.location.origin}/menu/${slug}`;
                
                this.showSuccessModal(
                    `Menu ${action}!`,
                    `Your menu has been ${action.toLowerCase()} successfully and is now live!`,
                    menuUrl
                );
                
                this.closePublishModal();
            } else {
                alert(`Error publishing menu: ${data.error}`);
            }
        } catch (error) {
            alert('Error publishing menu. Please try again.');
            console.error('Error publishing menu:', error);
        }
    }
    
    updatePublishPreview() {
        // Optional: Update preview based on title/subtitle changes
        // This method is called when the user changes the title or subtitle in the publish modal
        const title = document.getElementById('menu-title-publish').value || 'Our Menu';
        const subtitle = document.getElementById('menu-subtitle-publish').value || 'Crafted with care and passion';
        
        // You could show a preview here if needed
        console.log('Preview updated:', { title, subtitle });
    }
    
    // === SIDEBAR AND USER MANAGEMENT ===
    
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        
        this.sidebarOpen = !this.sidebarOpen;
        
        if (this.sidebarOpen) {
            sidebar.classList.add('open');
            overlay.classList.add('active');
            this.loadUserMenus();
        } else {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        }
    }
    
    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        
        this.sidebarOpen = false;
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    }
    
    toggleSection(sectionName) {
        const header = document.getElementById(`${sectionName}-section-header`);
        const content = document.getElementById(`${sectionName}-list`);
        
        const isCollapsing = !content.classList.contains('collapsed');
        
        if (isCollapsing) {
            // Collapsing
            header.classList.add('collapsed');
            content.classList.add('collapsed');
        } else {
            // Expanding  
            header.classList.remove('collapsed');
            content.classList.remove('collapsed');
        }
    }
    
    initializeUser() {
        // Initialize with dummy user for now
        this.currentUser = {
            id: 'demo-user-001',
            name: 'Demo User',
            email: 'demo@example.com',
            plan: 'free', // free, premium, etc.
            maxMenus: 5,
            createdAt: new Date().toISOString()
        };
        
        // Create default menu if none exists
        this.initializeDefaultMenu();
        this.loadUserMenus();
        this.updateCurrentMenuDisplay();
        
        // Initialize sidebar sections state
        this.initializeSidebarSections();
        
        // Initialize logo display
        this.updateLogoDisplay();
        
        // Initialize background display
        this.updateBackgroundSelection();
        
        // Initialize font display
        this.updateFontSelection();
        
        // Initialize color palette display
        this.updateColorSelection();
        
        // Initialize navigation theme display
        this.updateNavigationSelection();
        
        // Apply background, font, and colors after a short delay to ensure DOM is ready
        setTimeout(() => {
            this.applyBackground();
            this.applyFontFamily();
            this.applyColorPalette();
            this.initializeDarkMode();
            
            // Load the last published menu from server AFTER initialization
            this.loadMenuFromServer('thisisthemenu2');
        }, 100);
    }
    
    async loadMenuFromServer(slug) {
        try {
            const response = await fetch(`/api/menu/${slug}`);
            
            if (!response.ok) {
                return;
            }
            
            const menuData = await response.json();
            
            // Load the styling options from the server data
            this.backgroundType = menuData.backgroundType || 'none';
            this.backgroundValue = menuData.backgroundValue || null;
            this.fontFamily = menuData.fontFamily || 'Inter';
            this.colorPalette = menuData.colorPalette || 'classic';
            this.navigationTheme = menuData.navigationTheme || 'modern';
            
            // Update all the UI selections
            this.updateBackgroundSelection();
            this.updateFontSelection();
            this.updateColorSelection();
            this.updateNavigationSelection();
            
            // Apply the loaded styles
            this.applyBackground();
            this.applyFontFamily();
            this.applyColorPalette();
            this.applyNavigationTheme();
            
            // Set the slug for this menu
            this.slug = slug;
            
            // Load recent backgrounds
            this.loadRecentBackgrounds();
            
            // Load sections if available
            if (menuData.sections) {
                this.sections = menuData.sections;
                this.renderMenu();
            }
            
        } catch (error) {
            console.error('Error loading menu from server:', error);
        }
    }
    
    initializeSidebarSections() {
        // Ensure Settings section starts collapsed as defined in HTML
        const settingsHeader = document.getElementById('settings-section-header');
        const settingsContent = document.getElementById('settings-list');
        
        if (settingsContent && settingsContent.classList.contains('collapsed')) {
            settingsHeader.classList.add('collapsed');
        }
        
        // Ensure Menus section starts expanded
        const menusHeader = document.getElementById('menus-section-header');
        const menusContent = document.getElementById('menus-list');
        
        if (menusContent && !menusContent.classList.contains('collapsed')) {
            menusHeader.classList.remove('collapsed');
        }
    }
    
    initializeDefaultMenu() {
        const userMenus = this.getUserMenus();
        
        if (userMenus.length === 0) {
            // Create a default menu
            const defaultMenuId = this.generateMenuId();
            const defaultMenu = {
                id: defaultMenuId,
                name: 'My Restaurant Menu',
                description: 'Main menu for my restaurant',
                sections: this.sections,
                sectionCounter: this.sectionCounter,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                publishedMenuId: this.publishedMenuId,
                publishedSlug: this.publishedSlug,
                publishedTitle: this.publishedTitle,
                publishedSubtitle: this.publishedSubtitle,
                status: this.publishedSlug ? 'published' : 'draft'
            };
            
            this.saveUserMenu(defaultMenu);
            this.currentMenuId = defaultMenuId;
        } else {
            // Load the first menu
            this.currentMenuId = userMenus[0].id;
            this.loadMenu(this.currentMenuId);
        }
    }
    
    generateMenuId() {
        return 'menu_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    getUserMenus() {
        const userKey = `user_${this.currentUser.id}_menus`;
        const saved = localStorage.getItem(userKey);
        return saved ? JSON.parse(saved) : [];
    }
    
    saveUserMenu(menu) {
        const menus = this.getUserMenus();
        const existingIndex = menus.findIndex(m => m.id === menu.id);
        
        if (existingIndex >= 0) {
            menus[existingIndex] = menu;
        } else {
            menus.push(menu);
        }
        
        const userKey = `user_${this.currentUser.id}_menus`;
        localStorage.setItem(userKey, JSON.stringify(menus));
    }
    
    deleteUserMenu(menuId) {
        const menus = this.getUserMenus();
        const filteredMenus = menus.filter(m => m.id !== menuId);
        
        const userKey = `user_${this.currentUser.id}_menus`;
        localStorage.setItem(userKey, JSON.stringify(filteredMenus));
    }
    
    loadMenu(menuId) {
        const menus = this.getUserMenus();
        const menu = menus.find(m => m.id === menuId);
        
        if (menu) {
            this.currentMenuId = menuId;
            this.sections = menu.sections || [];
            this.sectionCounter = menu.sectionCounter || 0;
            this.publishedMenuId = menu.publishedMenuId || null;
            this.publishedSlug = menu.publishedSlug || null;
            this.publishedTitle = menu.publishedTitle || null;
            this.publishedSubtitle = menu.publishedSubtitle || null;
            this.menuLogo = menu.menuLogo || null;
            this.logoSize = menu.logoSize || 'medium';
            this.backgroundType = menu.backgroundType || 'none';
            this.backgroundValue = menu.backgroundValue || null;
            this.fontFamily = menu.fontFamily || 'Inter';
            this.colorPalette = menu.colorPalette || 'classic';
            this.navigationTheme = menu.navigationTheme || 'modern';
            
            this.renderMenu();
            this.updateSidePreview();
            this.updateCurrentMenuDisplay();
            this.updateLogoDisplay();
            this.updateBackgroundSelection();
            this.updateFontSelection();
            this.updateColorSelection();
            this.updateNavigationSelection();
            this.applyBackground();
            this.applyFontFamily();
            this.applyColorPalette();
        }
    }
    
    saveCurrentMenu() {
        if (!this.currentMenuId) return;
        
        // Show saving indicator
        this.updateChangeIndicator('saving');
        
        const menu = {
            id: this.currentMenuId,
            name: document.getElementById('current-menu-name').textContent,
            sections: this.sections,
            sectionCounter: this.sectionCounter,
            updatedAt: new Date().toISOString(),
            publishedMenuId: this.publishedMenuId,
            publishedSlug: this.publishedSlug,
            publishedTitle: this.publishedTitle,
            publishedSubtitle: this.publishedSubtitle,
            menuLogo: this.menuLogo,
            logoSize: this.logoSize,
            backgroundType: this.backgroundType,
            backgroundValue: this.backgroundValue,
            fontFamily: this.fontFamily,
            colorPalette: this.colorPalette,
            navigationTheme: this.navigationTheme,
            status: this.publishedSlug ? 'published' : 'draft'
        };
        
        // Get existing menu to preserve other properties
        const menus = this.getUserMenus();
        const existingMenu = menus.find(m => m.id === this.currentMenuId);
        
        if (existingMenu) {
            Object.assign(existingMenu, menu);
            this.saveUserMenu(existingMenu);
        } else {
            menu.createdAt = new Date().toISOString();
            menu.description = 'My restaurant menu';
            this.saveUserMenu(menu);
        }
        
        // Clear unsaved changes flag
        this.hasUnsavedChanges = false;
        
        // Update displays
        this.updateCurrentMenuDisplay();
        this.updatePublishButtonVisibility();
        
        // Show saved indicator
        setTimeout(() => {
            this.updateChangeIndicator('saved');
        }, 500);
    }
    
    updateCurrentMenuDisplay() {
        const menus = this.getUserMenus();
        const currentMenu = menus.find(m => m.id === this.currentMenuId);
        
        if (currentMenu) {
            document.getElementById('current-menu-name').textContent = currentMenu.name;
            const statusElement = document.getElementById('menu-status');
            statusElement.textContent = currentMenu.status;
            statusElement.className = `menu-status ${currentMenu.status}`;
        }
        
        // Update publish button visibility
        this.updatePublishButtonVisibility();
    }
    
    loadUserMenus() {
        const menusList = document.getElementById('menus-list');
        const menus = this.getUserMenus();
        
        let html = '';
        
        // Add existing menus
        menus.forEach(menu => {
            const isActive = menu.id === this.currentMenuId;
            const updatedDate = new Date(menu.updatedAt).toLocaleDateString();
            
            html += `
                <div class="menu-item ${isActive ? 'active' : ''}" data-menu-id="${menu.id}">
                    <i class="fas fa-utensils"></i>
                    <div class="menu-info">
                        <div class="menu-name">${menu.name}</div>
                        <div class="menu-meta">
                            <span>${updatedDate}</span>
                            <span>${menu.status}</span>
                            <span>${(menu.sections || []).length} sections</span>
                        </div>
                    </div>
                    <div class="menu-actions">
                        <button class="menu-action" onclick="menuEditor.duplicateMenu('${menu.id}')" title="Duplicate">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="menu-action" onclick="menuEditor.renameMenu('${menu.id}')" title="Rename">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${!isActive ? `<button class="menu-action" onclick="menuEditor.deleteMenu('${menu.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>` : ''}
                    </div>
                </div>
            `;
        });
        
        // Add "New Menu" option if under limit
        if (menus.length < this.currentUser.maxMenus) {
            html += `
                <div class="new-menu-item" onclick="menuEditor.createNewMenu()">
                    <i class="fas fa-plus"></i>
                    <span>Create New Menu</span>
                </div>
            `;
        } else {
            html += `
                <div class="menu-limit-notice">
                    <i class="fas fa-lock"></i>
                    <span>Menu limit reached (${this.currentUser.maxMenus})</span>
                    <small>Upgrade for more menus</small>
                </div>
            `;
        }
        
        menusList.innerHTML = html;
        
        // Attach click listeners to menu items
        menusList.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.menu-actions')) {
                    const menuId = item.getAttribute('data-menu-id');
                    this.switchToMenu(menuId);
                }
            });
        });
    }
    
    switchToMenu(menuId) {
        if (menuId === this.currentMenuId) {
            this.closeSidebar();
            return;
        }
        
        // Save current menu before switching
        this.saveCurrentMenu();
        
        // Load new menu
        this.loadMenu(menuId);
        this.closeSidebar();
    }
    
    createNewMenu() {
        const menus = this.getUserMenus();
        if (menus.length >= this.currentUser.maxMenus) {
            alert(`You've reached the limit of ${this.currentUser.maxMenus} menus. Upgrade for more!`);
            return;
        }
        
        const menuName = prompt('Enter a name for your new menu:', `Menu ${menus.length + 1}`);
        if (!menuName) return;
        
        // Save current menu first
        this.saveCurrentMenu();
        
        // Create new menu
        const newMenuId = this.generateMenuId();
        const newMenu = {
            id: newMenuId,
            name: menuName,
            description: 'New menu',
            sections: [],
            sectionCounter: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedMenuId: null,
            publishedSlug: null,
            publishedTitle: null,
            publishedSubtitle: null,
            status: 'draft'
        };
        
        this.saveUserMenu(newMenu);
        this.loadMenu(newMenuId);
        this.closeSidebar();
    }
    
    duplicateMenu(menuId) {
        const menus = this.getUserMenus();
        const menuToDuplicate = menus.find(m => m.id === menuId);
        
        if (!menuToDuplicate) return;
        
        if (menus.length >= this.currentUser.maxMenus) {
            alert(`You've reached the limit of ${this.currentUser.maxMenus} menus. Upgrade for more!`);
            return;
        }
        
        const newName = prompt('Enter a name for the duplicated menu:', `${menuToDuplicate.name} (Copy)`);
        if (!newName) return;
        
        const duplicatedMenu = {
            ...menuToDuplicate,
            id: this.generateMenuId(),
            name: newName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedMenuId: null,
            publishedSlug: null,
            publishedTitle: null,
            publishedSubtitle: null,
            status: 'draft'
        };
        
        this.saveUserMenu(duplicatedMenu);
        this.loadUserMenus();
    }
    
    renameMenu(menuId) {
        const menus = this.getUserMenus();
        const menu = menus.find(m => m.id === menuId);
        
        if (!menu) return;
        
        const newName = prompt('Enter a new name for this menu:', menu.name);
        if (!newName || newName === menu.name) return;
        
        menu.name = newName;
        menu.updatedAt = new Date().toISOString();
        
        this.saveUserMenu(menu);
        this.loadUserMenus();
        
        if (menuId === this.currentMenuId) {
            this.updateCurrentMenuDisplay();
        }
    }
    
    deleteMenu(menuId) {
        const menus = this.getUserMenus();
        const menu = menus.find(m => m.id === menuId);
        
        if (!menu) return;
        
        if (!confirm(`Are you sure you want to delete "${menu.name}"? This cannot be undone.`)) {
            return;
        }
        
        this.deleteUserMenu(menuId);
        this.loadUserMenus();
    }
    
    // === CHANGE TRACKING AND STATUS ===
    
    markAsChanged() {
        this.hasUnsavedChanges = true;
        this.updateChangeIndicator('unsaved');
        
        // Clear any existing auto-save timeout (we're making it manual)
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }
    }
    
    updateChangeIndicator(status = 'saved') {
        const indicator = document.getElementById('change-indicator');
        const discardButton = document.getElementById('discard-changes');
        if (!indicator) return;
        
        // Remove all status classes
        indicator.classList.remove('saved', 'unsaved', 'saving', 'needs-publish');
        
        // Add current status class
        indicator.classList.add(status);
        
        switch (status) {
            case 'saved':
                indicator.innerHTML = '<i class="fas fa-circle"></i> Saved';
                discardButton.style.display = 'none';
                break;
            case 'unsaved':
                indicator.innerHTML = '<i class="fas fa-circle"></i> Unsaved changes';
                discardButton.style.display = 'inline-flex';
                break;
            case 'saving':
                indicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                discardButton.style.display = 'none';
                break;
            case 'needs-publish':
                indicator.innerHTML = '<i class="fas fa-exclamation-circle"></i> Ready to publish';
                discardButton.style.display = 'none';
                break;
        }
    }
    
    viewPublishedMenu() {
        if (!this.publishedSlug) {
            alert('This menu has not been published yet. Use the Publish button to make it live.');
            return;
        }
        
        // Open the actual published menu in new tab
        window.open(`/menu/${this.publishedSlug}`, '_blank');
    }
    
    updatePublishButtonVisibility() {
        const viewButton = document.getElementById('view-published-menu');
        const publishButton = document.getElementById('publish-menu');
        
        if (this.publishedSlug) {
            // Menu is published - show view button
            viewButton.style.display = 'inline-flex';
            publishButton.innerHTML = '<i class="fas fa-sync"></i> Update Menu';
            
            // Check if there are changes since last publish
            const menus = this.getUserMenus();
            const currentMenu = menus.find(m => m.id === this.currentMenuId);
            
            if (currentMenu && this.hasChangesForPublishing(currentMenu)) {
                this.updateChangeIndicator('needs-publish');
            }
        } else {
            // Menu not published - hide view button
            viewButton.style.display = 'none';
            publishButton.innerHTML = '<i class="fas fa-share-alt"></i> Publish';
        }
    }
    
    hasChangesForPublishing(menu) {
        // Simple check - could be more sophisticated
        return menu.updatedAt > (menu.lastPublishedAt || menu.createdAt);
    }
    
    // === DISCARD FUNCTIONALITY ===
    
    openDiscardModal() {
        const modal = document.getElementById('discard-modal');
        const revertPublishedOption = document.getElementById('revert-published-option');
        
        // Show/hide the "Revert to Published" option based on whether menu is published
        if (this.publishedSlug) {
            revertPublishedOption.style.display = 'block';
        } else {
            revertPublishedOption.style.display = 'none';
        }
        
        modal.style.display = 'block';
    }
    
    closeDiscardModal() {
        const modal = document.getElementById('discard-modal');
        modal.style.display = 'none';
    }
    
    revertToSaved() {
        if (!this.currentMenuId) return;
        
        // Load the last saved state from user menus
        const menus = this.getUserMenus();
        const menuData = menus.find(m => m.id === this.currentMenuId);
        
        if (menuData) {
            
            // Restore the menu data
            this.sections = menuData.sections || [];
            this.publishedMenuId = menuData.publishedMenuId || null;
            this.publishedSlug = menuData.publishedSlug || null;
            this.publishedTitle = menuData.publishedTitle || null;
            this.publishedSubtitle = menuData.publishedSubtitle || null;
            this.menuLogo = menuData.menuLogo || null;
            this.logoSize = menuData.logoSize || 'medium';
            this.backgroundType = menuData.backgroundType || 'none';
            this.backgroundValue = menuData.backgroundValue || null;
            this.fontFamily = menuData.fontFamily || 'Inter';
            this.colorPalette = menuData.colorPalette || 'classic';
            
            // Re-render the editor
            this.renderMenuEditor();
            
            // Update change tracking
            this.hasUnsavedChanges = false;
            this.updateChangeIndicator('saved');
            this.updatePublishButtonVisibility();
            
            // Close modal
            this.closeDiscardModal();
            
            // Update preview if visible
            if (this.sidePreviewVisible) {
                this.updateSidePreview();
            }
            
            console.log('Reverted to last saved state');
        } else {
            alert('No saved version found to revert to.');
        }
    }
    
    revertToPublished() {
        if (!this.publishedSlug) {
            alert('No published version available to revert to.');
            return;
        }
        
        // Load the published version from localStorage
        const publishedMenuData = localStorage.getItem(`published-menu-${this.publishedSlug}`);
        
        if (publishedMenuData) {
            const menuData = JSON.parse(publishedMenuData);
            
            // Restore to published state
            this.sections = menuData.sections || [];
            this.menuLogo = menuData.menuLogo || null;
            this.logoSize = menuData.logoSize || 'medium';
            this.backgroundType = menuData.backgroundType || 'none';
            this.backgroundValue = menuData.backgroundValue || null;
            this.fontFamily = menuData.fontFamily || 'Inter';
            this.colorPalette = menuData.colorPalette || 'classic';
            
            // Re-render the editor
            this.renderMenuEditor();
            
            // Update change tracking - mark as needs publish since we reverted to published
            this.hasUnsavedChanges = true;
            this.updateChangeIndicator('needs-publish');
            
            // Close modal
            this.closeDiscardModal();
            
            // Update preview if visible
            if (this.sidePreviewVisible) {
                this.updateSidePreview();
            }
            
            console.log('Reverted to published version');
        } else {
            alert('Published version not found. It may have been deleted or corrupted.');
        }
    }
    
    // === LOGO FUNCTIONALITY ===
    
    triggerLogoUpload() {
        const fileInput = document.getElementById('logo-file-input');
        fileInput.click();
    }
    
    async handleLogoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validate file type
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Please select a valid image file (PNG, JPG, GIF, SVG, or WebP).');
            return;
        }
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size too large. Please select an image smaller than 5MB.');
            return;
        }
        
        try {
            // Upload to server
            const uploadResponse = await this.uploadLogoImage(file);
            
            if (uploadResponse.success) {
                // Use the uploaded logo URL
                this.menuLogo = uploadResponse.url;
                this.updateLogoDisplay();
                this.markAsChanged();
                this.saveToStorage();
                
                // Update preview if visible
                if (this.sidePreviewVisible) {
                    this.updateSidePreview();
                }
            } else {
                alert('Failed to upload logo. Please try again.');
            }
        } catch (error) {
            console.error('Logo upload failed:', error);
            alert('Failed to upload logo. Please try again.');
        }
    }
    
    removeLogo() {
        if (!confirm('Are you sure you want to remove the logo?')) {
            return;
        }
        
        this.menuLogo = null;
        this.updateLogoDisplay();
        this.markAsChanged();
        this.saveToStorage();
        
        // Update preview if visible
        if (this.sidePreviewVisible) {
            this.updateSidePreview();
        }
    }
    
    updateLogoDisplay() {
        const uploadBtn = document.getElementById('upload-logo');
        const removeBtn = document.getElementById('remove-logo');
        
        if (this.menuLogo) {
            uploadBtn.innerHTML = '<i class="fas fa-image"></i> Change Logo';
            removeBtn.style.display = 'inline-flex';
        } else {
            uploadBtn.innerHTML = '<i class="fas fa-image"></i> Add Logo';
            removeBtn.style.display = 'none';
        }
    }
    
    setLogoSize(size) {
        this.logoSize = size;
        this.markAsChanged();
        this.saveToStorage();
        
        // Update preview if visible
        if (this.sidePreviewVisible) {
            this.updateSidePreview();
        }
        
        // Update size button states
        document.querySelectorAll('.logo-size-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`logo-size-${size}`).classList.add('active');
    }
    
    // === BACKGROUND CUSTOMIZATION ===
    
    highlightCurrentBackgroundSelection() {
        // Clear all previous selections
        const allOptions = document.querySelectorAll('.background-option');
        allOptions.forEach(option => option.classList.remove('selected'));
        
        // Highlight current selection
        if (this.backgroundType === 'none') {
            const noneOption = document.querySelector('.background-option[data-type="none"]');
            if (noneOption) noneOption.classList.add('selected');
        } else if (this.backgroundType === 'image' && this.backgroundValue) {
            const imageOption = document.querySelector(`.background-option[data-value="${this.backgroundValue}"]`);
            if (imageOption) imageOption.classList.add('selected');
        }
    }
    
    selectBackgroundImage(imagePath) {
        this.backgroundType = 'image';
        this.backgroundValue = imagePath;
        this.applyBackground();
        this.updateBackgroundSelection();
        this.markAsChanged();
        this.saveToStorage();
        
        // Update preview if visible
        if (this.sidePreviewVisible) {
            this.updateSidePreview();
        }
    }
    
    selectBackgroundColor() {
        const colorPicker = document.getElementById('background-color-picker');
        const color = colorPicker.value;
        
        this.backgroundType = 'color';
        this.backgroundValue = color;
        this.applyBackground();
        this.updateBackgroundSelection();
        this.markAsChanged();
        this.saveToStorage();
        
        // Update preview if visible
        if (this.sidePreviewVisible) {
            this.updateSidePreview();
        }
    }
    
    removeBackground() {
        this.backgroundType = 'none';
        this.backgroundValue = null;
        this.applyBackground();
        this.updateBackgroundSelection();
        this.markAsChanged();
        this.saveToStorage();
        
        // Update preview if visible
        if (this.sidePreviewVisible) {
            this.updateSidePreview();
        }
    }
    
    closeOtherDropdowns(except = null) {
        // Close background dropdown
        if (except !== 'background' && this.backgroundDropdownOpen) {
            this.backgroundDropdownOpen = false;
            const bgDropdown = document.getElementById('background-dropdown');
            const bgButton = document.getElementById('background-options');
            if (bgDropdown) bgDropdown.style.display = 'none';
            if (bgButton) bgButton.classList.remove('active');
        }
        
        // Close font dropdown
        if (except !== 'font' && this.fontDropdownOpen) {
            this.fontDropdownOpen = false;
            const fontDropdown = document.getElementById('font-dropdown');
            const fontButton = document.getElementById('font-options');
            if (fontDropdown) fontDropdown.style.display = 'none';
            if (fontButton) fontButton.classList.remove('active');
        }
        
        // Close color dropdown
        if (except !== 'color' && this.colorDropdownOpen) {
            this.colorDropdownOpen = false;
            const colorDropdown = document.getElementById('color-dropdown');
            const colorButton = document.getElementById('color-options');
            if (colorDropdown) colorDropdown.style.display = 'none';
            if (colorButton) colorButton.classList.remove('active');
        }
        
        // Close navigation dropdown
        if (except !== 'navigation' && this.navigationDropdownOpen) {
            this.navigationDropdownOpen = false;
            const navigationDropdown = document.getElementById('navigation-dropdown');
            const navigationButton = document.getElementById('navigation-options');
            if (navigationDropdown) navigationDropdown.style.display = 'none';
            if (navigationButton) navigationButton.classList.remove('active');
        }
    }
    
    toggleBackgroundDropdown() {
        // Close other dropdowns first
        this.closeOtherDropdowns('background');
        
        const dropdown = document.getElementById('background-dropdown');
        this.backgroundDropdownOpen = !this.backgroundDropdownOpen;
        dropdown.style.display = this.backgroundDropdownOpen ? 'block' : 'none';
        
        // Update button state
        const button = document.getElementById('background-options');
        button.classList.toggle('active', this.backgroundDropdownOpen);
        
        // Highlight current selection when dropdown opens
        if (this.backgroundDropdownOpen) {
            this.highlightCurrentBackgroundSelection();
        }
    }
    
    selectBackgroundImage(imagePath) {
        this.backgroundType = 'image';
        this.backgroundValue = imagePath;
        this.applyBackground();
        this.updateBackgroundSelection();
        this.markAsChanged();
        this.saveToStorage();
        
        // Update preview if visible
        if (this.sidePreviewVisible) {
            this.updateSidePreview();
        }
        
        // Close dropdown
        this.backgroundDropdownOpen = false;
        document.getElementById('background-dropdown').style.display = 'none';
        document.getElementById('background-options').classList.remove('active');
    }
    
    selectBackgroundColor(color) {
        this.backgroundType = 'color';
        this.backgroundValue = color;
        this.applyBackground();
        this.updateBackgroundSelection();
        this.markAsChanged();
        this.saveToStorage();
        
        // Update preview if visible
        if (this.sidePreviewVisible) {
            this.updateSidePreview();
        }
        
        // Close dropdown
        this.backgroundDropdownOpen = false;
        document.getElementById('background-dropdown').style.display = 'none';
        document.getElementById('background-options').classList.remove('active');
    }
    
    async handleBackgroundUpload(file) {
        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            alert('File size must be less than 5MB');
            return;
        }
        
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Please select a JPG, PNG, or WEBP image');
            return;
        }
        
        // Show filename
        const filenameEl = document.getElementById('upload-filename');
        filenameEl.textContent = file.name;
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewEl = document.getElementById('upload-preview');
            const imgEl = document.getElementById('upload-preview-img');
            
            imgEl.src = e.target.result;
            previewEl.style.display = 'flex';
            
            // Store the image data for later use
            this.pendingUploadData = e.target.result;
            this.pendingUploadFilename = file.name;
        };
        reader.readAsDataURL(file);
    }
    
    async applyUploadedBackground() {
        if (!this.pendingUploadData) return;
        
        try {
            // Upload to server
            const uploadResponse = await this.uploadBackgroundImage(this.pendingUploadData, this.pendingUploadFilename);
            
            if (uploadResponse.success) {
                // Use the uploaded image
                this.backgroundType = 'image';
                this.backgroundValue = uploadResponse.url;
                this.applyBackground();
                this.updateBackgroundSelection();
                this.markAsChanged();
                this.saveToStorage();
                
                // Update preview if visible
                if (this.sidePreviewVisible) {
                    this.updateSidePreview();
                }
                
                // Close dropdown
                this.backgroundDropdownOpen = false;
                document.getElementById('background-dropdown').style.display = 'none';
                document.getElementById('background-options').classList.remove('active');
                
                // Reset upload UI
                this.resetUploadUI();
                
                // Refresh recent backgrounds to show the new upload
                this.loadRecentBackgrounds();
            } else {
                alert('Upload failed: ' + (uploadResponse.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed. Please try again.');
        }
    }
    
    async uploadBackgroundImage(imageData, filename) {
        // Convert data URL to blob
        const response = await fetch(imageData);
        const blob = await response.blob();
        
        // Create FormData
        const formData = new FormData();
        formData.append('background', blob, filename);
        formData.append('slug', this.slug); // Include slug to track menu-specific uploads
        
        // Upload to server
        const uploadResponse = await fetch('/api/upload-background', {
            method: 'POST',
            body: formData
        });
        
        return await uploadResponse.json();
    }
    
    async uploadLogoImage(file) {
        // Create FormData
        const formData = new FormData();
        formData.append('logo', file);
        formData.append('slug', this.slug); // Include slug to track menu-specific uploads
        
        // Upload to server
        const uploadResponse = await fetch('/api/upload-logo', {
            method: 'POST',
            body: formData
        });
        
        return await uploadResponse.json();
    }
    
    resetUploadUI() {
        document.getElementById('upload-filename').textContent = '';
        document.getElementById('upload-preview').style.display = 'none';
        document.getElementById('background-upload').value = '';
        this.pendingUploadData = null;
        this.pendingUploadFilename = null;
    }
    
    async loadRecentBackgrounds() {
        if (!this.slug) return;
        
        try {
            const response = await fetch(`/api/menu/${this.slug}/backgrounds`);
            const data = await response.json();
            
            if (data.backgrounds && data.backgrounds.length > 0) {
                this.displayRecentBackgrounds(data.backgrounds, data.currentBackground);
            } else {
                // Hide the recent backgrounds section if no uploads
                document.getElementById('recent-backgrounds-section').style.display = 'none';
            }
        } catch (error) {
            console.error('Error loading recent backgrounds:', error);
            document.getElementById('recent-backgrounds-section').style.display = 'none';
        }
    }
    
    displayRecentBackgrounds(backgrounds, currentBackground) {
        const section = document.getElementById('recent-backgrounds-section');
        const grid = document.getElementById('recent-backgrounds-grid');
        
        // Clear existing backgrounds
        grid.innerHTML = '';
        
        backgrounds.forEach(background => {
            const option = document.createElement('div');
            option.className = 'recent-background-option';
            option.dataset.url = background.url;
            
            // Mark as selected if it's the current background
            if (background.url === currentBackground) {
                option.classList.add('selected');
            }
            
            // Create image element
            const img = document.createElement('img');
            img.src = background.url;
            img.alt = background.filename;
            img.onerror = () => {
                // If image fails to load, show a placeholder
                option.innerHTML = `
                    <div style="display:flex;align-items:center;justify-content:center;height:80%;font-size:24px;color:#999;">
                        🖼️
                    </div>
                    <div class="filename">${background.filename}</div>
                `;
            };
            
            // Create filename label
            const filename = document.createElement('div');
            filename.className = 'filename';
            filename.textContent = background.filename;
            
            option.appendChild(img);
            option.appendChild(filename);
            
            // Add click handler
            option.addEventListener('click', () => {
                this.selectRecentBackground(background.url);
            });
            
            grid.appendChild(option);
        });
        
        // Show the section
        section.style.display = 'block';
    }
    
    selectRecentBackground(url) {
        this.backgroundType = 'image';
        this.backgroundValue = url;
        this.applyBackground();
        this.updateBackgroundSelection();
        this.updateRecentBackgroundSelection(url);
        this.markAsChanged();
        this.saveToStorage();
        
        // Update preview if visible
        if (this.sidePreviewVisible) {
            this.updateSidePreview();
        }
        
        // Close dropdown
        this.backgroundDropdownOpen = false;
        document.getElementById('background-dropdown').style.display = 'none';
        document.getElementById('background-options').classList.remove('active');
    }
    
    updateRecentBackgroundSelection(selectedUrl) {
        const recentOptions = document.querySelectorAll('.recent-background-option');
        recentOptions.forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.url === selectedUrl) {
                option.classList.add('selected');
            }
        });
    }
    
    clearBackground() {
        this.removeBackground();
        
        // Close dropdown
        this.backgroundDropdownOpen = false;
        document.getElementById('background-dropdown').style.display = 'none';
        document.getElementById('background-options').classList.remove('active');
    }
    
    applyBackground() {
        // Apply to all preview containers
        const previewContainers = document.querySelectorAll(
            '.preview-menu-container, .published-menu-container, #side-preview-content, #preview-content'
        );
        
        console.log('Applying background to', previewContainers.length, 'containers');
        console.log('Background type:', this.backgroundType, 'value:', this.backgroundValue);
        
        previewContainers.forEach(container => {
            console.log('Applying background to:', container.id || container.className);
            this.applyBackgroundToElement(container);
        });
        
        // Also apply to smartphone containers for proper color background coverage
        setTimeout(() => {
            const smartphoneContainers = document.querySelectorAll('.smartphone-content');
            smartphoneContainers.forEach(container => {
                if (this.backgroundType === 'color') {
                    // For color backgrounds, apply to the smartphone container for full coverage
                    this.applyBackgroundToElement(container);
                } else if (this.backgroundType === 'image') {
                    // For image backgrounds, apply to the content area to maintain proper image display
                    const contentArea = container.querySelector('.preview-content');
                    if (contentArea) {
                        this.applyBackgroundToElement(contentArea);
                    }
                }
            });
        }, 100);
    }
    
    applyBackgroundToElement(element) {
        // Reset background
        element.style.background = '';
        element.style.backgroundImage = '';
        element.style.backgroundColor = '';
        
        switch (this.backgroundType) {
            case 'image':
                element.style.backgroundImage = `url('${this.backgroundValue}')`;
                // Check if this is in the preview modal
                if (element.closest('#preview-modal')) {
                    element.style.backgroundSize = 'contain'; // Scale entire image to fit phone screen
                    element.style.backgroundPosition = 'top center';
                    element.style.backgroundAttachment = 'local';
                } else {
                    element.style.backgroundSize = 'cover';
                    element.style.backgroundPosition = 'center';
                    element.style.backgroundAttachment = 'fixed';
                }
                element.style.backgroundRepeat = 'no-repeat';
                break;
            case 'color':
                element.style.backgroundColor = this.backgroundValue;
                break;
            case 'none':
            default:
                // Keep default styling
                break;
        }
    }
    
    updateBackgroundSelection() {
        // Update selected state in dropdown
        const options = document.querySelectorAll('.background-option');
        options.forEach(option => {
            option.classList.remove('selected');
            
            const type = option.dataset.type;
            const value = option.dataset.value;
            
            if (this.backgroundType === type && this.backgroundValue === value) {
                option.classList.add('selected');
            } else if (this.backgroundType === 'none' && type === 'none') {
                option.classList.add('selected');
            }
        });
        
        // Also update recent backgrounds selection if using an uploaded image
        if (this.backgroundType === 'image' && this.backgroundValue) {
            this.updateRecentBackgroundSelection(this.backgroundValue);
        }
    }
    
    // === FONT FAMILY CUSTOMIZATION ===
    
    toggleFontDropdown() {
        // Close other dropdowns first
        this.closeOtherDropdowns('font');
        
        const dropdown = document.getElementById('font-dropdown');
        this.fontDropdownOpen = !this.fontDropdownOpen;
        dropdown.style.display = this.fontDropdownOpen ? 'block' : 'none';
        
        // Update button state
        const button = document.getElementById('font-options');
        button.classList.toggle('active', this.fontDropdownOpen);
        
        // Highlight current selection when dropdown opens
        if (this.fontDropdownOpen) {
            this.highlightCurrentFontSelection();
        }
    }
    
    highlightCurrentFontSelection() {
        // Clear all previous selections
        const allOptions = document.querySelectorAll('.font-option');
        allOptions.forEach(option => option.classList.remove('selected'));
        
        // Highlight current selection
        const currentOption = document.querySelector(`.font-option[data-font="${this.fontFamily}"]`);
        if (currentOption) {
            currentOption.classList.add('selected');
        }
    }
    
    selectFontFamily(fontFamily) {
        this.fontFamily = fontFamily;
        this.applyFontFamily();
        this.updateFontSelection();
        this.markAsChanged();
        this.saveToStorage();
        
        // Update preview if visible
        if (this.sidePreviewVisible) {
            this.updateSidePreview();
        }
        
        // Close dropdown
        this.fontDropdownOpen = false;
        document.getElementById('font-dropdown').style.display = 'none';
        document.getElementById('font-options').classList.remove('active');
    }
    
    applyFontFamily() {
        // Get font stack based on selected family
        const fontStacks = {
            'Inter': "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            'Playfair Display': "'Playfair Display', Georgia, 'Times New Roman', serif",
            'Georgia': "Georgia, 'Times New Roman', Times, serif",
            'Lato': "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            'Montserrat': "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        };
        
        const fontStack = fontStacks[this.fontFamily] || fontStacks['Inter'];
        
        // Apply to all preview containers
        const previewContainers = document.querySelectorAll(
            '.preview-menu-container, .published-menu-container, #side-preview-content, #preview-content, .smartphone-content'
        );
        
        previewContainers.forEach(container => {
            container.style.fontFamily = fontStack;
        });
        
        console.log('Applied font family:', this.fontFamily, 'Stack:', fontStack);
    }
    
    updateFontSelection() {
        // Update selected state in dropdown
        const options = document.querySelectorAll('.font-option');
        options.forEach(option => {
            option.classList.remove('selected');
            
            if (option.dataset.font === this.fontFamily) {
                option.classList.add('selected');
            }
        });
    }
    
    // === COLOR PALETTE CUSTOMIZATION ===
    
    toggleColorDropdown() {
        // Close other dropdowns first
        this.closeOtherDropdowns('color');
        
        const dropdown = document.getElementById('color-dropdown');
        this.colorDropdownOpen = !this.colorDropdownOpen;
        dropdown.style.display = this.colorDropdownOpen ? 'block' : 'none';
        
        // Update button state
        const button = document.getElementById('color-options');
        button.classList.toggle('active', this.colorDropdownOpen);
        
        // Highlight current selection when dropdown opens
        if (this.colorDropdownOpen) {
            this.highlightCurrentColorSelection();
        }
    }
    
    highlightCurrentColorSelection() {
        // Clear all previous selections
        const allOptions = document.querySelectorAll('.palette-option');
        allOptions.forEach(option => option.classList.remove('selected'));
        
        // Highlight current selection
        const currentOption = document.querySelector(`.palette-option[data-palette="${this.colorPalette}"]`);
        if (currentOption) {
            currentOption.classList.add('selected');
        }
    }
    
    selectColorPalette(palette) {
        this.colorPalette = palette;
        this.applyColorPalette();
        this.updateColorSelection();
        this.markAsChanged();
        this.saveToStorage();
        
        // Update preview if visible
        if (this.sidePreviewVisible) {
            this.updateSidePreview();
        }
        
        // Close dropdown
        this.colorDropdownOpen = false;
        document.getElementById('color-dropdown').style.display = 'none';
        document.getElementById('color-options').classList.remove('active');
    }
    
    applyColorPalette() {
        const palette = this.colorPalettes[this.colorPalette];
        if (!palette) return;
        
        // Apply colors to all preview containers
        const previewContainers = document.querySelectorAll(
            '.preview-menu-container, .published-menu-container, #side-preview-content, #preview-content, .smartphone-content'
        );
        
        previewContainers.forEach(container => {
            this.applyColorsToContainer(container, palette);
        });
        
        // Apply colors to navigation
        this.applyColorsToNavigation();
        
        console.log('Applied color palette:', this.colorPalette, palette);
    }
    
    applyColorsToContainer(container, palette) {
        // Apply colors using CSS custom properties for easy override
        container.style.setProperty('--primary-text-color', palette.primaryText);
        container.style.setProperty('--secondary-text-color', palette.secondaryText);
        container.style.setProperty('--header-color', palette.headers);
        container.style.setProperty('--accent-color', palette.accent);
        container.style.setProperty('--background-color', palette.background);
        container.style.setProperty('--muted-color', palette.muted);
        
        // Apply specific element colors
        const primaryTextElements = container.querySelectorAll('.preview-item-title .preview-title-text, .preview-menu-title');
        primaryTextElements.forEach(el => el.style.color = palette.primaryText);
        
        const secondaryTextElements = container.querySelectorAll('.preview-item-description, .preview-menu-subtitle');
        secondaryTextElements.forEach(el => el.style.color = palette.secondaryText);
        
        const headerElements = container.querySelectorAll('.preview-section h2, .preview-column-header');
        headerElements.forEach(el => el.style.color = palette.headers);
        
        const accentElements = container.querySelectorAll('.preview-price-cell, .preview-title-price');
        accentElements.forEach(el => el.style.color = palette.accent);
        
        // Apply secondary text color to all non-price data cells
        const dataElements = container.querySelectorAll('.preview-data-cell:not(.preview-price-cell)');
        dataElements.forEach(el => el.style.color = palette.secondaryText);
    }
    
    updateColorSelection() {
        // Update selected state in dropdown
        const options = document.querySelectorAll('.palette-option');
        options.forEach(option => {
            option.classList.remove('selected');
            
            if (option.dataset.palette === this.colorPalette) {
                option.classList.add('selected');
            }
        });
    }
    
    // === NAVIGATION THEME FUNCTIONALITY ===
    
    toggleNavigationDropdown() {
        this.closeOtherDropdowns('navigation');
        
        const dropdown = document.getElementById('navigation-dropdown');
        this.navigationDropdownOpen = !this.navigationDropdownOpen;
        dropdown.style.display = this.navigationDropdownOpen ? 'block' : 'none';
        
        const button = document.getElementById('navigation-options');
        button.classList.toggle('active', this.navigationDropdownOpen);
        
        // Highlight current selection when dropdown opens
        if (this.navigationDropdownOpen) {
            this.highlightCurrentNavigationSelection();
        }
    }
    
    highlightCurrentNavigationSelection() {
        // Clear all previous selections
        const allOptions = document.querySelectorAll('.theme-option');
        allOptions.forEach(option => option.classList.remove('selected'));
        
        // Highlight current selection
        const currentOption = document.querySelector(`.theme-option[data-theme="${this.navigationTheme}"]`);
        if (currentOption) {
            currentOption.classList.add('selected');
        }
    }
    
    selectNavigationTheme(theme) {
        this.navigationTheme = theme;
        this.applyNavigationTheme();
        this.updateNavigationSelection();
        this.markAsChanged();
        this.saveToStorage();
        
        // Update preview if visible
        if (this.sidePreviewVisible) {
            this.updateSidePreview();
        }
        
        // Close dropdown
        this.navigationDropdownOpen = false;
        document.getElementById('navigation-dropdown').style.display = 'none';
        document.getElementById('navigation-options').classList.remove('active');
    }
    
    applyNavigationTheme() {
        // Apply theme to all navigation elements
        const navigationElements = document.querySelectorAll('.preview-navigation');
        
        navigationElements.forEach(nav => {
            // Remove existing theme classes
            nav.classList.remove('theme-modern', 'theme-glass', 'theme-minimal');
            // Add new theme class
            nav.classList.add(`theme-${this.navigationTheme}`);
        });
        
        // Apply color palette to navigation elements
        this.applyColorsToNavigation();
        
        // Update theme on next preview generation
        this.navigationThemeClass = `theme-${this.navigationTheme}`;
    }
    
    applyColorsToNavigation() {
        // Get current color palette
        const palette = this.colorPalettes[this.colorPalette];
        if (!palette) return;
        
        // Apply colors to all navigation containers
        const navigationElements = document.querySelectorAll('.preview-navigation, #preview-navigation, #modal-preview-navigation');
        
        navigationElements.forEach(nav => {
            // Set CSS custom properties for navigation theming
            nav.style.setProperty('--nav-primary-color', palette.primaryText);
            nav.style.setProperty('--nav-secondary-color', palette.secondaryText);
            nav.style.setProperty('--nav-accent-color', palette.accent);
            nav.style.setProperty('--nav-background-color', palette.background);
            nav.style.setProperty('--nav-header-color', palette.headers);
        });
    }
    
    updateNavigationSelection() {
        // Update selected state in dropdown
        const options = document.querySelectorAll('.theme-option');
        options.forEach(option => {
            option.classList.remove('selected');
            
            if (option.dataset.theme === this.navigationTheme) {
                option.classList.add('selected');
            }
        });
    }
    
    // === MENU ITEM FUNCTIONALITY ===
    
    updateMenuItem(sectionId, itemIndex, column, value) {
        const section = this.sections.find(s => s.id === sectionId);
        if (!section || !section.items[itemIndex]) return;
        
        section.items[itemIndex][column] = value;
        this.markAsChanged();
        this.saveCurrentMenu();
    }
    
    deleteMenuItem(sectionId, itemIndex) {
        const section = this.sections.find(s => s.id === sectionId);
        if (!section || !section.items[itemIndex]) return;
        
        section.items.splice(itemIndex, 1);
        this.renderMenu();
        this.markAsChanged();
        this.saveCurrentMenu();
    }
    
    duplicateMenuItem(sectionId, itemIndex) {
        const section = this.sections.find(s => s.id === sectionId);
        if (!section || !section.items[itemIndex]) return;
        
        // Create a deep copy of the item
        const originalItem = section.items[itemIndex];
        const duplicatedItem = { ...originalItem };
        
        // Insert the duplicated item right after the original
        section.items.splice(itemIndex + 1, 0, duplicatedItem);
        
        this.renderMenu();
        this.markAsChanged();
        this.saveCurrentMenu();
    }
    
    // === SUCCESS MODAL FUNCTIONALITY ===
    
    showSuccessModal(title, message, url = null) {
        const modal = document.getElementById('success-modal');
        const titleElement = document.getElementById('success-title');
        const messageElement = document.getElementById('success-message');
        const urlSection = document.getElementById('success-url-section');
        const urlDisplay = document.getElementById('success-url-display');
        const viewLiveBtn = document.getElementById('view-live-menu-from-success');
        
        titleElement.textContent = title;
        messageElement.textContent = message;
        
        if (url) {
            urlDisplay.textContent = url;
            urlSection.style.display = 'block';
            viewLiveBtn.style.display = 'inline-flex';
            viewLiveBtn.onclick = () => window.open(url, '_blank');
        } else {
            urlSection.style.display = 'none';
            viewLiveBtn.style.display = 'none';
        }
        
        modal.style.display = 'block';
    }
    
    closeSuccessModal() {
        const modal = document.getElementById('success-modal');
        modal.style.display = 'none';
    }
    
    copySuccessUrl() {
        const urlText = document.getElementById('success-url-display').textContent;
        navigator.clipboard.writeText(urlText).then(() => {
            const button = document.getElementById('copy-success-url');
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                button.innerHTML = originalText;
            }, 2000);
        });
    }
    
    // === DARK MODE FUNCTIONALITY ===
    
    initializeDarkMode() {
        // Apply dark mode if enabled
        if (this.darkMode) {
            document.body.classList.add('dark-mode');
        }
        
        // Set checkbox state
        const checkbox = document.getElementById('dark-mode-checkbox');
        if (checkbox) {
            checkbox.checked = this.darkMode;
        }
    }
    
    toggleDarkMode() {
        this.darkMode = !this.darkMode;
        
        // Apply/remove dark mode class
        if (this.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        // Save preference
        localStorage.setItem('darkMode', this.darkMode.toString());
        
        // Update checkbox
        const checkbox = document.getElementById('dark-mode-checkbox');
        if (checkbox) {
            checkbox.checked = this.darkMode;
        }
    }
    
}

const menuEditor = new MenuEditor();

// === AUTHENTICATION INTEGRATION ===

// Initialize authentication manager and editor when page loads  
document.addEventListener('DOMContentLoaded', function() {
    // Initialize auth manager
    if (!window.authManager) {
        window.authManager = new AuthManager();
    }
    
    // Initialize editor auth integration
    setTimeout(() => {
        menuEditor.initializeAuth();
    }, 100); // Small delay to ensure auth manager is ready
});

// Add authentication methods to MenuEditor prototype
MenuEditor.prototype.initializeAuth = function() {
    // Listen for auth state changes
    document.addEventListener('authStateChanged', (event) => {
        this.handleAuthChange(event.detail.user);
    });
    
    // Check if user is already authenticated
    if (window.authManager && window.authManager.getCurrentUser()) {
        this.handleAuthChange(window.authManager.getCurrentUser());
    }
    
    // Setup sign out handler
    const signOutItem = document.getElementById('sign-out-item');
    if (signOutItem) {
        signOutItem.addEventListener('click', () => {
            this.handleSignOut();
        });
    }
};

MenuEditor.prototype.handleAuthChange = function(user) {
    this.currentUser = user;
    
    if (user) {
        // User is signed in
        this.updateUserInterface(user);
        this.loadUserData();
    } else {
        // User is signed out - redirect to landing page
        window.location.href = 'landing.html';
    }
};

MenuEditor.prototype.updateUserInterface = function(user) {
    // Update user info in sidebar
    const userNameElement = document.getElementById('user-name');
    const userEmailElement = document.getElementById('user-email');
    
    if (userNameElement) {
        userNameElement.textContent = user.name || 'User';
    }
    
    if (userEmailElement) {
        userEmailElement.textContent = user.email || '';
    }
    
    // Update user avatar if Google user with photo
    const userAvatar = document.querySelector('.user-avatar');
    if (user.photoURL && userAvatar) {
        userAvatar.innerHTML = `<img src="${user.photoURL}" alt="Profile" style="width: 100%; height: 100%; border-radius: 50%;">`;
    }
    
    // Load user's menus in sidebar
    this.loadUserMenus();
};

MenuEditor.prototype.loadUserData = function() {
    if (!this.currentUser) return;
    
    const userMenus = window.authManager.getUserMenus();
    
    if (userMenus.length > 0) {
        // Load the first menu or last edited menu
        const lastMenu = userMenus.find(menu => menu.lastEdited) || userMenus[0];
        this.loadMenu(lastMenu);
        this.currentMenuId = lastMenu.id;
        this.updateCurrentMenuDisplay(lastMenu.name);
    } else {
        // Create a new empty menu for the user
        this.createNewMenu();
    }
};

MenuEditor.prototype.saveToStorage = function() {
    if (!this.currentUser || !this.currentMenuId) return;
    
    const menu = {
        id: this.currentMenuId,
        name: document.getElementById('current-menu-name').textContent || 'Untitled Menu',
        sections: this.sections,
        settings: {
            backgroundType: this.backgroundType,
            backgroundValue: this.backgroundValue,
            fontFamily: this.fontFamily,
            colorPalette: this.colorPalette,
            logoUrl: this.menuLogo
        },
        lastEdited: Date.now(),
        status: this.publishedSlug ? 'published' : 'draft',
        publishedMenuId: this.publishedMenuId,
        publishedSlug: this.publishedSlug,
        publishedTitle: this.publishedTitle,
        publishedSubtitle: this.publishedSubtitle
    };
    
    window.authManager.saveUserMenu(menu);
    this.hasUnsavedChanges = false;
    this.updateChangeIndicator();
    this.loadUserMenus(); // Refresh menu list
};

MenuEditor.prototype.markAsChanged = function() {
    this.hasUnsavedChanges = true;
    this.updateChangeIndicator();
    
    // Auto-save after 2 seconds of no changes
    if (this.autoSaveTimeout) {
        clearTimeout(this.autoSaveTimeout);
    }
    this.autoSaveTimeout = setTimeout(() => {
        this.saveToStorage();
    }, 2000);
};

MenuEditor.prototype.loadMenu = function(menu) {
    if (!menu) return;
    
    console.log('Loading menu:', menu.name, 'Published data:', {
        publishedSlug: menu.publishedSlug,
        publishedTitle: menu.publishedTitle,
        status: menu.status
    });
    
    // Load menu data
    this.sections = menu.sections || [];
    this.currentMenuId = menu.id;
    this.hasUnsavedChanges = false;
    
    // Load published data
    this.publishedMenuId = menu.publishedMenuId || null;
    this.publishedSlug = menu.publishedSlug || null;
    this.publishedTitle = menu.publishedTitle || null;
    this.publishedSubtitle = menu.publishedSubtitle || null;
    
    // Fix any duplicate section IDs (data corruption fix)
    const sectionIds = this.sections.map(s => s.id);
    const hasDuplicateIds = sectionIds.length !== new Set(sectionIds).size;
    
    if (hasDuplicateIds) {
        console.log('Detected duplicate section IDs, reassigning...');
        this.sections.forEach((section, index) => {
            section.id = index + 1;
            console.log('Reassigned section', section.name, 'to ID:', section.id);
        });
    }
    
    // Ensure proper section counter - find highest existing ID
    this.sectionCounter = this.sections.length > 0 ? 
        Math.max(...this.sections.map(s => s.id || 0)) : 0;
    
    console.log('Loaded menu with', this.sections.length, 'sections, sectionCounter set to:', this.sectionCounter);
    
    // Load settings
    const settings = menu.settings || {};
    this.backgroundType = settings.backgroundType || 'none';
    this.backgroundValue = settings.backgroundValue || null;
    this.fontFamily = settings.fontFamily || 'Inter';
    this.colorPalette = settings.colorPalette || 'classic';
    this.navigationTheme = settings.navigationTheme || 'modern';
    this.menuLogo = settings.logoUrl || null;
    
    // Apply loaded settings
    this.applyBackground();
    this.applyFontFamily();
    this.applyColorPalette();
    this.applyNavigationTheme();
    
    if (this.menuLogo) {
        // Logo already loaded, just update display
        this.updateLogoDisplay();
    } else {
        // No logo, update display to show "Add Logo"
        this.updateLogoDisplay();
    }
    
    // Re-render the menu with loaded data
    this.renderMenu();
    
    // Update UI indicators
    this.updateChangeIndicator();
    this.updatePublishButtonVisibility();
};

// === MENU CUSTOMIZATION METHODS ===

MenuEditor.prototype.selectBackgroundImage = function(imagePath) {
    this.backgroundType = 'image';
    this.backgroundValue = imagePath;
    this.applyBackground();
    this.markAsChanged();
};

MenuEditor.prototype.selectBackgroundColor = function(color) {
    this.backgroundType = 'color';
    this.backgroundValue = color;
    this.applyBackground();
    this.markAsChanged();
};

MenuEditor.prototype.removeBackground = function() {
    this.backgroundType = 'none';
    this.backgroundValue = null;
    this.applyBackground();
    this.markAsChanged();
};

MenuEditor.prototype.selectFontFamily = function(fontFamily) {
    this.fontFamily = fontFamily;
    this.applyFontFamily();
    this.markAsChanged();
};

MenuEditor.prototype.selectColorPalette = function(palette) {
    this.colorPalette = palette;
    this.applyColorPalette();
    this.markAsChanged();
};

MenuEditor.prototype.applyBackground = function() {
    // Apply background to all preview containers
    const previewContainers = document.querySelectorAll(
        '.preview-menu-container, .published-menu-container, #side-preview-content, #preview-content, .smartphone-content'
    );
    
    console.log('Found preview containers:', previewContainers.length);
    console.log('Background settings:', { type: this.backgroundType, value: this.backgroundValue });
    
    previewContainers.forEach((container, index) => {
        console.log(`Applying to container ${index}:`, container.className || container.id);
        
        if (this.backgroundType === 'image' && this.backgroundValue) {
            container.style.backgroundImage = `url('${this.backgroundValue}')`;
            // Mobile-friendly background sizing
            if (container.closest('#preview-modal')) {
                container.style.backgroundSize = 'contain'; // Scale entire image to fit phone screen
                container.style.backgroundPosition = 'top center';
                container.style.backgroundAttachment = 'local';
            } else if (container.closest('.side-preview-panel')) {
                container.style.backgroundSize = 'cover';
                container.style.backgroundPosition = 'center center';
                container.style.backgroundAttachment = 'scroll';
            } else {
                container.style.backgroundSize = 'cover';
                container.style.backgroundPosition = 'center';
            }
            container.style.backgroundRepeat = 'no-repeat';
            container.style.backgroundColor = '';
        } else if (this.backgroundType === 'color' && this.backgroundValue) {
            container.style.backgroundImage = '';
            container.style.backgroundColor = this.backgroundValue;
        } else {
            container.style.backgroundImage = '';
            container.style.backgroundColor = '';
        }
    });
    
    // Apply to modal elements specifically - ONLY preview-content
    const modalTargets = [
        '#preview-modal #preview-content'  // Only apply to this element
    ];
    
    modalTargets.forEach((selector, index) => {
        const element = document.querySelector(selector);
        if (element) {
            console.log(`Found modal target ${index} (${selector}):`, element);
            if (this.backgroundType === 'image' && this.backgroundValue) {
                element.style.backgroundImage = `url('${this.backgroundValue}')`;
                // Mobile viewport behavior - set image width to phone screen dimensions
                if (selector.includes('preview-modal')) {
                    element.style.backgroundSize = 'contain'; // Scale entire image to fit phone screen
                    element.style.backgroundPosition = 'top center';
                    element.style.backgroundAttachment = 'local'; // Scrolls with content
                } else {
                    element.style.backgroundSize = 'cover';
                    element.style.backgroundPosition = 'center center';
                    element.style.backgroundAttachment = 'scroll';
                }
                element.style.backgroundRepeat = 'no-repeat';
                element.style.backgroundColor = '';
                console.log(`Applied mobile background to ${selector}:`, this.backgroundValue);
            } else if (this.backgroundType === 'color' && this.backgroundValue) {
                element.style.backgroundImage = '';
                element.style.backgroundColor = this.backgroundValue;
                console.log(`Applied background color to ${selector}:`, this.backgroundValue);
            } else {
                element.style.backgroundImage = '';
                element.style.backgroundColor = '';
                console.log(`Cleared background from ${selector}`);
            }
        } else {
            console.log(`Modal target not found: ${selector}`);
        }
    });
};

MenuEditor.prototype.applyFontFamily = function() {
    // Get font stack based on selected family
    const fontStacks = {
        'Inter': "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        'Playfair Display': "'Playfair Display', Georgia, 'Times New Roman', serif",
        'Georgia': "Georgia, 'Times New Roman', Times, serif",
        'Lato': "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        'Montserrat': "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    };
    
    const fontStack = fontStacks[this.fontFamily] || fontStacks['Inter'];
    
    // Apply to all preview containers
    const previewContainers = document.querySelectorAll(
        '.preview-menu-container, .published-menu-container, #side-preview-content, #preview-content, .smartphone-content'
    );
    
    previewContainers.forEach(container => {
        container.style.fontFamily = fontStack;
    });
};

MenuEditor.prototype.applyColorPalette = function() {
    const palette = this.colorPalettes[this.colorPalette];
    if (!palette) return;
    
    // Apply colors to all preview containers
    const previewContainers = document.querySelectorAll(
        '.preview-menu-container, .published-menu-container, #side-preview-content, #preview-content, .smartphone-content'
    );
    
    previewContainers.forEach(container => {
        this.applyColorsToContainer(container, palette);
    });
};

MenuEditor.prototype.applyColorsToContainer = function(container, palette) {
    // Apply colors using CSS custom properties for easy override
    container.style.setProperty('--primary-text-color', palette.primaryText);
    container.style.setProperty('--secondary-text-color', palette.secondaryText);
    container.style.setProperty('--header-color', palette.headers);
    container.style.setProperty('--accent-color', palette.accent);
    container.style.setProperty('--background-color', palette.background);
    container.style.setProperty('--muted-color', palette.muted);
    
    // Apply to common elements
    const headers = container.querySelectorAll('h1, h2, h3, h4, h5, h6, .menu-section-title');
    headers.forEach(h => h.style.color = palette.headers);
    
    const prices = container.querySelectorAll('.price, .item-price');
    prices.forEach(p => p.style.color = palette.accent);
    
    const descriptions = container.querySelectorAll('.description, .item-description');
    descriptions.forEach(d => d.style.color = palette.secondaryText);
};

MenuEditor.prototype.loadUserMenus = function() {
    if (!this.currentUser) return;
    
    const menusList = document.getElementById('menus-list');
    if (!menusList) return;
    
    const userMenus = window.authManager.getUserMenus();
    
    menusList.innerHTML = '';
    
    if (userMenus.length === 0) {
        menusList.innerHTML = '<div class="no-menus">No menus yet. Create your first menu!</div>';
    }
    
    userMenus.forEach(menu => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
            <div class="menu-info" style="cursor: pointer; flex-grow: 1;">
                <div class="menu-name">${menu.name}</div>
                <div class="menu-meta">
                    <span class="menu-status">${menu.status || 'draft'}</span>
                    <span class="menu-date">${new Date(menu.lastEdited || menu.created).toLocaleDateString()}</span>
                </div>
            </div>
            <div class="menu-actions">
                <button class="btn-small" onclick="menuEditor.duplicateMenu('${menu.id}')" title="Duplicate">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="btn-small btn-danger" onclick="menuEditor.deleteMenu('${menu.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add click handler for menu info area
        const menuInfo = menuItem.querySelector('.menu-info');
        menuInfo.addEventListener('click', () => {
            this.loadMenuById(menu.id);
        });
        
        if (menu.id === this.currentMenuId) {
            menuItem.classList.add('active');
        }
        
        menusList.appendChild(menuItem);
    });
    
    // Add "Add New Menu" button at the bottom
    const addMenuBtn = document.createElement('div');
    addMenuBtn.className = 'add-menu-item';
    addMenuBtn.innerHTML = `
        <div class="add-menu-content" onclick="menuEditor.createNewMenu()">
            <i class="fas fa-plus"></i>
            <span>Add New Menu</span>
        </div>
    `;
    menusList.appendChild(addMenuBtn);
};

MenuEditor.prototype.handleSignOut = function() {
    if (this.hasUnsavedChanges) {
        if (!confirm('You have unsaved changes. Are you sure you want to sign out?')) {
            return;
        }
    }
    
    window.authManager.signOut();
};

MenuEditor.prototype.updateCurrentMenuDisplay = function(menuName) {
    const currentMenuNameElement = document.getElementById('current-menu-name');
    if (currentMenuNameElement) {
        currentMenuNameElement.textContent = menuName || 'Untitled Menu';
    }
};

MenuEditor.prototype.updatePublishButtonVisibility = function() {
    const publishButton = document.getElementById('publish-menu');
    const viewPublishedButton = document.getElementById('view-published-menu');
    
    if (!this.currentUser) {
        if (publishButton) publishButton.style.display = 'none';
        if (viewPublishedButton) viewPublishedButton.style.display = 'none';
        return;
    }
    
    if (publishButton) publishButton.style.display = 'block';
    
    // Show view published button if menu is published
    if (viewPublishedButton && this.publishedSlug) {
        viewPublishedButton.style.display = 'block';
    } else if (viewPublishedButton) {
        viewPublishedButton.style.display = 'none';
    }
};

MenuEditor.prototype.updateChangeIndicator = function() {
    const changeIndicator = document.getElementById('change-indicator');
    if (!changeIndicator) return;
    
    if (this.hasUnsavedChanges) {
        changeIndicator.innerHTML = '<i class="fas fa-circle" style="color: #e74c3c;"></i> Unsaved';
        changeIndicator.style.color = '#e74c3c';
    } else {
        changeIndicator.innerHTML = '<i class="fas fa-circle" style="color: #27ae60;"></i> Saved';
        changeIndicator.style.color = '#27ae60';
    }
};

MenuEditor.prototype.loadMenuById = function(menuId) {
    if (!this.currentUser) return;
    
    const userMenus = window.authManager.getUserMenus();
    const menu = userMenus.find(m => m.id === menuId);
    
    if (menu) {
        this.loadMenu(menu);
        this.currentMenuId = menuId;
        this.updateCurrentMenuDisplay(menu.name);
        this.loadUserMenus(); // Refresh to update active state
        this.updatePublishButtonVisibility();
    }
};

MenuEditor.prototype.createNewMenu = function() {
    if (!this.currentUser) return;
    
    const menuName = prompt('What would you like to name your new menu?', `${this.currentUser.restaurant || 'My Restaurant'} Menu`);
    
    if (!menuName || menuName.trim() === '') {
        return; // User cancelled or entered empty name
    }
    
    const newMenuId = 'menu_' + Date.now();
    const newMenu = {
        id: newMenuId,
        name: menuName.trim(),
        sections: [],
        settings: {
            backgroundType: 'none',
            backgroundValue: null,
            fontFamily: 'Inter',
            colorPalette: 'classic',
            logoUrl: null
        },
        created: Date.now(),
        lastEdited: Date.now(),
        status: 'draft'
    };
    
    // Reset editor state
    this.sections = [];
    this.currentMenuId = newMenuId;
    this.backgroundType = 'none';
    this.backgroundValue = null;
    this.fontFamily = 'Inter';
    this.colorPalette = 'classic';
    this.menuLogo = null;
    this.hasUnsavedChanges = false;
    
    // Update UI
    this.updateCurrentMenuDisplay(newMenu.name);
    this.renderMenu();
    this.saveToStorage();
    this.loadUserMenus();
    this.updatePublishButtonVisibility();
};

MenuEditor.prototype.duplicateMenu = function(menuId) {
    if (!this.currentUser) return;
    
    const userMenus = window.authManager.getUserMenus();
    const originalMenu = userMenus.find(m => m.id === menuId);
    
    if (originalMenu) {
        const newMenuId = 'menu_' + Date.now();
        const duplicatedMenu = {
            ...originalMenu,
            id: newMenuId,
            name: originalMenu.name + ' (Copy)',
            created: Date.now(),
            lastEdited: Date.now(),
            status: 'draft'
        };
        
        window.authManager.saveUserMenu(duplicatedMenu);
        this.loadUserMenus();
    }
};

MenuEditor.prototype.deleteMenu = function(menuId) {
    if (!this.currentUser) return;
    
    if (confirm('Are you sure you want to delete this menu? This action cannot be undone.')) {
        window.authManager.deleteUserMenu(menuId);
        
        // If we deleted the current menu, load another or create new
        if (menuId === this.currentMenuId) {
            const remainingMenus = window.authManager.getUserMenus();
            if (remainingMenus.length > 0) {
                this.loadMenuById(remainingMenus[0].id);
            } else {
                this.createNewMenu();
            }
        }
        
        this.loadUserMenus();
    }
};

// === EVENT LISTENERS ===

// Logo functionality event listeners
document.addEventListener('DOMContentLoaded', function() {
    
    // Save menu button
    const saveMenuBtn = document.getElementById('save-menu');
    if (saveMenuBtn) {
        saveMenuBtn.addEventListener('click', () => {
            menuEditor.saveToStorage();
        });
    }
    // Logo upload button
    const uploadLogoBtn = document.getElementById('upload-logo');
    if (uploadLogoBtn) {
        uploadLogoBtn.addEventListener('click', () => {
            menuEditor.triggerLogoUpload();
        });
    }
    
    // Logo file input
    const logoFileInput = document.getElementById('logo-file-input');
    if (logoFileInput) {
        logoFileInput.addEventListener('change', (event) => {
            menuEditor.handleLogoUpload(event);
        });
    }
    
    // Remove logo button
    const removeLogoBtn = document.getElementById('remove-logo');
    if (removeLogoBtn) {
        removeLogoBtn.addEventListener('click', () => {
            menuEditor.removeLogo();
        });
    }

    // Background functionality event listeners
    const backgroundBtn = document.getElementById('background-options');
    if (backgroundBtn) {
        backgroundBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            menuEditor.toggleBackgroundDropdown();
        });
    }
    
    // Background image options
    const backgroundOptions = document.querySelectorAll('.background-option');
    backgroundOptions.forEach(option => {
        option.addEventListener('click', () => {
            const type = option.dataset.type;
            const value = option.dataset.value;
            
            if (type === 'image') {
                menuEditor.selectBackgroundImage(value);
            } else if (type === 'none') {
                menuEditor.removeBackground();
            }
        });
    });
    
    // Color background button
    const useColorBtn = document.getElementById('use-color-background');
    if (useColorBtn) {
        useColorBtn.addEventListener('click', () => {
            const colorInput = document.getElementById('background-color-picker');
            if (colorInput) {
                menuEditor.selectBackgroundColor(colorInput.value);
            }
        });
    }
    
    // Background upload functionality
    const uploadBtn = document.getElementById('upload-background-btn');
    const uploadInput = document.getElementById('background-upload');
    const useUploadedBtn = document.getElementById('use-uploaded-background');
    
    if (uploadBtn && uploadInput) {
        uploadBtn.addEventListener('click', () => {
            uploadInput.click();
        });
        
        uploadInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                menuEditor.handleBackgroundUpload(e.target.files[0]);
            }
        });
    }
    
    if (useUploadedBtn) {
        useUploadedBtn.addEventListener('click', () => {
            menuEditor.applyUploadedBackground();
        });
    }
    
    // Font functionality event listeners
    const fontBtn = document.getElementById('font-options');
    if (fontBtn) {
        fontBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            menuEditor.toggleFontDropdown();
        });
    }
    
    // Font option selection
    document.querySelectorAll('.font-option').forEach(option => {
        option.addEventListener('click', () => {
            const fontFamily = option.dataset.font;
            menuEditor.selectFontFamily(fontFamily);
        });
    });

    // Color palette functionality event listeners
    const colorBtn = document.getElementById('color-options');
    if (colorBtn) {
        colorBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            menuEditor.toggleColorDropdown();
        });
    }
    
    // Color palette option selection
    document.querySelectorAll('.palette-option').forEach(option => {
        option.addEventListener('click', () => {
            const palette = option.dataset.palette;
            menuEditor.selectColorPalette(palette);
        });
    });

    // Navigation functionality event listeners
    const navigationBtn = document.getElementById('navigation-options');
    if (navigationBtn) {
        navigationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            menuEditor.toggleNavigationDropdown();
        });
    }

    // Navigation theme option selection
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;
            menuEditor.selectNavigationTheme(theme);
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        const backgroundControls = document.querySelector('.background-controls');
        const fontControls = document.querySelector('.font-controls');
        const colorControls = document.querySelector('.color-controls');
        const navigationControls = document.querySelector('.navigation-controls');
        
        // Close background dropdown
        if (backgroundControls && !backgroundControls.contains(e.target)) {
            const dropdown = document.getElementById('background-dropdown');
            if (dropdown && dropdown.style.display !== 'none') {
                menuEditor.backgroundDropdownOpen = false;
                dropdown.style.display = 'none';
                document.getElementById('background-options').classList.remove('active');
            }
        }
        
        // Close font dropdown
        if (fontControls && !fontControls.contains(e.target)) {
            const dropdown = document.getElementById('font-dropdown');
            if (dropdown && dropdown.style.display !== 'none') {
                menuEditor.fontDropdownOpen = false;
                dropdown.style.display = 'none';
                document.getElementById('font-options').classList.remove('active');
            }
        }
        
        // Close color dropdown
        if (colorControls && !colorControls.contains(e.target)) {
            const dropdown = document.getElementById('color-dropdown');
            if (dropdown && dropdown.style.display !== 'none') {
                menuEditor.colorDropdownOpen = false;
                dropdown.style.display = 'none';
                document.getElementById('color-options').classList.remove('active');
            }
        }
        
        // Close navigation dropdown
        if (navigationControls && !navigationControls.contains(e.target)) {
            const dropdown = document.getElementById('navigation-dropdown');
            if (dropdown && dropdown.style.display !== 'none') {
                menuEditor.navigationDropdownOpen = false;
                dropdown.style.display = 'none';
                document.getElementById('navigation-options').classList.remove('active');
            }
        }
    });

    // Discard functionality event listeners
    // Discard changes button
    const discardButton = document.getElementById('discard-changes');
    if (discardButton) {
        discardButton.addEventListener('click', () => {
            menuEditor.openDiscardModal();
        });
    }

    // Discard modal buttons
    const revertToSavedBtn = document.getElementById('revert-to-saved');
    const revertToPublishedBtn = document.getElementById('revert-to-published');
    const cancelDiscardBtn = document.getElementById('cancel-discard');
    
    if (revertToSavedBtn) {
        revertToSavedBtn.addEventListener('click', () => {
            menuEditor.revertToSaved();
        });
    }
    
    if (revertToPublishedBtn) {
        revertToPublishedBtn.addEventListener('click', () => {
            menuEditor.revertToPublished();
        });
    }
    
    if (cancelDiscardBtn) {
        cancelDiscardBtn.addEventListener('click', () => {
            menuEditor.closeDiscardModal();
        });
    }
    
    // Close modal when clicking the X or outside the modal
    const discardModal = document.getElementById('discard-modal');
    if (discardModal) {
        const closeBtn = discardModal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                menuEditor.closeDiscardModal();
            });
        }
        
        // Close when clicking outside the modal
        discardModal.addEventListener('click', (e) => {
            if (e.target === discardModal) {
                menuEditor.closeDiscardModal();
            }
        });
    }
    
    // Add Column Modal event listeners
    const addColumnModal = document.getElementById('add-column-modal');
    if (addColumnModal) {
        // Close button
        const closeBtn = addColumnModal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                menuEditor.closeAddColumnModal();
            });
        }
        
        // Cancel button
        const cancelBtn = document.getElementById('cancel-add-column');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                menuEditor.closeAddColumnModal();
            });
        }
        
        // Close when clicking outside modal
        addColumnModal.addEventListener('click', (e) => {
            if (e.target === addColumnModal) {
                menuEditor.closeAddColumnModal();
            }
        });
    }
    
    // Preset column options
    document.querySelectorAll('.preset-column-option').forEach(option => {
        option.addEventListener('click', () => {
            const columnName = option.dataset.column;
            menuEditor.addPresetColumn(columnName);
        });
    });
    
    // Custom column button
    const addCustomColumnBtn = document.getElementById('add-custom-column-btn');
    if (addCustomColumnBtn) {
        addCustomColumnBtn.addEventListener('click', () => {
            menuEditor.addCustomColumn();
        });
    }
    
    // Custom column input enter key
    const customColumnInput = document.getElementById('custom-column-name');
    if (customColumnInput) {
        customColumnInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                menuEditor.addCustomColumn();
            }
        });
    }
    
    // Success Modal event listeners
    const successModal = document.getElementById('success-modal');
    if (successModal) {
        // Close button
        const closeBtn = successModal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                menuEditor.closeSuccessModal();
            });
        }
        
        // "Got it" button
        const gotItBtn = document.getElementById('close-success-modal');
        if (gotItBtn) {
            gotItBtn.addEventListener('click', () => {
                menuEditor.closeSuccessModal();
            });
        }
        
        // Copy URL button
        const copyBtn = document.getElementById('copy-success-url');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                menuEditor.copySuccessUrl();
            });
        }
        
        // Close when clicking outside modal
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) {
                menuEditor.closeSuccessModal();
            }
        });
    }

    // Dark mode toggle event listener
    const darkModeCheckbox = document.getElementById('dark-mode-checkbox');
    if (darkModeCheckbox) {
        darkModeCheckbox.addEventListener('change', function() {
            menuEditor.toggleDarkMode();
        });
    }
});

// Dark mode toggle event listener (moved to main DOMContentLoaded section above)