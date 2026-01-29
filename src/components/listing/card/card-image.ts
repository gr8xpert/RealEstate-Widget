/**
 * RealtySoft Widget v3 - Card Image Sub-Component
 * Renders image carousel with nav/dots/lazy-load, or single image.
 * Supports data-rs-max-images attribute.
 */

import { RSBaseComponent } from '../../base';
import { getCardProperty, escapeHtml, onElementVisible } from './card-utils';
import type {
  ComponentOptions,
  ComponentConstructor,
  RealtySoftModule,
  Property,
  ImageWithSizes,
} from '../../../types/index';

declare const RealtySoft: RealtySoftModule;

class RSCardImage extends RSBaseComponent {
  private property: Property | null = null;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    if (this.element.closest('.rs_property_grid')) return;
    onElementVisible(this.element, () => this.loadAndRender());
  }

  private async loadAndRender(): Promise<void> {
    this.property = await getCardProperty(this.element);
    if (!this.property) return;
    this.render();
    this.bindEvents();
  }

  render(): void {
    if (!this.property) return;

    const maxImages = parseInt(this.element.dataset.rsMaxImages || '5') || 5;
    const allImages = this.property.images || [];
    const images = allImages.slice(0, maxImages);
    const imagesWithSizes = ((this.property as Property & { imagesWithSizes?: ImageWithSizes[] }).imagesWithSizes || []).slice(0, maxImages);

    if (images.length === 0) {
      this.element.innerHTML = `<img src="/realtysoft/assets/placeholder.jpg" alt="${escapeHtml(this.property.title || '')}" loading="eager">`;
      return;
    }

    if (images.length === 1) {
      const imgData = imagesWithSizes[0];
      const srcset = this.buildSrcset(imgData);
      const srcsetAttr = srcset ? ` srcset="${srcset}" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"` : '';
      this.element.innerHTML = `<img src="${images[0]}"${srcsetAttr} alt="${escapeHtml(this.property.title || '')}" loading="eager">`;
      return;
    }

    // Build carousel
    const sizesAttr = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    this.element.innerHTML = `
      <div class="rs-card__carousel">
        <div class="rs-card__carousel-track">
          ${images.map((img, i) => {
            const imgData = imagesWithSizes[i];
            const srcset = this.buildSrcset(imgData);
            if (i === 0) {
              const srcsetAttr = srcset ? ` srcset="${srcset}" sizes="${sizesAttr}"` : '';
              return `<div class="rs-card__carousel-slide rs-card__carousel-slide--active">
                <img src="${img}"${srcsetAttr} loading="eager" fetchpriority="high" alt="">
              </div>`;
            } else {
              const dataSrcset = srcset ? ` data-srcset="${srcset}" data-sizes="${sizesAttr}"` : '';
              return `<div class="rs-card__carousel-slide">
                <img data-src="${img}"${dataSrcset} loading="lazy" alt="">
              </div>`;
            }
          }).join('')}
        </div>
        <button class="rs-card__carousel-prev" type="button" aria-label="Previous">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button class="rs-card__carousel-next" type="button" aria-label="Next">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
        <div class="rs-card__carousel-dots">
          ${images.map((_, i) => `<span class="rs-card__carousel-dot ${i === 0 ? 'rs-card__carousel-dot--active' : ''}" data-index="${i}"></span>`).join('')}
        </div>
      </div>
    `;
  }

  bindEvents(): void {
    const carousel = this.element.querySelector('.rs-card__carousel');
    if (!carousel) return;

    const slides = carousel.querySelectorAll('.rs-card__carousel-slide');
    const dots = carousel.querySelectorAll('.rs-card__carousel-dot');
    const imageCount = slides.length;
    let currentIndex = 0;

    const goToSlide = (index: number): void => {
      if (index < 0) index = imageCount - 1;
      if (index >= imageCount) index = 0;

      slides.forEach((s, i) => s.classList.toggle('rs-card__carousel-slide--active', i === index));
      dots.forEach((d, i) => d.classList.toggle('rs-card__carousel-dot--active', i === index));
      currentIndex = index;

      // Lazy load image
      const img = slides[index].querySelector('img') as HTMLImageElement | null;
      if (img && img.dataset.src && !img.src) {
        img.src = img.dataset.src;
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
          img.sizes = img.dataset.sizes || '';
        }
      }
    };

    carousel.querySelector('.rs-card__carousel-prev')?.addEventListener('click', (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      goToSlide(currentIndex - 1);
    });

    carousel.querySelector('.rs-card__carousel-next')?.addEventListener('click', (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      goToSlide(currentIndex + 1);
    });

    dots.forEach(dot => {
      dot.addEventListener('click', (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        goToSlide(parseInt((dot as HTMLElement).dataset.index || '0'));
      });
    });
  }

  private buildSrcset(imgData: ImageWithSizes | undefined): string {
    if (!imgData?.sizes) return '';
    const parts: string[] = [];
    if (imgData.sizes[256]) parts.push(`${imgData.sizes[256]} 256w`);
    if (imgData.sizes[512]) parts.push(`${imgData.sizes[512]} 512w`);
    if (imgData.sizes[768]) parts.push(`${imgData.sizes[768]} 768w`);
    return parts.join(', ');
  }
}

RealtySoft.registerComponent('rs_card_image', RSCardImage as unknown as ComponentConstructor);

export { RSCardImage };
export default RSCardImage;
