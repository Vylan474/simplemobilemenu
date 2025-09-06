/**
 * Bulk Operations System for MyMobileMenu Editor
 * Handles bulk editing, import/export, and batch operations for menu items
 */

class BulkOperations {
    constructor(menuEditor) {
        this.menuEditor = menuEditor;
        this.selectedItems = new Set();
        this.isSelectionMode = false;
        this.clipboardData = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.createBulkActionToolbar();
    }
    
    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'a':
                        if (this.isSelectionMode) {
                            e.preventDefault();
                            this.selectAll();
                        }
                        break;
                    case 'c':
                        if (this.selectedItems.size > 0) {
                            e.preventDefault();
                            this.copySelected();
                        }
                        break;
                    case 'v':
                        if (this.clipboardData && this.isSelectionMode) {
                            e.preventDefault();
                            this.pasteItems();
                        }
                        break;
                    case 'Delete':
                    case 'Backspace':
                        if (this.selectedItems.size > 0) {
                            e.preventDefault();
                            this.deleteSelected();
                        }
                        break;
                }
            }
            
            if (e.key === 'Escape') {
                this.exitSelectionMode();
            }
        });
        
        // Right-click context menu
        document.addEventListener('contextmenu', (e) => {
            const menuItem = e.target.closest('.menu-item');
            if (menuItem && this.isSelectionMode) {
                e.preventDefault();
                this.showContextMenu(e, menuItem);
            }
        });
    }
    
    createBulkActionToolbar() {
        const toolbar = document.createElement('div');
        toolbar.id = 'bulk-actions-toolbar';
        toolbar.className = 'bulk-actions-toolbar hidden';
        toolbar.innerHTML = `
            <div class=\"bulk-actions-content\">
                <div class=\"bulk-selection-info\">
                    <span class=\"selection-count\">0 items selected</span>
                    <button class=\"select-all-btn\" title=\"Select all items\">
                        <i class=\"fas fa-check-double\"></i> Select All
                    </button>
                </div>
                
                <div class=\"bulk-action-buttons\">
                    <button class=\"bulk-btn copy-btn\" title=\"Copy selected items\">
                        <i class=\"fas fa-copy\"></i> Copy
                    </button>
                    <button class=\"bulk-btn paste-btn\" title=\"Paste items\" disabled>
                        <i class=\"fas fa-paste\"></i> Paste
                    </button>
                    <button class=\"bulk-btn duplicate-btn\" title=\"Duplicate selected items\">
                        <i class=\"fas fa-clone\"></i> Duplicate
                    </button>
                    <button class=\"bulk-btn edit-btn\" title=\"Bulk edit selected items\">
                        <i class=\"fas fa-edit\"></i> Edit
                    </button>
                    <button class=\"bulk-btn move-btn\" title=\"Move to different section\">
                        <i class=\"fas fa-arrows-alt\"></i> Move
                    </button>
                    <button class=\"bulk-btn delete-btn\" title=\"Delete selected items\">
                        <i class=\"fas fa-trash\"></i> Delete
                    </button>
                </div>
                
                <button class=\"exit-selection-btn\" title=\"Exit selection mode\">
                    <i class=\"fas fa-times\"></i> Exit
                </button>
            </div>
        `;
        
        document.body.appendChild(toolbar);
        
        // Add event listeners for bulk actions
        this.setupBulkActionListeners(toolbar);
    }
    
    setupBulkActionListeners(toolbar) {
        toolbar.querySelector('.select-all-btn').addEventListener('click', () => this.selectAll());
        toolbar.querySelector('.copy-btn').addEventListener('click', () => this.copySelected());
        toolbar.querySelector('.paste-btn').addEventListener('click', () => this.pasteItems());
        toolbar.querySelector('.duplicate-btn').addEventListener('click', () => this.duplicateSelected());
        toolbar.querySelector('.edit-btn').addEventListener('click', () => this.showBulkEditModal());
        toolbar.querySelector('.move-btn').addEventListener('click', () => this.showMoveModal());
        toolbar.querySelector('.delete-btn').addEventListener('click', () => this.deleteSelected());
        toolbar.querySelector('.exit-selection-btn').addEventListener('click', () => this.exitSelectionMode());
    }
    
    // =============================================
    // SELECTION MANAGEMENT
    // =============================================
    
    enterSelectionMode() {
        this.isSelectionMode = true;
        document.body.classList.add('selection-mode');
        
        // Show bulk actions toolbar
        const toolbar = document.getElementById('bulk-actions-toolbar');
        if (toolbar) {
            toolbar.classList.remove('hidden');
        }
        
        // Add selection checkboxes to menu items
        this.addSelectionCheckboxes();
        
        // Show notification
        if (window.uiFeedback) {
            window.uiFeedback.showInfo('Selection Mode', 'Click items to select them, or use the toolbar for bulk actions.');
        }
    }
    
    exitSelectionMode() {
        this.isSelectionMode = false;
        this.selectedItems.clear();
        document.body.classList.remove('selection-mode');
        
        // Hide bulk actions toolbar
        const toolbar = document.getElementById('bulk-actions-toolbar');
        if (toolbar) {
            toolbar.classList.add('hidden');
        }
        
        // Remove selection checkboxes
        this.removeSelectionCheckboxes();
        
        this.updateBulkActionToolbar();
    }
    
    addSelectionCheckboxes() {
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            if (!item.querySelector('.selection-checkbox')) {
                const checkbox = document.createElement('div');
                checkbox.className = 'selection-checkbox';
                checkbox.innerHTML = '<i class=\"far fa-square\"></i>';
                checkbox.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleItemSelection(item);
                });
                
                item.insertBefore(checkbox, item.firstChild);
                item.addEventListener('click', () => this.toggleItemSelection(item));
            }
        });
    }
    
    removeSelectionCheckboxes() {
        const checkboxes = document.querySelectorAll('.selection-checkbox');
        checkboxes.forEach(checkbox => checkbox.remove());
        
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.classList.remove('selected');
            item.removeEventListener('click', () => this.toggleItemSelection(item));
        });
    }
    
    toggleItemSelection(item) {
        const itemId = item.dataset.itemId || item.id;
        
        if (this.selectedItems.has(itemId)) {
            this.selectedItems.delete(itemId);
            item.classList.remove('selected');
            item.querySelector('.selection-checkbox i').className = 'far fa-square';
        } else {
            this.selectedItems.add(itemId);
            item.classList.add('selected');
            item.querySelector('.selection-checkbox i').className = 'fas fa-check-square';
        }
        
        this.updateBulkActionToolbar();
    }
    
    selectAll() {
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            const itemId = item.dataset.itemId || item.id;
            this.selectedItems.add(itemId);
            item.classList.add('selected');
            const checkbox = item.querySelector('.selection-checkbox i');
            if (checkbox) {
                checkbox.className = 'fas fa-check-square';
            }
        });
        
        this.updateBulkActionToolbar();
    }
    
    updateBulkActionToolbar() {
        const toolbar = document.getElementById('bulk-actions-toolbar');
        if (!toolbar) return;
        
        const count = this.selectedItems.size;
        const countElement = toolbar.querySelector('.selection-count');
        const pasteBtn = toolbar.querySelector('.paste-btn');
        const actionButtons = toolbar.querySelectorAll('.bulk-btn:not(.paste-btn)');
        
        countElement.textContent = `${count} item${count !== 1 ? 's' : ''} selected`;
        
        // Enable/disable action buttons based on selection
        actionButtons.forEach(btn => {
            btn.disabled = count === 0;
        });
        
        // Enable paste button if clipboard has data
        pasteBtn.disabled = !this.clipboardData;
    }
    
    // =============================================
    // BULK OPERATIONS
    // =============================================
    
    copySelected() {
        if (this.selectedItems.size === 0) return;
        
        const itemsData = [];
        this.selectedItems.forEach(itemId => {
            const item = document.querySelector(`[data-item-id=\"${itemId}\"], #${itemId}`);
            if (item) {
                const itemData = this.extractItemData(item);
                if (itemData) {
                    itemsData.push(itemData);
                }
            }
        });
        
        this.clipboardData = {
            items: itemsData,
            timestamp: Date.now()
        };
        
        this.updateBulkActionToolbar();
        
        if (window.uiFeedback) {
            window.uiFeedback.showSuccess('Copied', `${itemsData.length} items copied to clipboard`);
        }
    }
    
    pasteItems() {
        if (!this.clipboardData) return;
        
        // For now, paste to the first section or create a new section
        let targetSection = document.querySelector('.section');
        
        if (!targetSection) {
            // Create a new section if none exists
            targetSection = this.menuEditor.createSection('Pasted Items', 'food');
        }
        
        const sectionId = targetSection.dataset.sectionId || targetSection.id;
        let pastedCount = 0;
        
        this.clipboardData.items.forEach(itemData => {
            try {
                this.menuEditor.addItemToSection(sectionId, itemData);
                pastedCount++;
            } catch (error) {
                console.error('Error pasting item:', error);
            }
        });
        
        if (window.uiFeedback) {
            window.uiFeedback.showSuccess('Pasted', `${pastedCount} items pasted successfully`);
        }
        
        this.menuEditor.markAsChanged();
    }
    
    duplicateSelected() {
        if (this.selectedItems.size === 0) return;
        
        let duplicatedCount = 0;
        const itemsToAdd = [];
        
        this.selectedItems.forEach(itemId => {
            const item = document.querySelector(`[data-item-id=\"${itemId}\"], #${itemId}`);
            if (item) {
                const itemData = this.extractItemData(item);
                if (itemData) {
                    // Modify item name to indicate it's a duplicate
                    if (itemData['Item Name']) {
                        itemData['Item Name'] += ' (Copy)';
                    }
                    itemsToAdd.push({ item, data: itemData });
                }
            }
        });
        
        // Add duplicated items to their respective sections
        itemsToAdd.forEach(({ item, data }) => {
            const section = item.closest('.section');
            if (section) {
                const sectionId = section.dataset.sectionId || section.id;
                try {
                    this.menuEditor.addItemToSection(sectionId, data);
                    duplicatedCount++;
                } catch (error) {
                    console.error('Error duplicating item:', error);
                }
            }
        });
        
        if (window.uiFeedback) {
            window.uiFeedback.showSuccess('Duplicated', `${duplicatedCount} items duplicated successfully`);
        }
        
        this.menuEditor.markAsChanged();
    }
    
    deleteSelected() {
        if (this.selectedItems.size === 0) return;
        
        const count = this.selectedItems.size;
        
        if (window.uiFeedback && window.confirm) {
            const confirmed = confirm(`Are you sure you want to delete ${count} selected item${count !== 1 ? 's' : ''}?`);
            if (!confirmed) return;
        }
        
        let deletedCount = 0;
        const itemsToDelete = Array.from(this.selectedItems);
        
        itemsToDelete.forEach(itemId => {
            const item = document.querySelector(`[data-item-id=\"${itemId}\"], #${itemId}`);
            if (item) {
                try {
                    // Use the menu editor's delete function if available
                    if (this.menuEditor.removeMenuItem) {
                        this.menuEditor.removeMenuItem(item);
                    } else {
                        item.remove();
                    }
                    deletedCount++;
                } catch (error) {
                    console.error('Error deleting item:', error);
                }
            }
        });
        
        this.selectedItems.clear();
        this.updateBulkActionToolbar();
        
        if (window.uiFeedback) {
            window.uiFeedback.showSuccess('Deleted', `${deletedCount} items deleted successfully`);
        }
        
        this.menuEditor.markAsChanged();
    }
    
    // =============================================
    // BULK EDITING MODAL
    // =============================================
    
    showBulkEditModal() {
        if (this.selectedItems.size === 0) return;
        
        // Create or show bulk edit modal
        let modal = document.getElementById('bulk-edit-modal');
        if (!modal) {
            modal = this.createBulkEditModal();
            document.body.appendChild(modal);
        }
        
        this.populateBulkEditModal(modal);
        modal.style.display = 'flex';
    }
    
    createBulkEditModal() {
        const modal = document.createElement('div');
        modal.id = 'bulk-edit-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class=\"modal-content\">
                <div class=\"modal-header\">
                    <h2><i class=\"fas fa-edit\"></i> Bulk Edit Items</h2>
                    <span class=\"close\">&times;</span>
                </div>
                <div class=\"modal-body\">
                    <p class=\"bulk-edit-description\">
                        Edit multiple items at once. Leave fields empty to keep existing values.
                    </p>
                    
                    <div class=\"bulk-edit-form\">
                        <div class=\"form-group\">
                            <label>Add to Price:</label>
                            <div class=\"price-adjustment\">
                                <select id=\"price-operation\">
                                    <option value=\"add\">Add ($)</option>
                                    <option value=\"subtract\">Subtract ($)</option>
                                    <option value=\"multiply\">Multiply by</option>
                                    <option value=\"set\">Set to ($)</option>
                                </select>
                                <input type=\"number\" id=\"price-value\" step=\"0.01\" placeholder=\"0.00\">
                            </div>
                        </div>
                        
                        <div class=\"form-group\">
                            <label>Append to Description:</label>
                            <textarea id=\"description-append\" placeholder=\"Text to add to all descriptions\" rows=\"2\"></textarea>
                        </div>
                        
                        <div class=\"form-group\">
                            <label>Add Category/Tag:</label>
                            <input type=\"text\" id=\"category-add\" placeholder=\"e.g., Vegetarian, Spicy, New\">
                        </div>
                        
                        <div class=\"form-group\">
                            <label>Replace Text:</label>
                            <div class=\"replace-text\">
                                <input type=\"text\" id=\"replace-from\" placeholder=\"Find text\">
                                <input type=\"text\" id=\"replace-to\" placeholder=\"Replace with\">
                            </div>
                        </div>
                    </div>
                </div>
                <div class=\"modal-actions\">
                    <button id=\"apply-bulk-edit\" class=\"btn btn-primary\">
                        <i class=\"fas fa-check\"></i> Apply Changes
                    </button>
                    <button id=\"cancel-bulk-edit\" class=\"btn btn-secondary\">Cancel</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        modal.querySelector('.close').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        modal.querySelector('#cancel-bulk-edit').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        modal.querySelector('#apply-bulk-edit').addEventListener('click', () => {
            this.applyBulkEdit();
            modal.style.display = 'none';
        });
        
        return modal;
    }
    
    populateBulkEditModal(modal) {
        const description = modal.querySelector('.bulk-edit-description');
        description.textContent = `Edit ${this.selectedItems.size} selected items. Leave fields empty to keep existing values.`;
    }
    
    applyBulkEdit() {
        const modal = document.getElementById('bulk-edit-modal');
        if (!modal) return;
        
        const priceOperation = modal.querySelector('#price-operation').value;
        const priceValue = parseFloat(modal.querySelector('#price-value').value) || 0;
        const descriptionAppend = modal.querySelector('#description-append').value.trim();
        const categoryAdd = modal.querySelector('#category-add').value.trim();
        const replaceFrom = modal.querySelector('#replace-from').value.trim();
        const replaceTo = modal.querySelector('#replace-to').value.trim();
        
        let changedCount = 0;
        
        this.selectedItems.forEach(itemId => {
            const item = document.querySelector(`[data-item-id=\"${itemId}\"], #${itemId}`);
            if (!item) return;
            
            let changed = false;
            
            // Price operations
            if (priceValue !== 0) {
                const priceInput = item.querySelector('[data-column=\"Price\"], .price-input, input[placeholder*=\"price\" i]');
                if (priceInput) {
                    const currentPrice = parseFloat(priceInput.value.replace(/[^0-9.]/g, '')) || 0;
                    let newPrice = currentPrice;
                    
                    switch (priceOperation) {
                        case 'add':
                            newPrice = currentPrice + priceValue;
                            break;
                        case 'subtract':
                            newPrice = Math.max(0, currentPrice - priceValue);
                            break;
                        case 'multiply':
                            newPrice = currentPrice * priceValue;
                            break;
                        case 'set':
                            newPrice = priceValue;
                            break;
                    }
                    
                    priceInput.value = `$${newPrice.toFixed(2)}`;
                    changed = true;
                }
            }
            
            // Description append
            if (descriptionAppend) {
                const descInput = item.querySelector('[data-column=\"Description\"], .description-input, textarea');
                if (descInput) {
                    const currentDesc = descInput.value.trim();
                    descInput.value = currentDesc ? `${currentDesc}. ${descriptionAppend}` : descriptionAppend;
                    changed = true;
                }
            }
            
            // Category/Tag add
            if (categoryAdd) {
                const categoryInput = item.querySelector('[data-column=\"Category\"], .category-input');
                if (categoryInput) {
                    const currentCategory = categoryInput.value.trim();
                    categoryInput.value = currentCategory ? `${currentCategory}, ${categoryAdd}` : categoryAdd;
                    changed = true;
                }
            }
            
            // Text replacement
            if (replaceFrom && replaceTo) {
                const inputs = item.querySelectorAll('input, textarea');
                inputs.forEach(input => {
                    if (input.value.includes(replaceFrom)) {
                        input.value = input.value.replace(new RegExp(replaceFrom, 'g'), replaceTo);
                        changed = true;
                    }
                });
            }
            
            if (changed) {
                changedCount++;
                
                // Trigger change event
                const event = new Event('change', { bubbles: true });
                item.dispatchEvent(event);
            }
        });
        
        if (window.uiFeedback) {
            window.uiFeedback.showSuccess('Bulk Edit Applied', `${changedCount} items updated successfully`);
        }
        
        this.menuEditor.markAsChanged();
    }
    
    // =============================================
    // MOVE OPERATIONS
    // =============================================
    
    showMoveModal() {
        if (this.selectedItems.size === 0) return;
        
        const sections = document.querySelectorAll('.section');
        if (sections.length <= 1) {
            if (window.uiFeedback) {
                window.uiFeedback.showWarning('Cannot Move', 'You need at least 2 sections to move items between them.');
            }
            return;
        }
        
        // Create move modal
        let modal = document.getElementById('move-items-modal');
        if (!modal) {
            modal = this.createMoveModal();
            document.body.appendChild(modal);
        }
        
        this.populateMoveModal(modal);
        modal.style.display = 'flex';
    }
    
    createMoveModal() {
        const modal = document.createElement('div');
        modal.id = 'move-items-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class=\"modal-content\">
                <div class=\"modal-header\">
                    <h2><i class=\"fas fa-arrows-alt\"></i> Move Items</h2>
                    <span class=\"close\">&times;</span>
                </div>
                <div class=\"modal-body\">
                    <p class=\"move-description\">Select the section to move selected items to:</p>
                    
                    <div class=\"section-list\" id=\"move-section-list\">
                        <!-- Sections will be populated here -->
                    </div>
                </div>
                <div class=\"modal-actions\">
                    <button id=\"confirm-move\" class=\"btn btn-primary\" disabled>
                        <i class=\"fas fa-check\"></i> Move Items
                    </button>
                    <button id=\"cancel-move\" class=\"btn btn-secondary\">Cancel</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        modal.querySelector('.close').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        modal.querySelector('#cancel-move').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        modal.querySelector('#confirm-move').addEventListener('click', () => {
            this.performMove();
            modal.style.display = 'none';
        });
        
        return modal;
    }
    
    populateMoveModal(modal) {
        const description = modal.querySelector('.move-description');
        description.textContent = `Select the section to move ${this.selectedItems.size} selected items to:`;
        
        const sectionList = modal.querySelector('#move-section-list');
        const sections = document.querySelectorAll('.section');
        
        sectionList.innerHTML = '';
        
        sections.forEach(section => {
            const sectionTitle = section.querySelector('.section-title')?.textContent || 'Untitled Section';
            const sectionId = section.dataset.sectionId || section.id;
            
            const sectionOption = document.createElement('div');
            sectionOption.className = 'section-option';
            sectionOption.dataset.sectionId = sectionId;
            sectionOption.innerHTML = `
                <div class=\"section-option-content\">
                    <i class=\"fas fa-list\"></i>
                    <span class=\"section-name\">${sectionTitle}</span>
                    <span class=\"item-count\">(${section.querySelectorAll('.menu-item').length} items)</span>
                </div>
            `;
            
            sectionOption.addEventListener('click', () => {
                sectionList.querySelectorAll('.section-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                sectionOption.classList.add('selected');
                modal.querySelector('#confirm-move').disabled = false;
            });
            
            sectionList.appendChild(sectionOption);
        });
    }
    
    performMove() {
        const modal = document.getElementById('move-items-modal');
        const selectedSection = modal.querySelector('.section-option.selected');
        
        if (!selectedSection) return;
        
        const targetSectionId = selectedSection.dataset.sectionId;
        let movedCount = 0;
        
        // Move selected items to target section
        this.selectedItems.forEach(itemId => {
            const item = document.querySelector(`[data-item-id=\"${itemId}\"], #${itemId}`);
            if (item) {
                try {
                    // Extract item data
                    const itemData = this.extractItemData(item);
                    
                    // Remove from current section
                    item.remove();
                    
                    // Add to target section
                    this.menuEditor.addItemToSection(targetSectionId, itemData);
                    movedCount++;
                } catch (error) {
                    console.error('Error moving item:', error);
                }
            }
        });
        
        this.selectedItems.clear();
        this.updateBulkActionToolbar();
        
        if (window.uiFeedback) {
            window.uiFeedback.showSuccess('Items Moved', `${movedCount} items moved successfully`);
        }
        
        this.menuEditor.markAsChanged();
    }
    
    // =============================================
    // UTILITY METHODS
    // =============================================
    
    extractItemData(item) {
        const itemData = {};
        
        // Extract data from inputs within the item
        const inputs = item.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            const column = input.dataset.column || input.getAttribute('placeholder') || input.name;
            if (column && input.value) {
                itemData[column] = input.value;
            }
        });
        
        // If no data found, try to extract from text content or data attributes
        if (Object.keys(itemData).length === 0) {
            const nameElement = item.querySelector('.item-name, .menu-item-name');
            const priceElement = item.querySelector('.item-price, .menu-item-price');
            const descElement = item.querySelector('.item-description, .menu-item-description');
            
            if (nameElement) itemData['Item Name'] = nameElement.textContent.trim();
            if (priceElement) itemData['Price'] = priceElement.textContent.trim();
            if (descElement) itemData['Description'] = descElement.textContent.trim();
        }
        
        return Object.keys(itemData).length > 0 ? itemData : null;
    }
    
    showContextMenu(event, item) {
        // Create context menu for right-click operations
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.innerHTML = `
            <div class=\"context-menu-item\" data-action=\"copy\">
                <i class=\"fas fa-copy\"></i> Copy
            </div>
            <div class=\"context-menu-item\" data-action=\"duplicate\">
                <i class=\"fas fa-clone\"></i> Duplicate
            </div>
            <div class=\"context-menu-item\" data-action=\"delete\">
                <i class=\"fas fa-trash\"></i> Delete
            </div>
        `;
        
        contextMenu.style.position = 'fixed';
        contextMenu.style.left = `${event.clientX}px`;
        contextMenu.style.top = `${event.clientY}px`;
        contextMenu.style.zIndex = '10002';
        
        document.body.appendChild(contextMenu);
        
        // Handle context menu clicks
        contextMenu.addEventListener('click', (e) => {
            const action = e.target.closest('.context-menu-item')?.dataset.action;
            if (action) {
                this.handleContextMenuAction(action, item);
            }
            contextMenu.remove();
        });
        
        // Remove context menu when clicking elsewhere
        setTimeout(() => {
            document.addEventListener('click', () => contextMenu.remove(), { once: true });
        }, 100);
    }
    
    handleContextMenuAction(action, item) {
        const itemId = item.dataset.itemId || item.id;
        
        switch (action) {
            case 'copy':
                this.selectedItems.clear();
                this.selectedItems.add(itemId);
                this.copySelected();
                break;
            case 'duplicate':
                this.selectedItems.clear();
                this.selectedItems.add(itemId);
                this.duplicateSelected();
                break;
            case 'delete':
                this.selectedItems.clear();
                this.selectedItems.add(itemId);
                this.deleteSelected();
                break;
        }
    }
    
    // =============================================
    // PUBLIC API
    // =============================================
    
    toggleSelectionMode() {
        if (this.isSelectionMode) {
            this.exitSelectionMode();
        } else {
            this.enterSelectionMode();
        }
    }
    
    hasSelectedItems() {
        return this.selectedItems.size > 0;
    }
    
    getSelectedCount() {
        return this.selectedItems.size;
    }
    
    clearSelection() {
        this.selectedItems.clear();
        this.updateBulkActionToolbar();
        
        const items = document.querySelectorAll('.menu-item.selected');
        items.forEach(item => {
            item.classList.remove('selected');
            const checkbox = item.querySelector('.selection-checkbox i');
            if (checkbox) {
                checkbox.className = 'far fa-square';
            }
        });
    }
}

