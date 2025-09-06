/**
 * Performance Monitoring and Optimization Utilities
 * Provides tools for measuring and improving performance in the Menu Editor
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.observers = new Map();
        this.isEnabled = true;
        this.startTime = performance.now();
    }

    // Performance measurement utilities
    startMeasurement(label) {
        if (!this.isEnabled) return;
        this.metrics.set(label, performance.now());
    }

    endMeasurement(label) {
        if (!this.isEnabled) return;
        const startTime = this.metrics.get(label);
        if (startTime) {
            const duration = performance.now() - startTime;
            console.log(`[PERF] ${label}: ${duration.toFixed(2)}ms`);
            return duration;
        }
        return 0;
    }

    // Memory usage monitoring
    getMemoryUsage() {
        if ('memory' in performance) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
                total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
            };
        }
        return null;
    }

    // DOM node counting
    countDOMNodes() {
        return document.querySelectorAll('*').length;
    }

    // Performance logging
    logPerformanceSnapshot(label) {
        if (!this.isEnabled) return;
        
        const memory = this.getMemoryUsage();
        const domNodes = this.countDOMNodes();
        const timeFromStart = performance.now() - this.startTime;

        console.group(`[PERF SNAPSHOT] ${label}`);
        console.log(`Time from start: ${timeFromStart.toFixed(2)}ms`);
        console.log(`DOM nodes: ${domNodes}`);
        if (memory) {
            console.log(`Memory usage: ${memory.used}MB / ${memory.total}MB (limit: ${memory.limit}MB)`);
        }
        console.groupEnd();

        return { timeFromStart, domNodes, memory };
    }

    // FPS monitoring
    startFPSMonitoring() {
        let frames = 0;
        let lastTime = performance.now();
        
        const countFrame = () => {
            frames++;
            const currentTime = performance.now();
            
            if (currentTime >= lastTime + 1000) {
                console.log(`[PERF] FPS: ${frames}`);
                frames = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(countFrame);
        };
        
        requestAnimationFrame(countFrame);
    }
}

class PerformanceOptimizer {
    constructor() {
        this.debounceTimers = new Map();
        this.throttleTimers = new Map();
        this.rafCallbacks = new Map();
    }

    // Debouncing utility
    debounce(func, delay, key = 'default') {
        return (...args) => {
            const existingTimer = this.debounceTimers.get(key);
            if (existingTimer) {
                clearTimeout(existingTimer);
            }
            
            const timer = setTimeout(() => {
                func.apply(this, args);
                this.debounceTimers.delete(key);
            }, delay);
            
            this.debounceTimers.set(key, timer);
        };
    }

    // Throttling utility
    throttle(func, delay, key = 'default') {
        return (...args) => {
            if (this.throttleTimers.has(key)) return;
            
            this.throttleTimers.set(key, true);
            func.apply(this, args);
            
            setTimeout(() => {
                this.throttleTimers.delete(key);
            }, delay);
        };
    }

    // RequestAnimationFrame batching
    batchRAF(func, key = 'default') {
        if (this.rafCallbacks.has(key)) {
            cancelAnimationFrame(this.rafCallbacks.get(key));
        }
        
        const rafId = requestAnimationFrame(() => {
            func();
            this.rafCallbacks.delete(key);
        });
        
        this.rafCallbacks.set(key, rafId);
    }

    // Virtual scrolling implementation
    createVirtualScrollContainer(options = {}) {
        const {
            container,
            items = [],
            itemHeight = 50,
            bufferSize = 5,
            renderItem = (item) => `<div>${item}</div>`
        } = options;

        if (!container) {
            throw new Error('Container element is required for virtual scrolling');
        }

        const containerHeight = container.offsetHeight;
        const visibleItemCount = Math.ceil(containerHeight / itemHeight);
        const totalHeight = items.length * itemHeight;

        // Create virtual scroll elements
        container.style.overflow = 'auto';
        container.style.height = containerHeight + 'px';

        const scrollContent = document.createElement('div');
        scrollContent.style.height = totalHeight + 'px';
        scrollContent.style.position = 'relative';

        const visibleContent = document.createElement('div');
        visibleContent.style.position = 'absolute';
        visibleContent.style.top = '0px';
        visibleContent.style.width = '100%';

        scrollContent.appendChild(visibleContent);
        container.innerHTML = '';
        container.appendChild(scrollContent);

        let startIndex = 0;
        let endIndex = Math.min(visibleItemCount + bufferSize, items.length);

        const updateVisibleItems = () => {
            const scrollTop = container.scrollTop;
            const newStartIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
            const newEndIndex = Math.min(items.length, newStartIndex + visibleItemCount + 2 * bufferSize);

            if (newStartIndex !== startIndex || newEndIndex !== endIndex) {
                startIndex = newStartIndex;
                endIndex = newEndIndex;

                const visibleItems = items.slice(startIndex, endIndex);
                const html = visibleItems.map((item, index) => {
                    const absoluteIndex = startIndex + index;
                    return `<div style="position: absolute; top: ${absoluteIndex * itemHeight}px; width: 100%; height: ${itemHeight}px;">${renderItem(item, absoluteIndex)}</div>`;
                }).join('');

                visibleContent.innerHTML = html;
            }
        };

        // Use throttled scroll handler
        const throttledUpdate = this.throttle(updateVisibleItems, 16, 'virtual-scroll'); // ~60fps
        container.addEventListener('scroll', throttledUpdate);

        // Initial render
        updateVisibleItems();

        return {
            updateItems: (newItems) => {
                items.splice(0, items.length, ...newItems);
                scrollContent.style.height = (newItems.length * itemHeight) + 'px';
                updateVisibleItems();
            }
        };
    }

    // Efficient DOM manipulation
    createDocumentFragment() {
        return document.createDocumentFragment();
    }

    // Batch DOM updates
    batchDOMUpdates(updateFunction) {
        this.batchRAF(() => {
            updateFunction();
        }, 'dom-updates');
    }

    // Image lazy loading
    createLazyImageLoader() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.dataset.src;
                    
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });

        return {
            observe: (img) => imageObserver.observe(img),
            disconnect: () => imageObserver.disconnect()
        };
    }

    // Image compression utility
    compressImage(file, options = {}) {
        const {
            maxWidth = 800,
            maxHeight = 600,
            quality = 0.8,
            format = 'image/jpeg'
        } = options;

        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = img;
                
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }

                // Set canvas size
                canvas.width = width;
                canvas.height = height;

                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(resolve, format, quality);
            };

            img.src = URL.createObjectURL(file);
        });
    }
}

// Global performance instances
window.performanceMonitor = new PerformanceMonitor();
window.performanceOptimizer = new PerformanceOptimizer();

// Performance debugging helpers
window.debugPerformance = {
    snapshot: (label) => window.performanceMonitor.logPerformanceSnapshot(label),
    measure: (label, func) => {
        window.performanceMonitor.startMeasurement(label);
        const result = func();
        window.performanceMonitor.endMeasurement(label);
        return result;
    },
    memory: () => window.performanceMonitor.getMemoryUsage(),
    domCount: () => window.performanceMonitor.countDOMNodes()
};

// Auto-start FPS monitoring in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.performanceMonitor.startFPSMonitoring();
    console.log('[PERF] Performance monitoring enabled for development');
}

console.log('[PERF] Performance utilities loaded successfully');