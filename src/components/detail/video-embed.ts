/**
 * RealtySoft Widget v3 - Detail Video Embed Component
 * Displays embedded video (YouTube/Vimeo) directly on the page
 *
 * Usage: <div class="rs_detail_video_embed"></div>
 */

import { RSBaseComponent } from '../base';
import type { ComponentOptions, Property } from '../../types/index';

class RSDetailVideoEmbed extends RSBaseComponent {
  private property: Property | null = null;
  private videoUrl: string = '';
  private embedUrl: string = '';

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.property = this.options?.property as Property | null;

    if (!this.property) {
      this.element.style.display = 'none';
      return;
    }

    this.videoUrl = this.property.video_url || '';

    if (!this.videoUrl) {
      this.element.style.display = 'none';
      return;
    }

    this.embedUrl = this.getEmbedUrl(this.videoUrl);

    if (!this.embedUrl) {
      this.element.style.display = 'none';
      return;
    }

    this.render();
  }

  render(): void {
    this.element.classList.add('rs-detail-video-embed');

    this.element.innerHTML = `
      <div class="rs-detail-video-embed__header">
        <h3 class="rs-detail-video-embed__title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          ${this.label('detail_video_tour') || 'Video Tour'}
        </h3>
      </div>
      <div class="rs-detail-video-embed__container">
        <iframe
          src="${this.embedUrl}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"
          class="rs-detail-video-embed__iframe"
        ></iframe>
      </div>
    `;
  }

  private getEmbedUrl(url: string): string {
    // YouTube - various URL formats
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // Already an embed URL
    if (url.includes('youtube.com/embed') || url.includes('player.vimeo.com')) {
      return url;
    }

    return '';
  }
}

// Note: This component is NOT auto-registered.
// It is instantiated by RSDetail.populateComponents() when property data is available.

export { RSDetailVideoEmbed };
export default RSDetailVideoEmbed;
