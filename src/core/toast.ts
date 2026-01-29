/**
 * RealtySoft Widget v3 - Toast Notification System
 * Non-blocking notifications for user feedback
 */

// Toast types
type ToastType = 'success' | 'error' | 'warning' | 'info';

// Toast position options
type ToastPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-center'
  | 'bottom-center';

// Toast options interface
interface ToastOptions {
  duration?: number;
  position?: ToastPosition;
  closable?: boolean;
  pauseOnHover?: boolean;
}

// Toast data stored in array
interface ToastData {
  id: number;
  element: HTMLElement;
  timeoutId: ReturnType<typeof setTimeout> | null;
}

// Toast module interface
interface RealtySoftToastModule {
  init: () => void;
  setPosition: (position: ToastPosition) => void;
  show: (message: string, type?: ToastType, options?: ToastOptions) => number;
  dismiss: (id: number) => void;
  dismissAll: () => void;
  success: (message: string, options?: ToastOptions) => number;
  error: (message: string, options?: ToastOptions) => number;
  warning: (message: string, options?: ToastOptions) => number;
  info: (message: string, options?: ToastOptions) => number;
}

const RealtySoftToast: RealtySoftToastModule = (function () {
  'use strict';

  let container: HTMLElement | null = null;
  let toasts: ToastData[] = [];
  let toastIdCounter = 0;

  const defaultOptions: Required<ToastOptions> = {
    duration: 4000,
    position: 'bottom-right',
    closable: true,
    pauseOnHover: true,
  };

  /**
   * Initialize toast container
   */
  function init(): void {
    if (container) return;

    container = document.createElement('div');
    container.className = 'rs-toast-container rs-toast-container--bottom-right';
    document.body.appendChild(container);
  }

  /**
   * Set container position
   */
  function setPosition(position: ToastPosition): void {
    if (!container) init();
    if (container) {
      container.className = `rs-toast-container rs-toast-container--${position}`;
    }
  }

  /**
   * Create a toast notification
   */
  function show(
    message: string,
    type: ToastType = 'info',
    options: ToastOptions = {}
  ): number {
    if (!container) init();

    const opts: Required<ToastOptions> = { ...defaultOptions, ...options };
    const id = ++toastIdCounter;

    const toast = document.createElement('div');
    toast.className = `rs-toast rs-toast--${type}`;
    toast.dataset.toastId = String(id);

    const icon = getIcon(type);

    toast.innerHTML = `
      <div class="rs-toast__icon">${icon}</div>
      <div class="rs-toast__content">
        <span class="rs-toast__message">${escapeHtml(message)}</span>
      </div>
      ${
        opts.closable
          ? `
        <button type="button" class="rs-toast__close" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `
          : ''
      }
      <div class="rs-toast__progress"></div>
    `;

    // Add progress bar animation
    const progressBar = toast.querySelector('.rs-toast__progress') as HTMLElement;
    if (progressBar) {
      progressBar.style.animationDuration = `${opts.duration}ms`;
    }

    // Bind events
    if (opts.closable) {
      const closeBtn = toast.querySelector('.rs-toast__close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          dismiss(id);
        });
      }
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let remainingTime = opts.duration;
    let startTime = Date.now();

    if (opts.pauseOnHover) {
      toast.addEventListener('mouseenter', () => {
        remainingTime -= Date.now() - startTime;
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (progressBar) {
          progressBar.style.animationPlayState = 'paused';
        }
      });

      toast.addEventListener('mouseleave', () => {
        startTime = Date.now();
        timeoutId = setTimeout(() => dismiss(id), remainingTime);
        if (progressBar) {
          progressBar.style.animationPlayState = 'running';
        }
      });
    }

    // Add to container
    if (container) {
      container.appendChild(toast);
    }

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('rs-toast--visible');
    });

    // Store reference
    toasts.push({ id, element: toast, timeoutId: null });

    // Auto dismiss
    timeoutId = setTimeout(() => dismiss(id), opts.duration);
    const toastData = toasts.find((t) => t.id === id);
    if (toastData) {
      toastData.timeoutId = timeoutId;
    }

    return id;
  }

  /**
   * Dismiss a toast
   */
  function dismiss(id: number): void {
    const toastData = toasts.find((t) => t.id === id);
    if (!toastData) return;

    if (toastData.timeoutId) {
      clearTimeout(toastData.timeoutId);
    }

    const toast = toastData.element;
    toast.classList.remove('rs-toast--visible');
    toast.classList.add('rs-toast--hiding');

    setTimeout(() => {
      toast.remove();
      toasts = toasts.filter((t) => t.id !== id);
    }, 300);
  }

  /**
   * Dismiss all toasts
   */
  function dismissAll(): void {
    toasts.forEach((t) => dismiss(t.id));
  }

  /**
   * Shorthand methods
   */
  function success(message: string, options?: ToastOptions): number {
    return show(message, 'success', options);
  }

  function error(message: string, options?: ToastOptions): number {
    return show(message, 'error', options);
  }

  function warning(message: string, options?: ToastOptions): number {
    return show(message, 'warning', options);
  }

  function info(message: string, options?: ToastOptions): number {
    return show(message, 'info', options);
  }

  /**
   * Get icon for toast type
   */
  function getIcon(type: ToastType): string {
    const icons: Record<ToastType, string> = {
      success:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
      error:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
      warning:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
    };
    return icons[type] || icons.info;
  }

  /**
   * Escape HTML
   */
  function escapeHtml(text: string): string {
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
    info,
  };
})();

// Make globally available
if (typeof window !== 'undefined') {
  (window as unknown as { RealtySoftToast: RealtySoftToastModule }).RealtySoftToast =
    RealtySoftToast;
}

// Export for ES modules
export { RealtySoftToast };
export type { RealtySoftToastModule };
export default RealtySoftToast;
