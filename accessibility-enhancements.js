/**
 * Accessibility Enhancements for MyMobileMenu Editor
 * Implements WCAG 2.1 AA compliance and screen reader support
 */

class AccessibilityEnhancements {
    constructor() {
        this.focusTrapElements = [];
        this.lastFocusedElement = null;
        this.announcementRegion = null;
        
        this.init();
    }
    
    init() {
        this.createAriaLiveRegion();
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.enhanceFormLabels();
        this.setupScreenReaderSupport();
        this.addLandmarkRoles();
        this.setupHighContrastSupport();
    }
    
    // =============================================
    // ARIA LIVE REGIONS & ANNOUNCEMENTS
    // =============================================
    
    createAriaLiveRegion() {
        this.announcementRegion = document.createElement('div');
        this.announcementRegion.id = 'sr-announcements';
        this.announcementRegion.setAttribute('aria-live', 'polite');
        this.announcementRegion.setAttribute('aria-atomic', 'true');
        this.announcementRegion.className = 'sr-only';
        document.body.appendChild(this.announcementRegion);
    }
    
    announce(message, priority = 'polite') {
        if (!this.announcementRegion) return;
        
        this.announcementRegion.setAttribute('aria-live', priority);
        this.announcementRegion.textContent = message;
        
        // Clear after announcing
        setTimeout(() => {
            this.announcementRegion.textContent = '';
        }, 1000);
    }
    
