/**
 * UX Enhancements for MyMobileMenu Editor
 * Handles onboarding, templates, contextual tips, and user experience improvements
 */

class UXEnhancements {
    constructor(menuEditor) {
        this.menuEditor = menuEditor;
        this.currentStep = 1;
        this.maxStep = 3;
        this.selectedTemplate = null;
        this.selectedBackground = 'none';
        this.selectedPalette = 'classic';
        this.isFirstTime = localStorage.getItem('mmm_onboarding_completed') !== 'true';
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        
        // Show welcome modal for first-time users
        if (this.isFirstTime && !this.hasMenuSections()) {
            setTimeout(() => {
                this.showWelcomeModal();
            }, 500);
        }
        
        // Initialize empty state
        this.updateEmptyState();
        
        // Initialize contextual tips system
        this.initContextualTips();
    }
    
    setupEventListeners() {
        // Welcome modal controls
        document.getElementById('welcome-next')?.addEventListener('click', () => this.nextStep());
        document.getElementById('welcome-back')?.addEventListener('click', () => this.prevStep());
        document.getElementById('welcome-skip')?.addEventListener('click', () => this.skipOnboarding());
        document.getElementById('welcome-start')?.addEventListener('click', () => this.completeOnboarding());
        document.getElementById('show-welcome')?.addEventListener('click', () => this.showWelcomeModal());
        
        // Step indicators
        document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToStep(index + 1));
        });
        
        // Template selection
        document.querySelectorAll('.template-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectTemplate(e.currentTarget));
        });
        
        // Style selection
        document.querySelectorAll('.bg-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectBackground(e.currentTarget));
        });
        
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectColorPalette(e.currentTarget));
        });
        
        // Empty state actions
        document.getElementById('add-first-section')?.addEventListener('click', () => this.addFirstSection());
        document.getElementById('choose-template')?.addEventListener('click', () => this.showTemplateSelection());
        
        // Close welcome modal when clicking outside
        document.getElementById('welcome-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'welcome-modal') {
                this.skipOnboarding();
            }
        });
    }
    
    // =============================================
    // WELCOME MODAL & ONBOARDING
    // =============================================
    
    showWelcomeModal() {
        const modal = document.getElementById('welcome-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.currentStep = 1;
            this.showStep(1);
            this.updateStepIndicators();
            this.updateNavigationButtons();
        }
    }
    
    hideWelcomeModal() {
        const modal = document.getElementById('welcome-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    nextStep() {
        if (this.currentStep < this.maxStep) {
            this.currentStep++;
            this.showStep(this.currentStep);
            this.updateStepIndicators();
            this.updateNavigationButtons();
        }
    }
    
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
            this.updateStepIndicators();
            this.updateNavigationButtons();
        }
    }
    
    goToStep(stepNumber) {
        if (stepNumber >= 1 && stepNumber <= this.maxStep) {
            this.currentStep = stepNumber;
            this.showStep(this.currentStep);
            this.updateStepIndicators();
            this.updateNavigationButtons();
        }
    }
    
    showStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.welcome-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Show current step
        const currentStep = document.querySelector(`[data-step="${stepNumber}"]`);
        if (currentStep) {
            currentStep.classList.add('active');
        }
    }
    
    updateStepIndicators() {
        document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
            indicator.classList.toggle('active', index + 1 === this.currentStep);
        });
    }
    
    updateNavigationButtons() {
        const backBtn = document.getElementById('welcome-back');
        const nextBtn = document.getElementById('welcome-next');
        const startBtn = document.getElementById('welcome-start');
        
        if (backBtn) backBtn.style.display = this.currentStep === 1 ? 'none' : 'inline-flex';
        if (nextBtn) nextBtn.style.display = this.currentStep === this.maxStep ? 'none' : 'inline-flex';
        if (startBtn) startBtn.style.display = this.currentStep === this.maxStep ? 'inline-flex' : 'none';
    }
    
    skipOnboarding() {
        this.hideWelcomeModal();
        localStorage.setItem('mmm_onboarding_completed', 'true');
        this.isFirstTime = false;
    }
    
    completeOnboarding() {
        // Apply selected template if any
        if (this.selectedTemplate && this.selectedTemplate !== 'scratch') {
            this.applyTemplate(this.selectedTemplate);
        }
        
        // Apply style selections
        if (this.selectedBackground !== 'none') {
            this.applyBackgroundStyle(this.selectedBackground);
        }
        
        if (this.selectedPalette !== 'classic') {
            this.applyColorPalette(this.selectedPalette);
        }
        
        this.skipOnboarding();
        
        // Show first contextual tip after a delay
        setTimeout(() => {
            if (!this.hasMenuSections()) {
                this.showContextualTip('add-section', 'Get Started', 'Click here to add your first menu section!');
            }
        }, 1000);
    }
    
    // =============================================
    // TEMPLATE SYSTEM
    // =============================================
    
    selectTemplate(templateElement) {
        // Remove previous selections
        document.querySelectorAll('.template-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Select current template
        templateElement.classList.add('selected');
        this.selectedTemplate = templateElement.dataset.template;
        
        // Update style preview based on template
        this.updateStylePreview();
    }
    
    selectBackground(bgElement) {
        document.querySelectorAll('.bg-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        bgElement.classList.add('selected');
        this.selectedBackground = bgElement.dataset.bg;
        this.updateStylePreview();
    }
    
    selectColorPalette(colorElement) {
        document.querySelectorAll('.color-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        colorElement.classList.add('selected');
        this.selectedPalette = colorElement.dataset.palette;
        this.updateStylePreview();
    }
    
    updateStylePreview() {
        const previewScreen = document.getElementById('style-preview-screen');
        if (!previewScreen) return;
        
        // Update background
        switch (this.selectedBackground) {
            case 'warm':
                previewScreen.style.background = 'linear-gradient(45deg, #f4e4c1, #e8d5b7)';
                break;
            case 'elegant':
                previewScreen.style.background = 'linear-gradient(45deg, #2c3e50, #34495e)';
                break;
            default:
                previewScreen.style.background = '#ffffff';
        }
        
        // Update colors based on palette
        const items = previewScreen.querySelectorAll('.preview-item span:last-child');
        const palettes = {
            classic: '#27ae60',
            warm: '#e67e22',
            ocean: '#3498db'
        };
        
        items.forEach(item => {
            item.style.color = palettes[this.selectedPalette] || '#FF4C29';
        });
    }
    
    applyTemplate(templateType) {
        const templates = this.getMenuTemplates();
        const template = templates[templateType];
        
        if (!template) return;
        
        // Clear existing sections
        this.menuEditor.sections = [];
        document.getElementById('menu-container').innerHTML = '';
        
        // Add template sections
        template.sections.forEach(sectionData => {
            const section = this.menuEditor.createSection(sectionData.name, sectionData.type);
            
            // Add sample items
            sectionData.items.forEach(itemData => {
                this.menuEditor.addItemToSection(section.id, itemData);
            });
        });
        
        this.updateEmptyState();
        this.menuEditor.markAsChanged();
    }
    
    applyBackgroundStyle(backgroundType) {
        // This would integrate with the existing background system
        if (this.menuEditor.setBackground) {
            switch (backgroundType) {
                case 'warm':
                    this.menuEditor.setBackground('color', '#f4e4c1');
                    break;
                case 'elegant':
                    this.menuEditor.setBackground('color', '#2c3e50');
                    break;
            }
        }
    }
    
    applyColorPalette(paletteType) {
        // This would integrate with the existing color system
        if (this.menuEditor.setColorPalette) {
            this.menuEditor.setColorPalette(paletteType);
        }
    }
    
    getMenuTemplates() {
        return {
            restaurant: {
                sections: [
                    {
                        name: 'Appetizers',
                        type: 'food',
                        items: [
                            { 'Item Name': 'Bruschetta', 'Description': 'Toasted bread with fresh tomatoes and basil', 'Price': '$8' },
                            { 'Item Name': 'Calamari', 'Description': 'Crispy fried squid with marinara sauce', 'Price': '$12' }
                        ]
                    },
                    {
                        name: 'Main Courses',
                        type: 'food',
                        items: [
                            { 'Item Name': 'Grilled Salmon', 'Description': 'Fresh Atlantic salmon with lemon herbs', 'Price': '$24' },
                            { 'Item Name': 'Pasta Primavera', 'Description': 'Fresh vegetables with homemade pasta', 'Price': '$18' }
                        ]
                    },
                    {
                        name: 'Beverages',
                        type: 'custom',
                        items: [
                            { 'Item Name': 'House Wine', 'Description': 'Red or white wine selection', 'Price': '$8/glass' },
                            { 'Item Name': 'Fresh Juice', 'Description': 'Orange, apple, or cranberry', 'Price': '$4' }
                        ]
                    }
                ]
            },
            cafe: {
                sections: [
                    {
                        name: 'Coffee & Tea',
                        type: 'coffee',
                        items: [
                            { 'Item Name': 'Espresso', 'Description': 'Rich, bold Italian coffee', 'Price': '$3' },
                            { 'Item Name': 'Cappuccino', 'Description': 'Espresso with steamed milk foam', 'Price': '$4.50' },
                            { 'Item Name': 'Earl Grey Tea', 'Description': 'Classic black tea with bergamot', 'Price': '$3' }
                        ]
                    },
                    {
                        name: 'Pastries',
                        type: 'desserts',
                        items: [
                            { 'Item Name': 'Croissant', 'Description': 'Buttery, flaky French pastry', 'Price': '$3.50' },
                            { 'Item Name': 'Blueberry Muffin', 'Description': 'Fresh blueberries in vanilla muffin', 'Price': '$4' }
                        ]
                    },
                    {
                        name: 'Light Meals',
                        type: 'food',
                        items: [
                            { 'Item Name': 'Avocado Toast', 'Description': 'Sourdough with fresh avocado and lime', 'Price': '$8' },
                            { 'Item Name': 'Grilled Panini', 'Description': 'Turkey, cheese, and pesto on ciabatta', 'Price': '$10' }
                        ]
                    }
                ]
            },
            bar: {
                sections: [
                    {
                        name: 'Cocktails',
                        type: 'cocktails',
                        items: [
                            { 'Item Name': 'Old Fashioned', 'Description': 'Bourbon, sugar, bitters, orange peel', 'Price': '$12' },
                            { 'Item Name': 'Mojito', 'Description': 'White rum, lime, mint, soda water', 'Price': '$11' }
                        ]
                    },
                    {
                        name: 'Beer',
                        type: 'beer',
                        items: [
                            { 'Item Name': 'Local IPA', 'Description': 'Hoppy craft beer from local brewery', 'Price': '$6' },
                            { 'Item Name': 'Wheat Beer', 'Description': 'Light and refreshing wheat beer', 'Price': '$5' }
                        ]
                    },
                    {
                        name: 'Bar Snacks',
                        type: 'food',
                        items: [
                            { 'Item Name': 'Wings', 'Description': 'Buffalo, BBQ, or dry rub wings', 'Price': '$12' },
                            { 'Item Name': 'Nachos', 'Description': 'Loaded with cheese, jalapeños, salsa', 'Price': '$10' }
                        ]
                    }
                ]
            },
            pizza: {
                sections: [
                    {
                        name: 'Pizzas',
                        type: 'food',
                        items: [
                            { 'Item Name': 'Margherita', 'Description': 'Fresh mozzarella, basil, tomato sauce', 'Price': '$16' },
                            { 'Item Name': 'Pepperoni', 'Description': 'Classic pepperoni with mozzarella', 'Price': '$18' },
                            { 'Item Name': 'Supreme', 'Description': 'Pepperoni, sausage, peppers, onions', 'Price': '$22' }
                        ]
                    },
                    {
                        name: 'Sides',
                        type: 'food',
                        items: [
                            { 'Item Name': 'Garlic Bread', 'Description': 'Fresh baked bread with garlic butter', 'Price': '$6' },
                            { 'Item Name': 'Caesar Salad', 'Description': 'Crisp romaine, parmesan, croutons', 'Price': '$8' }
                        ]
                    },
                    {
                        name: 'Drinks',
                        type: 'custom',
                        items: [
                            { 'Item Name': 'Soft Drinks', 'Description': 'Coke, Sprite, Orange, Root Beer', 'Price': '$3' },
                            { 'Item Name': 'Italian Soda', 'Description': 'Various flavors available', 'Price': '$4' }
                        ]
                    }
                ]
            },
            fine_dining: {
                sections: [
                    {
                        name: 'Amuse-Bouche',
                        type: 'food',
                        items: [
                            { 'Item Name': 'Oyster Shooter', 'Description': 'Fresh oyster with champagne mignonette', 'Price': '$8' }
                        ]
                    },
                    {
                        name: 'First Course',
                        type: 'food',
                        items: [
                            { 'Item Name': 'Foie Gras', 'Description': 'Pan-seared with cherry gastrique', 'Price': '$28' },
                            { 'Item Name': 'Tuna Tartare', 'Description': 'Yellowfin tuna with avocado and citrus', 'Price': '$22' }
                        ]
                    },
                    {
                        name: 'Main Course',
                        type: 'food',
                        items: [
                            { 'Item Name': 'Wagyu Beef', 'Description': 'Dry-aged with seasonal vegetables', 'Price': '$65' },
                            { 'Item Name': 'John Dory', 'Description': 'Pan-roasted with saffron beurre blanc', 'Price': '$42' }
                        ]
                    },
                    {
                        name: 'Wine Pairings',
                        type: 'wine',
                        items: [
                            { 'Item Name': 'Sommelier Selection', 'Description': 'Curated wine pairings for each course', 'Price': '+$45' }
                        ]
                    }
                ]
            }
        };
    }
    
    // =============================================
    // EMPTY STATE MANAGEMENT
    // =============================================
    
    updateEmptyState() {
        const emptyState = document.getElementById('empty-state');
        const hasMenuSections = this.hasMenuSections();
        
        if (emptyState) {
            emptyState.style.display = hasMenuSections ? 'none' : 'flex';
        }
    }
    
    hasMenuSections() {
        return this.menuEditor.sections && this.menuEditor.sections.length > 0;
    }
    
    addFirstSection() {
        // Use existing add section functionality
        if (this.menuEditor.showSectionModal) {
            this.menuEditor.showSectionModal();
        } else {
            // Fallback: add a basic food section
            const section = this.menuEditor.createSection('Main Dishes', 'food');
            this.updateEmptyState();
            this.showContextualTip(section.element, 'Great Start!', 'Now click the "+" button to add menu items to this section.');
        }
    }
    
    showTemplateSelection() {
        this.showWelcomeModal();
    }
    
    // =============================================
    // CONTEXTUAL TIPS SYSTEM
    // =============================================
    
    initContextualTips() {
        this.tipsShown = JSON.parse(localStorage.getItem('mmm_tips_shown') || '[]');
        this.tipElement = document.getElementById('contextual-tips');
        
        // Setup close handler
        const closeBtn = this.tipElement?.querySelector('.tip-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideContextualTip());
        }
    }
    
    showContextualTip(targetElement, title, description, tipId = null) {
        if (!this.tipElement) return;
        
        // Check if this tip has already been shown
        if (tipId && this.tipsShown.includes(tipId)) {
            return;
        }
        
        const target = typeof targetElement === 'string' 
            ? document.getElementById(targetElement) 
            : targetElement;
        
        if (!target) return;
        
        // Update tip content
        const tipTitle = this.tipElement.querySelector('.tip-title');
        const tipDescription = this.tipElement.querySelector('.tip-description');
        
        if (tipTitle) tipTitle.textContent = title;
        if (tipDescription) tipDescription.textContent = description;
        
        // Position tip near target element
        const targetRect = target.getBoundingClientRect();
        const tipRect = this.tipElement.getBoundingClientRect();
        
        const left = Math.min(
            targetRect.left,
            window.innerWidth - tipRect.width - 20
        );
        const top = targetRect.bottom + 10;
        
        this.tipElement.style.left = `${left}px`;
        this.tipElement.style.top = `${top}px`;
        this.tipElement.style.display = 'block';
        
        // Mark tip as shown if tipId provided
        if (tipId && !this.tipsShown.includes(tipId)) {
            this.tipsShown.push(tipId);
            localStorage.setItem('mmm_tips_shown', JSON.stringify(this.tipsShown));
        }
        
        // Auto-hide after 8 seconds
        setTimeout(() => {
            this.hideContextualTip();
        }, 8000);
    }
    
    hideContextualTip() {
        if (this.tipElement) {
            this.tipElement.style.display = 'none';
        }
    }
    
    // =============================================
    // PROGRESSIVE DISCLOSURE
    // =============================================
    
    setupProgressiveDisclosure() {
        // Hide advanced controls initially for new users
        if (this.isFirstTime) {
            this.hideAdvancedControls();
        }
    }
    
    hideAdvancedControls() {
        const advancedControls = [
            '.color-controls',
            '.navigation-controls',
            '.font-controls'
        ];
        
        advancedControls.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.opacity = '0.5';
                element.title = 'Available after adding your first menu section';
            }
        });
    }
    
    showAdvancedControls() {
        const advancedControls = [
            '.color-controls',
            '.navigation-controls',
            '.font-controls'
        ];
        
        advancedControls.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.opacity = '1';
                element.title = '';
            }
        });
    }
    
    // =============================================
    // INTEGRATION HOOKS
    // =============================================
    
    onSectionAdded() {
        this.updateEmptyState();
        
        // Show advanced controls after first section
        if (this.isFirstTime && this.hasMenuSections()) {
            this.showAdvancedControls();
            this.showContextualTip('toggle-live-preview', 'Preview Your Menu', 'Click here to see how your menu looks on mobile devices!', 'preview-tip');
        }
    }
    
    onSectionRemoved() {
        this.updateEmptyState();
        
        // Hide advanced controls if no sections remain
        if (!this.hasMenuSections()) {
            this.hideAdvancedControls();
        }
    }
    
    onFirstItemAdded() {
        if (this.isFirstTime) {
            this.showContextualTip('save-menu', 'Save Your Work', 'Your menu auto-saves, but you can also save manually here.', 'save-tip');
        }
    }
    
    // =============================================
    // PUBLIC API
    // =============================================
    
    reset() {
        localStorage.removeItem('mmm_onboarding_completed');
        localStorage.removeItem('mmm_tips_shown');
        this.isFirstTime = true;
        this.tipsShown = [];
    }
    
    showOnboardingAgain() {
        this.showWelcomeModal();
    }
}

// Initialize UX Enhancements when MenuEditor is ready
window.addEventListener('load', () => {
    // Wait for MenuEditor to be initialized
    const checkMenuEditor = () => {
        if (window.menuEditor) {
            window.uxEnhancements = new UXEnhancements(window.menuEditor);
            
            // Hook into MenuEditor events
            const originalCreateSection = window.menuEditor.createSection;
            window.menuEditor.createSection = function(...args) {
                const result = originalCreateSection.apply(this, args);
                window.uxEnhancements?.onSectionAdded();
                return result;
            };
            
            const originalRemoveSection = window.menuEditor.removeSection;
            window.menuEditor.removeSection = function(...args) {
                const result = originalRemoveSection.apply(this, args);
                window.uxEnhancements?.onSectionRemoved();
                return result;
            };
            
        } else {
            setTimeout(checkMenuEditor, 100);
        }
    };
    
    setTimeout(checkMenuEditor, 500);
});