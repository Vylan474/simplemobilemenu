// Landing Page Functionality
class LandingPage {
    constructor() {
        console.log('LandingPage constructor called');
        console.log('Window authManager:', window.authManager);
        this.initializeEvents();
        this.initializeScrollEffects();
    }
    
    initializeEvents() {
        // Sign in/up modal handling
        this.setupModalEvents();
        
        // Navigation handling
        this.setupNavigationEvents();
        
        // CTA button handling
        this.setupCTAEvents();
        
        // Demo video handling
        this.setupDemoEvents();
    }
    
    setupModalEvents() {
        console.log('Setting up modal events...');
        const signInBtn = document.getElementById('sign-in-btn');
        const signInModal = document.getElementById('sign-in-modal');
        const signUpModal = document.getElementById('sign-up-modal');
        const switchToSignup = document.getElementById('switch-to-signup');
        const switchToSignin = document.getElementById('switch-to-signin');
        
        console.log('Elements found:', {
            signInBtn: !!signInBtn,
            signInModal: !!signInModal,
            signUpModal: !!signUpModal,
            switchToSignup: !!switchToSignup,
            switchToSignin: !!switchToSignin
        });
        
        // Open sign in modal
        if (signInBtn) {
            console.log('Sign in button found, adding event listener');
            signInBtn.addEventListener('click', () => {
                console.log('Sign in button clicked');
                this.openModal('sign-in-modal');
            });
        } else {
            console.log('Sign in button not found');
        }
        
        // Open sign up modal for all get started buttons
        const getStartedBtn = document.getElementById('get-started-btn');
        if (getStartedBtn) {
            console.log('Get started button found, adding event listener');
            getStartedBtn.addEventListener('click', () => {
                console.log('Get started button clicked');
                this.openModal('sign-up-modal');
            });
        } else {
            console.log('Get started button not found');
        }
        
        // Also handle dynamically with event delegation for buttons containing these texts
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' && (
                e.target.textContent.includes('Start Free Trial') || 
                e.target.textContent.includes('Start Your Free Trial') ||
                e.target.textContent.includes('Get Started'))) {
                this.openModal('sign-up-modal');
            }
        });
        
        // Switch between modals
        if (switchToSignup) {
            switchToSignup.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal('sign-in-modal');
                this.openModal('sign-up-modal');
            });
        }
        
        if (switchToSignin) {
            switchToSignin.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal('sign-up-modal');
                this.openModal('sign-in-modal');
            });
        }
        
        // Close modal events
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal.id);
            });
        });
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
        
        // Form submissions
        this.setupFormSubmissions();
        
        // Google sign-in buttons
        this.setupGoogleAuth();
    }
    
    setupFormSubmissions() {
        const signInForm = document.getElementById('sign-in-form');
        const signUpForm = document.getElementById('sign-up-form');
        
        if (signInForm) {
            signInForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignIn(new FormData(signInForm));
            });
        }
        
        if (signUpForm) {
            signUpForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignUp(new FormData(signUpForm));
            });
        }
    }
    
    setupNavigationEvents() {
        // Smooth scroll for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Mobile menu toggle (placeholder for future implementation)
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                // TODO: Implement mobile menu
                console.log('Mobile menu toggle clicked');
            });
        }
    }
    
    setupCTAEvents() {
        // Watch demo buttons - find by text content
        document.querySelectorAll('.btn').forEach(btn => {
            if (btn.textContent.includes('Watch Demo')) {
                btn.addEventListener('click', () => {
                    document.getElementById('demo').scrollIntoView({
                        behavior: 'smooth'
                    });
                });
            }
        });
    }
    
    setupDemoEvents() {
        const videoPlaceholder = document.querySelector('.video-placeholder');
        if (videoPlaceholder) {
            videoPlaceholder.addEventListener('click', () => {
                // TODO: Implement video modal or redirect to demo
                console.log('Demo video clicked');
                // For now, redirect to the editor
                window.location.href = 'editor.html';
            });
        }
    }
    
    openModal(modalId) {
        console.log('Opening modal:', modalId);
        const modal = document.getElementById(modalId);
        if (modal) {
            console.log('Modal element found, displaying');
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Focus first input
            const firstInput = modal.querySelector('input');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        } else {
            console.log('Modal element not found:', modalId);
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
    
    async handleSignIn(formData) {
        const email = formData.get('email');
        const password = formData.get('password');
        
        console.log('Sign in attempt with email:', email);
        
        this.showLoadingState('sign-in-form');
        
        try {
            if (!window.authManager) {
                throw new Error('Authentication system not initialized');
            }
            
            const result = await window.authManager.signIn(email, password);
            if (!result.success) {
                throw new Error(result.error);
            }
            console.log('Sign in successful, redirecting...');
            // Redirect will happen automatically via auth state change
            window.location.href = 'editor.html';
        } catch (error) {
            console.error('Sign in error:', error);
            this.showError('sign-in-form', error.message);
        }
    }
    
    async handleSignUp(formData) {
        console.log('handleSignUp called');
        
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            restaurant: formData.get('restaurant'),
            password: formData.get('password')
        };
        
        console.log('User data:', userData);
        
        this.showLoadingState('sign-up-form');
        
        try {
            if (!window.authManager) {
                throw new Error('Authentication system not initialized');
            }
            
            const result = await window.authManager.register(userData);
            if (!result.success) {
                throw new Error(result.error);
            }
            console.log('User created:', result.user);
            
            // Redirect to menu editor (demo menu creation will happen in editor)
            window.location.href = 'editor.html';
        } catch (error) {
            console.error('Sign up error:', error);
            this.showError('sign-up-form', error.message);
        }
    }
    
    async handleGoogleSignIn() {
        console.log('Google sign-in initiated');
        
        // Check if Google Identity Services is loaded
        if (typeof google === 'undefined' || !google.accounts) {
            console.error('Google Identity Services not loaded');
            this.showError('sign-in-form', 'Google sign-in service is not available. Please try again later.');
            return;
        }

        try {
            // Initialize Google Sign-In
            await this.initializeGoogleOAuth();
            
            // Get Google Client ID and initialize the Google Sign-In library
            const clientId = await this.getGoogleClientId();
            google.accounts.id.initialize({
                client_id: clientId,
                callback: async (response) => {
                    try {
                        console.log('Google sign-in response received');
                        
                        // Handle the ID token credential
                        const result = await window.authManager.handleGoogleSignIn(response.credential);
                        
                        if (result.success) {
                            console.log('Google sign-in successful');
                            this.closeModal('sign-in-modal');
                            this.closeModal('sign-up-modal');
                            window.location.href = 'editor.html';
                        } else {
                            this.showError('sign-in-form', result.error || 'Google sign-in failed');
                        }
                    } catch (error) {
                        console.error('Google sign-in processing error:', error);
                        this.showError('sign-in-form', 'Google sign-in failed. Please try again.');
                    }
                }
            });
            
            // Trigger the Google sign-in prompt
            google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    console.log('Google sign-in prompt was dismissed or not shown');
                    // Fallback to one-tap sign-in
                    this.showGoogleOneTap();
                }
            });
            
        } catch (error) {
            console.error('Google sign-in initialization error:', error);
            this.showError('sign-in-form', 'Google sign-in is not available. Please try email sign-in.');
        }
    }

    showGoogleOneTap() {
        // Alternative approach: render a sign-in button
        const container = document.createElement('div');
        container.id = 'g_id_onload';
        document.body.appendChild(container);
        
        google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            width: 300
        });
        
        // Remove the container after use
        setTimeout(() => {
            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
        }, 100);
    }

    async initializeGoogleOAuth() {
        return new Promise((resolve, reject) => {
            if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
                resolve();
                return;
            }
            
            // Wait for Google library to load
            let attempts = 0;
            const checkGoogle = setInterval(() => {
                attempts++;
                if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
                    clearInterval(checkGoogle);
                    resolve();
                } else if (attempts > 50) { // 5 seconds timeout
                    clearInterval(checkGoogle);
                    reject(new Error('Google Identity Services failed to load'));
                }
            }, 100);
        });
    }

    async getGoogleClientId() {
        try {
            const response = await fetch('/api/config');
            const config = await response.json();
            return config.googleClientId;
        } catch (error) {
            console.error('Failed to fetch Google Client ID:', error);
            return 'demo-client-id'; // Fallback
        }
    }
    
    showLoadingState(formId) {
        const form = document.getElementById(formId);
        const submitBtn = form.querySelector('button[type="submit"]');
        
        if (submitBtn) {
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Please wait...';
            submitBtn.disabled = true;
            
            // Reset after timeout (in case of error)
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 5000);
        }
    }
    
    setupGoogleAuth() {
        const googleSignInBtn = document.getElementById('google-signin-btn');
        const googleSignUpBtn = document.getElementById('google-signup-btn');
        
        if (googleSignInBtn) {
            googleSignInBtn.addEventListener('click', () => {
                this.handleGoogleSignIn();
            });
        }
        
        if (googleSignUpBtn) {
            googleSignUpBtn.addEventListener('click', () => {
                this.handleGoogleSignIn();
            });
        }
    }
    
    showError(formId, message) {
        const form = document.getElementById(formId);
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Reset loading state
        if (submitBtn) {
            submitBtn.textContent = submitBtn.dataset.originalText || 'Sign In';
            submitBtn.disabled = false;
        }
        
        // Show error message
        let errorDiv = form.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.cssText = 'color: #e74c3c; background: #fdf2f2; padding: 12px; border-radius: 8px; margin-top: 15px; font-size: 14px; text-align: center;';
            form.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
        
        // Hide error after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
    
    initializeScrollEffects() {
        // Add scroll-based animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observe feature cards and pricing cards
        document.querySelectorAll('.feature-card, .pricing-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
        
        // Navbar background on scroll
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.backdropFilter = 'blur(15px)';
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.backdropFilter = 'blur(10px)';
                navbar.style.boxShadow = 'none';
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Landing page DOM loaded, initializing...');
    
    // Wait a bit for auth manager to be initialized by auth-db.js
    setTimeout(() => {
        console.log('Creating LandingPage instance');
        const landingPage = new LandingPage();
        
        // Add a global click test
        window.testModal = () => {
            console.log('Testing modal manually...');
            landingPage.openModal('sign-in-modal');
        };
        
        console.log('You can test modal by calling window.testModal() in console');
    }, 100);
});

// Utility function to check if text contains substring (for event delegation)
Node.prototype.contains = Node.prototype.contains || function(node) {
    return !!(this.compareDocumentPosition(node) & 16);
};