// Initialize when ready
window.addEventListener('load', () => {
    const checkMenuEditor = () => {
        if (window.menuEditor) {
            window.bulkOperations = new BulkOperations(window.menuEditor);
            
            // Add bulk operations button to toolbar
            const toolbar = document.querySelector('.toolbar .primary-actions');
            if (toolbar) {
                const bulkBtn = document.createElement('button');
                bulkBtn.id = 'toggle-bulk-mode';
                bulkBtn.className = 'btn btn-secondary';
                bulkBtn.title = 'Enter bulk selection mode';
                bulkBtn.innerHTML = '<i class="fas fa-check-square"></i> Bulk Edit';
                
                bulkBtn.addEventListener('click', () => {
                    window.bulkOperations.toggleSelectionMode();
                });
                
                toolbar.appendChild(bulkBtn);
            }
        } else {
            setTimeout(checkMenuEditor, 100);
        }
    };
    
    setTimeout(checkMenuEditor, 1000);
});

// Add styles for bulk operations
const bulkOperationsStyles = `
.bulk-actions-toolbar {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(30, 40, 55, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    padding: 16px 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    z-index: 9999;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.bulk-actions-toolbar.hidden {
    opacity: 0;
    transform: translateX(-50%) translateY(100%);
    pointer-events: none;
}

.bulk-actions-content {
    display: flex;
    align-items: center;
    gap: 24px;
    flex-wrap: wrap;
}

.bulk-selection-info {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #F5F7FA;
    font-size: 14px;
}

.selection-count {
    font-weight: 600;
}

.select-all-btn {
    background: rgba(255, 76, 41, 0.2);
    border: 1px solid rgba(255, 76, 41, 0.3);
    color: #FF4C29;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.select-all-btn:hover {
    background: rgba(255, 76, 41, 0.3);
}

.bulk-action-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.bulk-btn {
    background: rgba(245, 247, 250, 0.1);
    border: 1px solid rgba(245, 247, 250, 0.2);
    color: #F5F7FA;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 6px;
}

.bulk-btn:hover:not(:disabled) {
    background: rgba(245, 247, 250, 0.2);
    transform: translateY(-1px);
}

.bulk-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.bulk-btn.delete-btn {
    background: rgba(231, 76, 60, 0.2);
    border-color: rgba(231, 76, 60, 0.3);
    color: #e74c3c;
}

.bulk-btn.delete-btn:hover:not(:disabled) {
    background: rgba(231, 76, 60, 0.3);
}

.exit-selection-btn {
    background: rgba(231, 76, 60, 0.2);
    border: 1px solid rgba(231, 76, 60, 0.3);
    color: #e74c3c;
    border-radius: 8px;
    padding: 8px 12px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.exit-selection-btn:hover {
    background: rgba(231, 76, 60, 0.3);
}

.selection-mode .menu-item {
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease;
}

.selection-mode .menu-item:hover {
    background: rgba(255, 76, 41, 0.1);
}

.selection-mode .menu-item.selected {
    background: rgba(255, 76, 41, 0.15);
    border-color: #FF4C29;
}

.selection-checkbox {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 10;
}

.selection-checkbox:hover {
    background: rgba(255, 255, 255, 1);
    transform: scale(1.1);
}

.selection-checkbox i {
    font-size: 14px;
    color: #2c3e50;
}

.menu-item.selected .selection-checkbox {
    background: #FF4C29;
}

.menu-item.selected .selection-checkbox i {
    color: white;
}

.context-menu {
    background: rgba(30, 40, 55, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 8px 0;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    min-width: 150px;
}

.context-menu-item {
    padding: 8px 16px;
    color: #F5F7FA;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    transition: all 0.2s ease;
}

.context-menu-item:hover {
    background: rgba(255, 76, 41, 0.2);
}

.section-option {
    padding: 12px 16px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 8px;
}

.section-option:hover {
    border-color: rgba(255, 76, 41, 0.5);
    background: rgba(255, 76, 41, 0.1);
}

.section-option.selected {
    border-color: #FF4C29;
    background: rgba(255, 76, 41, 0.2);
}

.section-option-content {
    display: flex;
    align-items: center;
    gap: 12px;
}

.section-name {
    font-weight: 500;
    color: #F5F7FA;
}

.item-count {
    color: rgba(245, 247, 250, 0.7);
    font-size: 13px;
}

.bulk-edit-form .form-group {
    margin-bottom: 20px;
}

.price-adjustment {
    display: flex;
    gap: 8px;
}

.price-adjustment select {
    flex: 1;
}

.price-adjustment input {
    flex: 2;
}

.replace-text {
    display: flex;
    gap: 8px;
}

.replace-text input {
    flex: 1;
}

@media (max-width: 768px) {
    .bulk-actions-toolbar {
        left: 10px;
        right: 10px;
        transform: none;
        padding: 12px 16px;
    }
    
    .bulk-actions-content {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
    }
    
    .bulk-action-buttons {
        justify-content: center;
    }
    
    .bulk-btn {
        flex: 1;
        justify-content: center;
        min-width: 0;
    }
}
`;

// Add styles to document
if (!document.querySelector('#bulk-operations-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'bulk-operations-styles';
    styleElement.textContent = bulkOperationsStyles;
    document.head.appendChild(styleElement);
}