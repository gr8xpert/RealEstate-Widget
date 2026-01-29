/**
 * RealtySoft Widget v3 - Wishlist List Component (Combined)
 * Full wishlist page - backward compatible combined component
 * Uses modular sub-components internally
 */

import { RSBaseComponent } from '../base';
import type {
  ComponentOptions,
  ComponentConstructor,
  RealtySoftModule
} from '../../types/index';
import { WishlistManager } from '../../core/wishlist-manager';
import { RSWishlistSharedBanner } from './wishlist-shared-banner';
import { RSWishlistHeader } from './wishlist-header';
import { RSWishlistActions } from './wishlist-actions';
import { RSWishlistSort } from './wishlist-sort';
import { RSWishlistEmpty } from './wishlist-empty';
import { RSWishlistGrid } from './wishlist-grid';
import { RSWishlistCompareBtn } from './wishlist-compare-btn';
import { RSWishlistModals } from './wishlist-modals';

// Declare globals
declare const RealtySoft: RealtySoftModule;

// Extended HTMLElement with component reference
interface RSHTMLElement extends HTMLElement {
  _rsComponent?: RSBaseComponent;
}

// Sub-component mapping
interface ComponentMapping {
  selector: string;
  Component: new (el: HTMLElement, opts: ComponentOptions) => RSBaseComponent;
}

class RSWishlistList extends RSBaseComponent {
  private isSharedView: boolean = false;
  private sharedRefNos: string[] = [];
  private subComponents: RSBaseComponent[] = [];
  private loader: HTMLElement | null = null;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.isSharedView = WishlistManager.isSharedView();
    this.sharedRefNos = this.isSharedView ? (WishlistManager.loadSharedWishlist() || []) : [];
    this.subComponents = [];

    this.renderStructure();
    this.initSubComponents();
  }

  /**
   * render() is called by the controller on language change.
   * We check if DOM is already built to avoid destroying sub-components.
   */
  render(): void {
    // If DOM is already rendered (has sub-component containers), just update loader text
    const hasRendered = this.element.querySelector('.rs-wishlist-list__loader');
    if (hasRendered) {
      const loaderText = this.element.querySelector('.rs-wishlist-list__loader p');
      if (loaderText) {
        loaderText.textContent = this.label('results_loading') || 'Loading...';
      }
      return;
    }

    // If not rendered yet, do initial render
    this.renderStructure();
    this.initSubComponents();
  }

  /**
   * Initial render that creates the DOM structure (only called once in init)
   */
  private renderStructure(): void {
    this.element.classList.add('rs-wishlist-list');

    // Create container structure that positions all sub-components
    this.element.innerHTML = `
      <!-- Shared Banner -->
      <div class="rs_wishlist_shared_banner"></div>

      <!-- Header -->
      <div class="rs-wishlist-list__header">
        <div class="rs-wishlist-list__header-left">
          <div class="rs_wishlist_header"></div>
        </div>
      </div>

      <!-- Actions Bar -->
      <div class="rs-wishlist-actions-wrapper">
        <div class="rs_wishlist_actions"></div>
        <div class="rs_wishlist_sort"></div>
      </div>

      <!-- Loading State -->
      <div class="rs-wishlist-list__loader">
        <div class="rs-wishlist-list__spinner"></div>
        <p>${this.label('results_loading') || 'Loading...'}</p>
      </div>

      <!-- Empty State -->
      <div class="rs_wishlist_empty"></div>

      <!-- Property Grid -->
      <div class="rs_wishlist_grid"></div>

      <!-- Floating Compare Button -->
      <div class="rs_wishlist_compare_btn"></div>

      <!-- Modals -->
      <div class="rs_wishlist_modals"></div>
    `;

    // Cache DOM references
    this.loader = this.element.querySelector('.rs-wishlist-list__loader');

    // Listen for wishlist changes to toggle loader
    window.addEventListener(WishlistManager.EVENTS.CHANGED, () => {
      this.hideLoader();
    });

    // Hide loader after short delay to let sub-components initialize
    setTimeout(() => this.hideLoader(), 100);
  }

  private initSubComponents(): void {
    // Initialize each sub-component within this combined view
    const componentMappings: ComponentMapping[] = [
      { selector: '.rs_wishlist_shared_banner', Component: RSWishlistSharedBanner },
      { selector: '.rs_wishlist_header', Component: RSWishlistHeader },
      { selector: '.rs_wishlist_actions', Component: RSWishlistActions },
      { selector: '.rs_wishlist_sort', Component: RSWishlistSort },
      { selector: '.rs_wishlist_empty', Component: RSWishlistEmpty },
      { selector: '.rs_wishlist_grid', Component: RSWishlistGrid },
      { selector: '.rs_wishlist_compare_btn', Component: RSWishlistCompareBtn },
      { selector: '.rs_wishlist_modals', Component: RSWishlistModals }
    ];

    componentMappings.forEach(({ selector, Component }) => {
      const el = this.element.querySelector<RSHTMLElement>(selector);
      if (el && typeof Component !== 'undefined') {
        try {
          const instance = new Component(el, this.options);
          this.subComponents.push(instance);
          el._rsComponent = instance;
        } catch (error) {
          console.warn(`[Wishlist] Failed to initialize ${selector}:`, error);
        }
      }
    });
  }

  private hideLoader(): void {
    if (this.loader) {
      this.loader.style.display = 'none';
    }
  }

  private showLoader(): void {
    if (this.loader) {
      this.loader.style.display = 'flex';
    }
  }

  bindEvents(): void {
    // Events are handled by sub-components
  }

  // Public API for backward compatibility
  getProperties(): unknown[] {
    const gridEl = this.element.querySelector<RSHTMLElement>('.rs_wishlist_grid');
    const gridComponent = gridEl?._rsComponent as RSWishlistGrid | undefined;
    return gridComponent ? gridComponent.getProperties() : [];
  }

  openShareModal(): void {
    WishlistManager.openModal('share');
  }

  openEmailModal(): void {
    WishlistManager.openModal('email');
  }

  openNoteModal(refNo: string): void {
    WishlistManager.openModal('note', { refNo });
  }

  openCompareModal(): void {
    WishlistManager.openModal('compare');
  }

  downloadPDF(): void {
    WishlistManager.openModal('pdf');
  }

  destroy(): void {
    // Destroy all sub-components
    this.subComponents.forEach(component => {
      if (component && typeof component.destroy === 'function') {
        component.destroy();
      }
    });
    this.subComponents = [];

    super.destroy();
  }
}

// Register component
RealtySoft.registerComponent('rs_wishlist_list', RSWishlistList as unknown as ComponentConstructor);

export { RSWishlistList };
export default RSWishlistList;
