/**
 * UI Feedback System for MyMobileMenu Editor
 * Handles toast notifications, loading states, and micro-interactions
 */

class UIFeedback {
    constructor() {
        this.toastContainer = null;
        this.toastCount = 0;
        this.activeToasts = new Map();
        
        this.init();
    }
    
    init() {
        this.toastContainer = document.getElementById('toast-container');
        
        // Create container if it doesn't exist
        if (!this.toastContainer) {
            this.toastContainer = document.createElement('div');
            this.toastContainer.id = 'toast-container';
            this.toastContainer.className = 'toast-container';
            document.body.appendChild(this.toastContainer);
        }
    }
    
    // =============================================
    // TOAST NOTIFICATIONS
    // =============================================
    
    /**
     * Show a toast notification
     * @param {string} type - success, error, info, warning
     * @param {string} title - Toast title
     * @param {string} message - Toast message
     * @param {number} duration - Auto-dismiss duration in ms (0 = no auto-dismiss)
     * @returns {string} Toast ID for manual dismissal
     */
    showToast(type = 'info', title, message, duration = 5000) {
        const toastId = `toast-${++this.toastCount}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.id = toastId;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${icons[type] || icons.info}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Close notification">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add close handler
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.hideToast(toastId));
        
        // Add to container
        this.toastContainer.appendChild(toast);
        
        // Store reference
        this.activeToasts.set(toastId, { element: toast, timeoutId: null });
        
        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Auto-dismiss
        if (duration > 0) {
            const timeoutId = setTimeout(() => {
                this.hideToast(toastId);
            }, duration);
            
            this.activeToasts.get(toastId).timeoutId = timeoutId;
        }
        
        return toastId;
    }
    
    /**
     * Hide a specific toast
     * @param {string} toastId - Toast ID to hide
     */
    hideToast(toastId) {
        const toastData = this.activeToasts.get(toastId);
        if (!toastData) return;
        
        const { element, timeoutId } = toastData;
        
        // Clear timeout if exists
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        
        // Animate out
        element.classList.remove('show');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.activeToasts.delete(toastId);
        }, 300);
    }
    
    /**
     * Hide all toasts
     */
    hideAllToasts() {
        this.activeToasts.forEach((_, toastId) => {
            this.hideToast(toastId);
        });
    }
    
    // Convenience methods for different toast types
    showSuccess(title, message, duration = 4000) {
        return this.showToast('success', title, message, duration);
    }
    
    showError(title, message, duration = 8000) {
        return this.showToast('error', title, message, duration);
    }
    
    showInfo(title, message, duration = 5000) {
        return this.showToast('info', title, message, duration);
    }
    
    showWarning(title, message, duration = 6000) {
        return this.showToast('warning', title, message, duration);
    }
    
    // =============================================
    // LOADING STATES
    // =============================================
    
    /**
     * Set button loading state
     * @param {HTMLElement|string} button - Button element or selector
     * @param {boolean} loading - Loading state
     * @param {string} loadingText - Optional loading text
     */
    setButtonLoading(button, loading = true, loadingText = null) {
        const btn = typeof button === 'string' ? document.querySelector(button) : button;
        if (!btn) return;
        
        if (loading) {
            btn.classList.add('loading');
            btn.disabled = true;
            
            if (loadingText && !btn.dataset.originalText) {
                btn.dataset.originalText = btn.textContent;
                btn.textContent = loadingText;
            }
        } else {
            btn.classList.remove('loading');
            btn.disabled = false;
            
            if (btn.dataset.originalText) {
                btn.textContent = btn.dataset.originalText;
                delete btn.dataset.originalText;
            }
        }
    }
    
    /**
     * Set button success state temporarily
     * @param {HTMLElement|string} button - Button element or selector
     * @param {string} successText - Success text to show
     * @param {number} duration - Duration to show success state
     */
    setButtonSuccess(button, successText = 'Saved!', duration = 2000) {
        const btn = typeof button === 'string' ? document.querySelector(button) : button;
        if (!btn) return;
        
        // Store original state
        const originalText = btn.textContent;
        const wasDisabled = btn.disabled;
        
        // Set success state
        btn.classList.add('success');
        btn.textContent = successText;
        btn.disabled = true;
        
        // Revert after duration
        setTimeout(() => {
            btn.classList.remove('success');
            btn.textContent = originalText;
            btn.disabled = wasDisabled;
        }, duration);
    }
    
    /**
     * Show content loading spinner
     * @param {HTMLElement|string} container - Container element or selector
     * @param {string} message - Loading message
     */
    showContentLoading(container, message = 'Loading...') {
        const element = typeof container === 'string' ? document.querySelector(container) : container;
        if (!element) return;
        
        element.innerHTML = `
            <div class=\"content-loading\">
                <div class=\"loading-spinner\"></div>
                <span>${message}</span>
            </div>
        `;
    }
    
    /**
     * Hide content loading
     * @param {HTMLElement|string} container - Container element or selector
     * @param {string} content - Content to show after loading
     */
    hideContentLoading(container, content = '') {
        const element = typeof container === 'string' ? document.querySelector(container) : container;
        if (!element) return;
        
        element.innerHTML = content;
    }
    
    // =============================================
    // SAVE INDICATOR
    // =============================================
    
    /**
     * Update save indicator
     * @param {string} state - saving, saved, error
     * @param {string} message - Custom message
     */
    updateSaveIndicator(state, message = null) {
        const indicator = document.getElementById('change-indicator');
        if (!indicator) return;
        
        // Remove all state classes
        indicator.classList.remove('saving', 'saved', 'error');
        
        // Add new state class
        indicator.classList.add(state);
        
        // Update text and icon
        const icon = indicator.querySelector('i');
        const text = indicator.querySelector('.status-text') || indicator;
        
        switch (state) {
            case 'saving':
                if (icon) icon.className = 'fas fa-spinner fa-spin';
                text.textContent = message || 'Saving...';
                break;
            case 'saved':
                if (icon) icon.className = 'fas fa-check-circle';
                text.textContent = message || 'Saved';
                break;
            case 'error':
                if (icon) icon.className = 'fas fa-exclamation-circle';
                text.textContent = message || 'Error saving';
                break;
        }
    }
    
    // =============================================
    // PROGRESS INDICATORS
    // =============================================
    
    /**
     * Create and show progress bar
     * @param {HTMLElement|string} container - Container element or selector
     * @param {number} progress - Progress percentage (0-100)
     * @param {string} message - Progress message
     * @returns {HTMLElement} Progress bar element
     */
    showProgress(container, progress = 0, message = 'Processing...') {
        const element = typeof container === 'string' ? document.querySelector(container) : container;
        if (!element) return null;
        
        // Create progress bar if it doesn't exist
        let progressBar = element.querySelector('.progress-bar');
        if (!progressBar) {
            const progressContainer = document.createElement('div');
            progressContainer.className = 'progress-container';
            progressContainer.innerHTML = `
                <div class=\"progress-message\">${message}</div>
                <div class=\"progress-bar\">
                    <div class=\"progress-fill\" style=\"width: ${progress}%\"></div>
                </div>
            `;
            element.appendChild(progressContainer);
            progressBar = progressContainer.querySelector('.progress-bar');
        }
        
        // Update progress
        this.updateProgress(progressBar, progress, message);
        
        return progressBar;
    }
    
    /**
     * Update progress bar
     * @param {HTMLElement} progressBar - Progress bar element
     * @param {number} progress - Progress percentage (0-100)
     * @param {string} message - Progress message
     */
    updateProgress(progressBar, progress, message = null) {
        if (!progressBar) return;
        
        const progressFill = progressBar.querySelector('.progress-fill');
        const messageElement = progressBar.parentNode?.querySelector('.progress-message');
        
        if (progressFill) {
            progressFill.style.width = `${Math.max(0, Math.min(100, progress))}%`;
        }
        
        if (messageElement && message) {
            messageElement.textContent = message;
        }
    }
    
    /**
     * Hide progress bar
     * @param {HTMLElement|string} container - Container element or selector
     */
    hideProgress(container) {
        const element = typeof container === 'string' ? document.querySelector(container) : container;
        if (!element) return;
        
        const progressContainer = element.querySelector('.progress-container');
        if (progressContainer) {
            progressContainer.remove();
        }
    }
    
    // =============================================
    // MICRO-INTERACTIONS
    // =============================================
    
    /**
     * Add ripple effect to element
     * @param {HTMLElement} element - Target element
     * @param {Event} event - Click event
     */
    addRippleEffect(element, event) {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 0;
            height: 0;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            pointer-events: none;
            transform: translate(-50%, -50%);
            animation: ripple-animation 0.6s ease-out;
        `;
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    /**
     * Animate element entrance
     * @param {HTMLElement} element - Element to animate
     * @param {string} animation - Animation type (slideIn, fadeIn, scaleIn)
     */
    animateIn(element, animation = 'slideIn') {
        if (!element) return;
        
        element.style.animation = `${animation} 0.3s cubic-bezier(0.4, 0, 0.2, 1)`;
    }
    
    /**
     * Animate element exit
     * @param {HTMLElement} element - Element to animate
     * @param {string} animation - Animation type (slideOut, fadeOut, scaleOut)
     * @param {Function} callback - Callback after animation
     */
    animateOut(element, animation = 'slideOut', callback = null) {
        if (!element) return;
        
        element.style.animation = `${animation} 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards`;
        
        if (callback) {
            setTimeout(callback, 300);
        }
    }
    
    // =============================================
    // UTILITY METHODS
    // =============================================
    
    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * Throttle function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Create global instance
window.uiFeedback = new UIFeedback();

// Add CSS animations dynamically if not present
if (!document.querySelector('#ui-feedback-animations')) {
    const style = document.createElement('style');
    style.id = 'ui-feedback-animations';
    style.textContent = `
        @keyframes ripple-animation {
            to {
                width: 200px;
                height: 200px;
                opacity: 0;
            }
        }
        
        .progress-container {
            margin: 16px 0;
        }
        
        .progress-message {
            font-size: 14px;
            color: rgba(245, 247, 250, 0.8);
            margin-bottom: 8px;
            text-align: center;
        }
    `;
    document.head.appendChild(style);
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIFeedback;
}