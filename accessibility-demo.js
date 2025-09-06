/**
 * Accessibility Demo Script
 * Demonstrates improved accessibility features for the registration form
 */

(function() {
    'use strict';
    
    // Enhanced form validation with elegant error handling
    function addAccessibilityFeatures() {
        const forms = document.querySelectorAll('form[novalidate]');
        
        forms.forEach(form => {
            // Add real-time validation with subtle feedback
            const inputs = form.querySelectorAll('input[required], select[required]');
            
            inputs.forEach(input => {
                input.addEventListener('blur', function() {
                    validateField(this);
                });
                
                input.addEventListener('input', function() {
                    // Clear error state on input
                    if (this.getAttribute('aria-invalid') === 'true') {
                        clearFieldError(this);
                    }
                });
            });
        });
    }
    
    function validateField(field) {
        const formGroup = field.closest('.form-group');
        const errorId = field.getAttribute('aria-describedby');
        
        if (field.validity.valid) {
            // Valid state - subtle success indication
            field.setAttribute('aria-invalid', 'false');
            formGroup.classList.add('valid');
            formGroup.classList.remove('error');
            removeErrorMessage(errorId);
        } else {
            // Invalid state - elegant error indication
            field.setAttribute('aria-invalid', 'true');
            formGroup.classList.add('error');
            formGroup.classList.remove('valid');
            showErrorMessage(field, getErrorMessage(field));
        }
    }
    
    function clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        const errorId = field.getAttribute('aria-describedby');
        
        field.removeAttribute('aria-invalid');
        formGroup.classList.remove('error', 'valid');
        removeErrorMessage(errorId);
    }
    
    function getErrorMessage(field) {
        if (field.validity.valueMissing) {
            return `${field.labels[0]?.textContent || 'This field'} is required.`;
        }
        if (field.validity.typeMismatch) {
            return `Please enter a valid ${field.type}.`;
        }
        if (field.validity.tooShort) {
            return `${field.labels[0]?.textContent || 'This field'} must be at least ${field.minLength} characters.`;
        }
        if (field.validity.patternMismatch) {
            return `Please match the requested format.`;
        }
        return 'Please check your input.';
    }
    
    function showErrorMessage(field, message) {
        const errorId = field.getAttribute('aria-describedby')?.split(' ')[0] + '-error';
        let errorElement = document.getElementById(errorId);
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = errorId;
            errorElement.className = 'error-message';
            errorElement.setAttribute('role', 'alert');
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        
        // Announce to screen readers
        announceToScreenReader(`Error: ${message}`);
    }
    
    function removeErrorMessage(errorId) {
        if (errorId && errorId.includes('-error')) {
            const errorElement = document.getElementById(errorId.split(' ')[0]);
            if (errorElement) {
                errorElement.remove();
            }
        }
    }
    
    function announceToScreenReader(message) {
        const announcer = document.getElementById('accessibility-announcements');
        if (announcer) {
            announcer.textContent = message;
            // Clear after announcement
            setTimeout(() => {
                announcer.textContent = '';
            }, 1000);
        }
    }
    
    // Enhanced focus management for modals
    function manageFocus() {
        const modals = document.querySelectorAll('.modal');
        
        modals.forEach(modal => {
            modal.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    closeModal(this);
                }
                
                // Trap focus within modal
                if (e.key === 'Tab') {
                    trapFocus(e, this);
                }
            });
        });
    }
    
    function trapFocus(e, modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }
    
    function closeModal(modal) {
        modal.style.display = 'none';
        // Return focus to the element that opened the modal
        const triggerElement = document.querySelector(`[data-modal="${modal.id}"]`);
        if (triggerElement) {
            triggerElement.focus();
        }
        
        announceToScreenReader('Dialog closed');
    }
    
    // Enhanced keyboard navigation
    function enhanceKeyboardNavigation() {
        // Add keyboard support for custom elements
        const customButtons = document.querySelectorAll('[role="button"]:not(button)');
        
        customButtons.forEach(button => {
            button.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    }
    
    // Skip link functionality
    function addSkipLinkSupport() {
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }
    
    // Initialize all accessibility features
    function init() {
        addAccessibilityFeatures();
        manageFocus();
        enhanceKeyboardNavigation();
        addSkipLinkSupport();
        
        console.log('✅ Enhanced accessibility features loaded');
        console.log('🎯 Features: Elegant form validation, focus management, keyboard navigation');
        console.log('♿ WCAG 2.1 AA compliance maintained with refined visual styling');
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();