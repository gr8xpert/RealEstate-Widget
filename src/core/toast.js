/**
 * RealtySoft Widget v2 - Toast Notification System
 * Non-blocking notifications for user feedback
 */

const RealtySoftToast = (function() {
    'use strict';

    let container = null;
    let toasts = [];
    let toastIdCounter = 0;

    const defaultOptions = {
        duration: 4000,
        position: 'bottom-right', // top-left, top-right, bottom-left, bottom-right, top-center, bottom-center
        closable: true,
        pauseOnHover: true
    };

    /**
     * Initialize toast container
     */
    function init() {
        if (container) return;

        container = document.createElement('div');
        container.className = 'rs-toast-container rs-toast-container--bottom-right';
        document.body.appendChild(container);
    }

    /**
     * Set container position
     */
    function setPosition(position) {
        if (!container) init();
        container.className = `rs-toast-container rs-toast-container--${position}`;
    }

    /**
     * Create a toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type: success, error, warning, info
     * @param {object} options - Override default options
     */
    function show(message, type = 'info', options = {}) {
        if (!container) init();

        const opts = { ...defaultOptions, ...options };
        const id = ++toastIdCounter;

        const toast = document.createElement('div');
        toast.className = `rs-toast rs-toast--${type}`;
        toast.dataset.toastId = id;

        const icon = getIcon(type);

        toast.innerHTML = `
            <div class="rs-toast__icon">${icon}</div>
            <div class="rs-toast__content">
                <span class="rs-toast__message">${escapeHtml(message)}</span>
            </div>
            ${opts.closable ? `
                <button type="button" class="rs-toast__close" aria-label="Close">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            ` : ''}
            <div class="rs-toast__progress"></div>
        `;

        // Add progress bar animation
        const progressBar = toast.querySelector('.rs-toast__progress');
        progressBar.style.animationDuration = `${opts.duration}ms`;

        // Bind events
        if (opts.closable) {
            toast.querySelector('.rs-toast__close').addEventListener('click', () => {
                dismiss(id);
            });
        }

        let timeoutId = null;
        let remainingTime = opts.duration;
        let startTime = Date.now();

        if (opts.pauseOnHover) {
            toast.addEventListener('mouseenter', () => {
                remainingTime -= Date.now() - startTime;
                clearTimeout(timeoutId);
                progressBar.style.animationPlayState = 'paused';
            });

            toast.addEventListener('mouseleave', () => {
                startTime = Date.now();
                timeoutId = setTimeout(() => dismiss(id), remainingTime);
                progressBar.style.animationPlayState = 'running';
            });
        }

        // Add to container
        container.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('rs-toast--visible');
        });

        // Store reference
        toasts.push({ id, element: toast, timeoutId: null });

        // Auto dismiss
        timeoutId = setTimeout(() => dismiss(id), opts.duration);
        toasts.find(t => t.id === id).timeoutId = timeoutId;

        return id;
    }

    /**
     * Dismiss a toast
     */
    function dismiss(id) {
        const toastData = toasts.find(t => t.id === id);
        if (!toastData) return;

        clearTimeout(toastData.timeoutId);

        const toast = toastData.element;
        toast.classList.remove('rs-toast--visible');
        toast.classList.add('rs-toast--hiding');

        setTimeout(() => {
            toast.remove();
            toasts = toasts.filter(t => t.id !== id);
        }, 300);
    }

    /**
     * Dismiss all toasts
     */
    function dismissAll() {
        toasts.forEach(t => dismiss(t.id));
    }

    /**
     * Shorthand methods
     */
    function success(message, options) {
        return show(message, 'success', options);
    }

    function error(message, options) {
        return show(message, 'error', options);
    }

    function warning(message, options) {
        return show(message, 'warning', options);
    }

    function info(message, options) {
        return show(message, 'info', options);
    }

    /**
     * Get icon for toast type
     */
    function getIcon(type) {
        const icons = {
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
            error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
            info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
        };
        return icons[type] || icons.info;
    }

    /**
     * Escape HTML
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Public API
    return {
        init,
        setPosition,
        show,
        dismiss,
        dismissAll,
        success,
        error,
        warning,
        info
    };
})();

// Make globally available
window.RealtySoftToast = RealtySoftToast;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealtySoftToast;
}
