/**
 * RealtySoft Widget v3 - reCAPTCHA Integration
 * Handles loading and validation of Google reCAPTCHA v2
 */

import type { RealtySoftStateModule } from '../types/index';

// Declare global
declare const RealtySoftState: RealtySoftStateModule;

// Extend window for grecaptcha
declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      render: (container: string | HTMLElement, options: {
        sitekey: string;
        callback?: (token: string) => void;
        'expired-callback'?: () => void;
        'error-callback'?: () => void;
        theme?: 'light' | 'dark';
        size?: 'normal' | 'compact';
      }) => number;
      reset: (widgetId?: number) => void;
      getResponse: (widgetId?: number) => string;
    };
    onRecaptchaLoad?: () => void;
  }
}

interface RecaptchaWidget {
  widgetId: number;
  container: HTMLElement;
  token: string;
}

class RealtySoftRecaptcha {
  private static instance: RealtySoftRecaptcha;
  private scriptLoaded: boolean = false;
  private scriptLoading: boolean = false;
  private loadCallbacks: Array<() => void> = [];
  private widgets: Map<string, RecaptchaWidget> = new Map();

  private constructor() {}

  static getInstance(): RealtySoftRecaptcha {
    if (!RealtySoftRecaptcha.instance) {
      RealtySoftRecaptcha.instance = new RealtySoftRecaptcha();
    }
    return RealtySoftRecaptcha.instance;
  }

  /**
   * Check if reCAPTCHA is enabled (site key is configured)
   */
  isEnabled(): boolean {
    const siteKey = RealtySoftState.get<string>('config.recaptchaSiteKey');
    return !!siteKey && siteKey.length > 10;
  }

  /**
   * Get the site key
   */
  getSiteKey(): string {
    return RealtySoftState.get<string>('config.recaptchaSiteKey') || '';
  }

  /**
   * Load reCAPTCHA script from Google
   */
  loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Already loaded
      if (this.scriptLoaded && window.grecaptcha) {
        resolve();
        return;
      }

      // Currently loading - add to callback queue
      if (this.scriptLoading) {
        this.loadCallbacks.push(resolve);
        return;
      }

      // Check if script already exists in DOM
      if (document.querySelector('script[src*="recaptcha/api.js"]')) {
        if (window.grecaptcha) {
          this.scriptLoaded = true;
          resolve();
        } else {
          // Script exists but not ready yet
          this.loadCallbacks.push(resolve);
          this.scriptLoading = true;
        }
        return;
      }

      this.scriptLoading = true;
      this.loadCallbacks.push(resolve);

      // Set up global callback
      window.onRecaptchaLoad = () => {
        this.scriptLoaded = true;
        this.scriptLoading = false;
        this.loadCallbacks.forEach(cb => cb());
        this.loadCallbacks = [];
      };

      // Create and append script
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        this.scriptLoading = false;
        reject(new Error('Failed to load reCAPTCHA script'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Render reCAPTCHA widget in a container
   * @param containerId - Unique ID for the container element
   * @param container - The DOM element to render into
   * @param options - Optional configuration
   */
  async render(
    containerId: string,
    container: HTMLElement,
    options: { theme?: 'light' | 'dark'; size?: 'normal' | 'compact'; onVerify?: (token: string) => void } = {}
  ): Promise<number> {
    if (!this.isEnabled()) {
      return -1;
    }

    await this.loadScript();

    if (!window.grecaptcha) {
      throw new Error('reCAPTCHA not available');
    }

    return new Promise((resolve) => {
      window.grecaptcha!.ready(() => {
        // Clear existing widget if re-rendering
        if (this.widgets.has(containerId)) {
          const existing = this.widgets.get(containerId)!;
          try {
            window.grecaptcha!.reset(existing.widgetId);
          } catch (_) {
            // Widget might have been removed from DOM
          }
        }

        // Clear container
        container.innerHTML = '';

        const widget: RecaptchaWidget = {
          widgetId: -1,
          container,
          token: ''
        };

        const widgetId = window.grecaptcha!.render(container, {
          sitekey: this.getSiteKey(),
          callback: (token: string) => {
            widget.token = token;
            if (options.onVerify) {
              options.onVerify(token);
            }
          },
          'expired-callback': () => {
            widget.token = '';
          },
          'error-callback': () => {
            widget.token = '';
          },
          theme: options.theme || 'light',
          size: options.size || 'normal'
        });

        widget.widgetId = widgetId;
        this.widgets.set(containerId, widget);

        resolve(widgetId);
      });
    });
  }

  /**
   * Get the response token for a widget
   */
  getResponse(containerId: string): string {
    const widget = this.widgets.get(containerId);
    if (!widget || !window.grecaptcha) {
      return '';
    }

    try {
      return window.grecaptcha.getResponse(widget.widgetId);
    } catch (_) {
      return widget.token || '';
    }
  }

  /**
   * Reset a widget
   */
  reset(containerId: string): void {
    const widget = this.widgets.get(containerId);
    if (!widget || !window.grecaptcha) {
      return;
    }

    try {
      window.grecaptcha.reset(widget.widgetId);
      widget.token = '';
    } catch (_) {
      // Widget might have been removed from DOM
    }
  }

  /**
   * Validate that reCAPTCHA has been completed
   * Returns true if reCAPTCHA is disabled or if a valid token exists
   */
  isValid(containerId: string): boolean {
    if (!this.isEnabled()) {
      return true; // No validation needed if not enabled
    }

    const token = this.getResponse(containerId);
    return token.length > 0;
  }

  /**
   * Create the HTML for a reCAPTCHA container
   */
  getContainerHTML(containerId: string): string {
    if (!this.isEnabled()) {
      return '';
    }

    return `<div class="rs-recaptcha-container" id="${containerId}"></div>`;
  }
}

// Export singleton instance
export const RealtySoftRecaptchaHelper = RealtySoftRecaptcha.getInstance();

// Assign to window for global access
if (typeof window !== 'undefined') {
  (window as unknown as { RealtySoftRecaptcha: RealtySoftRecaptcha }).RealtySoftRecaptcha =
    RealtySoftRecaptcha.getInstance();
}

export default RealtySoftRecaptchaHelper;
