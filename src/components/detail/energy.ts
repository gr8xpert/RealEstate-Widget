/**
 * RealtySoft Widget v3 - Detail Energy Component
 * Energy certificate display (Rating, CO2, Image)
 */

import { RSBaseComponent } from '../base';
import type { ComponentOptions, Property, RealtySoftStateModule } from '../../types/index';

// Declare globals
declare const RealtySoftState: RealtySoftStateModule;

interface ColorSet {
  [key: string]: string;
}

class RSDetailEnergy extends RSBaseComponent {
  private property: Property | null = null;

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

    const p = this.property;
    // Check if we have any energy data
    if (!p.energy_rating && !p.co2_rating && !p.energy_certificate_image) {
      this.element.style.display = 'none';
      return;
    }

    this.render();
  }

  render(): void {
    const p = this.property!;
    this.element.classList.add('rs-detail-energy');

    this.element.innerHTML = `
      <h3 class="rs-detail-energy__title">${this.label('detail_energy_certificate')}</h3>
      <div class="rs-detail-energy__content">
        ${p.energy_rating ? this.renderRatingScale('energy', p.energy_rating, this.label('detail_energy_rating')) : ''}
        ${p.co2_rating ? this.renderRatingScale('co2', p.co2_rating, this.label('detail_co2_rating')) : ''}
        ${p.energy_consumption ? `
          <div class="rs-detail-energy__consumption">
            <span class="rs-detail-energy__consumption-label">${this.label('detail_energy_consumption')}</span>
            <span class="rs-detail-energy__consumption-value">${p.energy_consumption}</span>
          </div>
        ` : ''}
        ${p.energy_certificate_image ? `
          <div class="rs-detail-energy__image">
            <img src="${this.getAbsoluteImageUrl(p.energy_certificate_image)}" alt="${this.label('detail_energy_certificate')}" loading="lazy">
          </div>
        ` : ''}
      </div>
    `;
  }

  private renderRatingScale(type: string, rating: string, label: string): string {
    const ratings = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const colors: Record<string, ColorSet> = {
      energy: {
        A: '#00a651', B: '#4cb848', C: '#8dc63f', D: '#fff200',
        E: '#f7941d', F: '#f26522', G: '#ed1c24'
      },
      co2: {
        A: '#9e7cc3', B: '#b18fcf', C: '#c4a2db', D: '#d7b5e7',
        E: '#eac8f3', F: '#f5dbff', G: '#ffe0ff'
      }
    };

    const currentRating = rating.toUpperCase().charAt(0);
    const colorSet = colors[type] || colors.energy;

    return `
      <div class="rs-detail-energy__scale rs-detail-energy__scale--${type}">
        <span class="rs-detail-energy__scale-label">${label}</span>
        <div class="rs-detail-energy__scale-bars">
          ${ratings.map(r => {
            const isActive = r === currentRating;
            const color = colorSet[r] || '#ccc';
            return `
              <div class="rs-detail-energy__scale-bar ${isActive ? 'rs-detail-energy__scale-bar--active' : ''}"
                   style="background-color: ${color}">
                <span class="rs-detail-energy__scale-letter">${r}</span>
              </div>
            `;
          }).join('')}
        </div>
        <span class="rs-detail-energy__scale-value">${rating}</span>
      </div>
    `;
  }

  private getAbsoluteImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;

    // If relative URL, prepend API base URL
    const apiUrl = RealtySoftState.get<string>('config.apiUrl') || '';
    if (apiUrl) {
      const baseUrl = apiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
      return baseUrl + (url.startsWith('/') ? '' : '/') + url;
    }
    return url;
  }
}

// Note: This component is NOT auto-registered.
// It is instantiated by RSDetail.populateComponents() when property data is available.

export { RSDetailEnergy };
export default RSDetailEnergy;