    // =============================================
    // KEYBOARD NAVIGATION
    // =============================================
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeyDown(e);
        });
        
        // Add keyboard shortcuts help
        this.addKeyboardShortcutsHelp();
        
        // Enhance tab navigation
        this.enhanceTabNavigation();
    }
    
    handleGlobalKeyDown(e) {
        // Skip to content (accessible bypass)
        if (e.altKey && e.key === 'c') {
            e.preventDefault();
            const mainContent = document.getElementById('menu-container');
            if (mainContent) {
                mainContent.focus();
                this.announce('Jumped to main content');
            }
        }
        
        // Help dialog
        if (e.key === 'F1' || (e.altKey && e.key === 'h')) {
            e.preventDefault();
            this.showKeyboardHelp();
        }
        
        // Focus sidebar
        if (e.altKey && e.key === 'm') {
            e.preventDefault();
            const sidebar = document.getElementById('toggle-sidebar');
            if (sidebar) {
                sidebar.click();
                this.announce('Menu sidebar opened');
            }
        }
        
        // Focus toolbar
        if (e.altKey && e.key === 't') {
            e.preventDefault();
            const toolbar = document.querySelector('.toolbar');
            const firstButton = toolbar?.querySelector('.btn');
            if (firstButton) {
                firstButton.focus();
                this.announce('Toolbar focused');
            }
        }
    }
    
    enhanceTabNavigation() {
        // Ensure all interactive elements are keyboard accessible
        const interactiveElements = document.querySelectorAll('button, input, select, textarea, a, [tabindex]');
        
        interactiveElements.forEach(element => {
            // Add keyboard support for custom interactive elements
            if (!element.hasAttribute('tabindex') && element.tagName !== 'INPUT' && element.tagName !== 'SELECT' && element.tagName !== 'TEXTAREA' && element.tagName !== 'A') {
                element.setAttribute('tabindex', '0');
            }
            
            // Add Enter key support for buttons
            if (element.classList.contains('btn') || element.role === 'button') {
                element.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        element.click();
                    }
                });
            }
        });
    }
    
    addKeyboardShortcutsHelp() {
        const helpButton = document.createElement('button');
        helpButton.id = 'keyboard-help-btn';
        helpButton.className = 'btn btn-secondary';
        helpButton.innerHTML = '<i class="fas fa-keyboard"></i>';
        helpButton.title = 'Keyboard shortcuts (F1)';
        helpButton.setAttribute('aria-label', 'Show keyboard shortcuts help');
        helpButton.addEventListener('click', () => this.showKeyboardHelp());
        
        // Add to header controls
        const headerControls = document.querySelector('.header-controls');
        if (headerControls) {
            headerControls.appendChild(helpButton);
        }
    }
    
    showKeyboardHelp() {
        // Create or show keyboard help modal
        let modal = document.getElementById('keyboard-help-modal');
        if (!modal) {
            modal = this.createKeyboardHelpModal();
            document.body.appendChild(modal);
        }
        
        modal.style.display = 'flex';
        this.trapFocus(modal);
        this.announce('Keyboard shortcuts help opened');
    }
    
    createKeyboardHelpModal() {
        const modal = document.createElement('div');
        modal.id = 'keyboard-help-modal';
        modal.className = 'modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'keyboard-help-title');
        modal.setAttribute('aria-modal', 'true');
        
        modal.innerHTML = `
            <div class=\"modal-content\">
                <div class=\"modal-header\">
                    <h2 id=\"keyboard-help-title\">
                        <i class=\"fas fa-keyboard\"></i> Keyboard Shortcuts
                    </h2>
                    <button class=\"close\" aria-label=\"Close keyboard shortcuts help\">&times;</button>
                </div>
                <div class=\"modal-body\">
                    <div class=\"shortcuts-grid\">
                        <div class=\"shortcut-category\">
                            <h3>Navigation</h3>
                            <div class=\"shortcut-item\">
                                <kbd>Alt + C</kbd>
                                <span>Jump to main content</span>
                            </div>
                            <div class=\"shortcut-item\">
                                <kbd>Alt + M</kbd>
                                <span>Open/close sidebar menu</span>
                            </div>
                            <div class=\"shortcut-item\">
                                <kbd>Alt + T</kbd>
                                <span>Focus toolbar</span>
                            </div>
                            <div class=\"shortcut-item\">
                                <kbd>F1</kbd>
                                <span>Show this help dialog</span>
                            </div>
                        </div>
                        
                        <div class=\"shortcut-category\">
                            <h3>Editing</h3>
                            <div class=\"shortcut-item\">
                                <kbd>Ctrl + S</kbd>
                                <span>Save menu</span>
                            </div>
                            <div class=\"shortcut-item\">
                                <kbd>Ctrl + Z</kbd>
                                <span>Undo last action</span>
                            </div>
                            <div class=\"shortcut-item\">
                                <kbd>Ctrl + A</kbd>
                                <span>Select all (in bulk mode)</span>
                            </div>
                            <div class=\"shortcut-item\">
                                <kbd>Delete</kbd>
                                <span>Delete selected items</span>
                            </div>
                        </div>
                        
                        <div class=\"shortcut-category\">
                            <h3>Bulk Operations</h3>
                            <div class=\"shortcut-item\">
                                <kbd>Ctrl + C</kbd>
                                <span>Copy selected items</span>
                            </div>
                            <div class=\"shortcut-item\">
                                <kbd>Ctrl + V</kbd>
                                <span>Paste items</span>
                            </div>
                            <div class=\"shortcut-item\">
                                <kbd>Escape</kbd>
                                <span>Exit selection mode</span>
                            </div>
                        </div>
                        
                        <div class=\"shortcut-category\">
                            <h3>General</h3>
                            <div class=\"shortcut-item\">
                                <kbd>Tab</kbd>
                                <span>Navigate between elements</span>
                            </div>
                            <div class=\"shortcut-item\">
                                <kbd>Enter / Space</kbd>
                                <span>Activate buttons</span>
                            </div>
                            <div class=\"shortcut-item\">
                                <kbd>Escape</kbd>
                                <span>Close dialogs/dropdowns</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class=\"modal-actions\">
                    <button id=\"close-keyboard-help\" class=\"btn btn-primary\" autofocus>
                        Got it
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners
        modal.querySelector('.close').addEventListener('click', () => {
            this.closeKeyboardHelp();
        });
        
        modal.querySelector('#close-keyboard-help').addEventListener('click', () => {
            this.closeKeyboardHelp();
        });
        
        // Close on escape
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeKeyboardHelp();
            }
        });
        
        return modal;
    }
    
    closeKeyboardHelp() {
        const modal = document.getElementById('keyboard-help-modal');
        if (modal) {
            modal.style.display = 'none';
            this.releaseFocus(modal);
            this.announce('Keyboard shortcuts help closed');
        }
    }
    
    // =============================================
    // FOCUS MANAGEMENT
    // =============================================
    
    setupFocusManagement() {
        // Enhance modal focus management
        this.setupModalFocusManagement();
        
        // Add focus visible indicators
        this.addFocusVisibleSupport();
        
        // Manage focus on dynamic content
        this.setupDynamicFocusManagement();
    }
    
    setupModalFocusManagement() {
        // Monitor when modals open/close
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const modal = mutation.target;
                    if (modal.classList.contains('modal')) {
                        if (modal.style.display === 'flex' || modal.style.display === 'block') {
                            this.trapFocus(modal);
                        } else if (modal.style.display === 'none') {
                            this.releaseFocus(modal);
                        }
                    }
                }
            });
        });
        
        document.querySelectorAll('.modal').forEach(modal => {
            observer.observe(modal, { attributes: true, attributeFilter: ['style'] });
        });
    }
    
    trapFocus(element) {
        this.lastFocusedElement = document.activeElement;
        
        const focusableElements = this.getFocusableElements(element);
        if (focusableElements.length === 0) return;
        
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        // Focus first element
        firstFocusable.focus();
        
        // Handle tab trapping
        const handleTabKey = (e) => {
            if (e.key !== 'Tab') return;
            
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        };
        
        element.addEventListener('keydown', handleTabKey);
        this.focusTrapElements.push({ element, handler: handleTabKey });
    }
    
    releaseFocus(element) {
        // Remove event listener
        const trapIndex = this.focusTrapElements.findIndex(trap => trap.element === element);
        if (trapIndex !== -1) {
            const trap = this.focusTrapElements[trapIndex];
            element.removeEventListener('keydown', trap.handler);
            this.focusTrapElements.splice(trapIndex, 1);
        }
        
        // Return focus to last focused element
        if (this.lastFocusedElement) {
            this.lastFocusedElement.focus();
            this.lastFocusedElement = null;
        }
    }
    
    getFocusableElements(container) {
        const focusableSelectors = [
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'a[href]',
            '[tabindex]:not([tabindex=\"-1\"])',
            '[contenteditable=\"true\"]'
        ];
        
        return Array.from(container.querySelectorAll(focusableSelectors.join(', ')))
            .filter(el => this.isVisible(el));
    }
    
    isVisible(element) {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               element.offsetParent !== null;
    }
    
    addFocusVisibleSupport() {
        // Add support for :focus-visible polyfill if needed
        let isUsingKeyboard = false;
        
        document.addEventListener('keydown', () => {
            isUsingKeyboard = true;
        });
        
        document.addEventListener('mousedown', () => {
            isUsingKeyboard = false;
        });
        
        document.addEventListener('focusin', (e) => {
            if (isUsingKeyboard) {
                e.target.classList.add('focus-visible');
            }
        });
        
        document.addEventListener('focusout', (e) => {
            e.target.classList.remove('focus-visible');
        });
    }
    
    setupDynamicFocusManagement() {
        // Manage focus when content is added dynamically
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.enhanceNewContent(node);
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    enhanceNewContent(element) {
        // Add proper labels and ARIA attributes to new form elements
        const inputs = element.querySelectorAll('input, select, textarea');
        inputs.forEach(input => this.enhanceFormField(input));
        
        // Add keyboard support to new interactive elements
        const buttons = element.querySelectorAll('.btn, [role=\"button\"]');
        buttons.forEach(button => this.enhanceButton(button));
    }
    
    // =============================================
    // FORM ACCESSIBILITY
    // =============================================
    
    enhanceFormLabels() {
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => this.enhanceFormField(input));
    }
    
    enhanceFormField(input) {
        // Ensure proper labeling
        if (!input.hasAttribute('aria-label') && !input.hasAttribute('aria-labelledby')) {
            const label = this.findLabelForInput(input);
            if (label) {
                const labelId = label.id || `label-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                label.id = labelId;
                input.setAttribute('aria-labelledby', labelId);
            } else {
                // Create label from placeholder or context
                const labelText = input.placeholder || input.dataset.column || input.name || 'Input field';
                input.setAttribute('aria-label', labelText);
            }
        }
        
        // Add required field indicators
        if (input.hasAttribute('required')) {
            input.setAttribute('aria-required', 'true');
        }
        
        // Add invalid state support
        input.addEventListener('invalid', () => {
            input.setAttribute('aria-invalid', 'true');
            input.setAttribute('aria-describedby', this.getOrCreateErrorMessage(input).id);
        });
        
        input.addEventListener('input', () => {
            if (input.hasAttribute('aria-invalid')) {
                input.removeAttribute('aria-invalid');
            }
        });
    }
    
    findLabelForInput(input) {
        // Try to find associated label
        if (input.id) {
            const label = document.querySelector(`label[for=\"${input.id}\"]`);
            if (label) return label;
        }
        
        // Try parent label
        const parentLabel = input.closest('label');
        if (parentLabel) return parentLabel;
        
        // Try preceding label
        const prevSibling = input.previousElementSibling;
        if (prevSibling && prevSibling.tagName === 'LABEL') {
            return prevSibling;
        }
        
        return null;
    }
    
    getOrCreateErrorMessage(input) {
        let errorId = `error-${input.id || Date.now()}`;
        let errorElement = document.getElementById(errorId);
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = errorId;
            errorElement.className = 'sr-only error-message';
            errorElement.setAttribute('aria-live', 'polite');
            input.parentNode.insertBefore(errorElement, input.nextSibling);
        }
        
        errorElement.textContent = input.validationMessage || 'This field is invalid';
        return errorElement;
    }
    
    enhanceButton(button) {
        // Ensure buttons have proper labels
        if (!button.hasAttribute('aria-label') && !button.textContent.trim()) {
            const icon = button.querySelector('i');
            if (icon) {
                const iconClass = icon.className;
                let label = 'Button';
                
                // Try to infer label from icon
                if (iconClass.includes('save')) label = 'Save';
                else if (iconClass.includes('delete') || iconClass.includes('trash')) label = 'Delete';
                else if (iconClass.includes('edit')) label = 'Edit';
                else if (iconClass.includes('add') || iconClass.includes('plus')) label = 'Add';
                else if (iconClass.includes('close') || iconClass.includes('times')) label = 'Close';
                
                button.setAttribute('aria-label', label);
            }
        }
        
        // Add role if missing
        if (button.tagName !== 'BUTTON' && !button.hasAttribute('role')) {
            button.setAttribute('role', 'button');
        }
    }
    
    // =============================================
    // SCREEN READER SUPPORT
    // =============================================
    
    setupScreenReaderSupport() {
        // Add live region updates for menu changes
        this.monitorMenuChanges();
        
        // Add progress announcements
        this.setupProgressAnnouncements();
        
        // Add status announcements
        this.setupStatusAnnouncements();
    }
    
    monitorMenuChanges() {
        const menuContainer = document.getElementById('menu-container');
        if (!menuContainer) return;
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.classList.contains('section')) {
                                const sectionName = node.querySelector('.section-title')?.textContent || 'New section';
                                this.announce(`Added section: ${sectionName}`);
                            } else if (node.classList.contains('menu-item')) {
                                this.announce('Added menu item');
                            }
                        }
                    });
                    
                    mutation.removedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.classList.contains('section')) {
                                this.announce('Removed section');
                            } else if (node.classList.contains('menu-item')) {
                                this.announce('Removed menu item');
                            }
                        }
                    });
                }
            });
        });
        
        observer.observe(menuContainer, { childList: true, subtree: true });
    }
    
    setupProgressAnnouncements() {
        // Monitor UI feedback for progress updates
        if (window.uiFeedback) {
            const originalShowToast = window.uiFeedback.showToast;
            window.uiFeedback.showToast = (...args) => {
                const [type, title, message] = args;
                this.announce(`${title}: ${message}`);
                return originalShowToast.apply(window.uiFeedback, args);
            };
        }
    }
    
    setupStatusAnnouncements() {
        // Monitor save status changes
        const saveIndicator = document.getElementById('change-indicator');
        if (saveIndicator) {
            const observer = new MutationObserver(() => {
                const status = saveIndicator.textContent;
                if (status.includes('Saving')) {
                    this.announce('Saving menu changes');
                } else if (status.includes('Saved')) {
                    this.announce('Menu changes saved successfully');
                } else if (status.includes('Error')) {
                    this.announce('Error saving menu changes', 'assertive');
                }
            });
            
            observer.observe(saveIndicator, { childList: true, subtree: true });
        }
    }
    
    // =============================================
    // LANDMARK ROLES & STRUCTURE
    // =============================================
    
    addLandmarkRoles() {
        // Add proper landmark roles
        const header = document.querySelector('.header');
        if (header) header.setAttribute('role', 'banner');
        
        const toolbar = document.querySelector('.toolbar');
        if (toolbar) toolbar.setAttribute('role', 'toolbar');
        
        const menuContainer = document.getElementById('menu-container');
        if (menuContainer) menuContainer.setAttribute('role', 'main');
        
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.setAttribute('role', 'navigation');
        
        // Add section roles
        document.querySelectorAll('.section').forEach(section => {
            section.setAttribute('role', 'region');
            const title = section.querySelector('.section-title');
            if (title) {
                const titleId = title.id || `section-title-${Date.now()}`;
                title.id = titleId;
                section.setAttribute('aria-labelledby', titleId);
            }
        });
    }
    
    // =============================================
    // HIGH CONTRAST & VISUAL ACCESSIBILITY
    // =============================================
    
    setupHighContrastSupport() {
        // Detect high contrast mode
        this.detectHighContrast();
        
        // Add reduced motion support
        this.setupReducedMotionSupport();
        
        // Enhance color contrast
        this.enhanceColorContrast();
    }
    
    detectHighContrast() {
        // Check for Windows high contrast mode
        const isHighContrast = window.matchMedia('(-ms-high-contrast: active)').matches;
        if (isHighContrast) {
            document.body.classList.add('high-contrast');
        }
        
        // Check for forced colors
        if (window.matchMedia('(forced-colors: active)').matches) {
            document.body.classList.add('forced-colors');
        }
    }
    
    setupReducedMotionSupport() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            document.body.classList.add('reduced-motion');
        }
    }
    
    enhanceColorContrast() {
        // Add high contrast theme option
        const highContrastToggle = document.createElement('div');
        highContrastToggle.className = 'setting-item';
        highContrastToggle.innerHTML = `
            <i class=\"fas fa-eye\"></i>
            <span>High Contrast</span>
            <div class=\"toggle-switch\">
                <input type=\"checkbox\" id=\"high-contrast-checkbox\">
                <label for=\"high-contrast-checkbox\" class=\"slider\"></label>
            </div>
        `;
        
        const settingsList = document.getElementById('settings-list');
        if (settingsList) {
            settingsList.appendChild(highContrastToggle);
            
            const checkbox = highContrastToggle.querySelector('#high-contrast-checkbox');
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    document.body.classList.add('high-contrast-theme');
                    this.announce('High contrast mode enabled');
                } else {
                    document.body.classList.remove('high-contrast-theme');
                    this.announce('High contrast mode disabled');
                }
                
                localStorage.setItem('highContrast', e.target.checked);
            });
            
            // Restore saved preference
            const savedHighContrast = localStorage.getItem('highContrast') === 'true';
            if (savedHighContrast) {
                checkbox.checked = true;
                document.body.classList.add('high-contrast-theme');
            }
        }
    }
}

// Initialize accessibility enhancements
window.addEventListener('load', () => {
    window.accessibilityEnhancements = new AccessibilityEnhancements();
});

// Add accessibility-specific CSS
const accessibilityStyles = `
.sr-only {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
}

.focus-visible {
    outline: 2px solid #FF4C29 !important;
    outline-offset: 2px !important;
}

.high-contrast-theme {
    filter: contrast(200%) saturate(150%);
}

.high-contrast .btn,
.high-contrast input,
.high-contrast select,
.high-contrast textarea {
    border: 2px solid !important;
}

.reduced-motion *,
.reduced-motion *::before,
.reduced-motion *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
}

.shortcuts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    margin: 20px 0;
}

.shortcut-category h3 {
    color: #FF4C29;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    border-bottom: 1px solid rgba(255, 76, 41, 0.3);
    padding-bottom: 4px;
}

.shortcut-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
    padding: 8px;
    border-radius: 6px;
    transition: background-color 0.2s ease;
}

.shortcut-item:hover {
    background: rgba(255, 76, 41, 0.1);
}

.shortcut-item kbd {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 12px;
    font-weight: 600;
    color: #FF4C29;
    min-width: 60px;
    text-align: center;
}

.shortcut-item span {
    color: rgba(245, 247, 250, 0.9);
    font-size: 14px;
}

.error-message {
    color: #e74c3c;
    font-size: 12px;
    margin-top: 4px;
}

/* High contrast theme overrides */
.high-contrast-theme .btn {
    border: 2px solid currentColor !important;
    background: transparent !important;
    color: inherit !important;
}

.high-contrast-theme .btn:hover {
    background: currentColor !important;
    color: var(--bg-color) !important;
}

.high-contrast-theme input,
.high-contrast-theme select,
.high-contrast-theme textarea {
    background: transparent !important;
    border: 2px solid currentColor !important;
    color: inherit !important;
}

.high-contrast-theme .modal-content,
.high-contrast-theme .dropdown {
    border: 3px solid currentColor !important;
    background: var(--bg-color) !important;
}

@media (max-width: 768px) {
    .shortcuts-grid {
        grid-template-columns: 1fr;
        gap: 16px;
    }
    
    .shortcut-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
    }
    
    .shortcut-item kbd {
        align-self: flex-start;
    }
}

@media (forced-colors: active) {
    .btn {
        border: 1px solid ButtonText !important;
    }
    
    .modal-content {
        border: 1px solid CanvasText !important;
    }
}
`;

if (!document.querySelector('#accessibility-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'accessibility-styles';
    styleElement.textContent = accessibilityStyles;
    document.head.appendChild(styleElement);
}