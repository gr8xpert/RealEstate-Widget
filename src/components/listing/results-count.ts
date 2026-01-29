/**
 * RealtySoft Widget v3 - Results Count Component
 * Displays "X properties found"
 */

import { RSBaseComponent } from '../base';
import type { ComponentOptions, ComponentConstructor, RealtySoftModule } from '../../types/index';

// Declare global RealtySoft
declare const RealtySoft: RealtySoftModule;

class RSResultsCount extends RSBaseComponent {
  private total: number = 0;
  private loading: boolean = false;

  constructor(element: HTMLElement, options: ComponentOptions = {}) {
    super(element, options);
    this.init();
  }

  init(): void {
    this.total = 0;
    this.loading = false;

    this.render();

    this.subscribe<number>('results.total', (total) => {
      this.total = total;
      this.updateDisplay();
    });

    this.subscribe<boolean>('ui.loading', (loading) => {
      this.loading = loading;
      this.updateDisplay();
    });
  }

  render(): void {
    this.element.classList.add('rs-results-count');
    this.updateDisplay();
  }

  private updateDisplay(): void {
    if (this.loading) {
      this.element.innerHTML = `<span class="rs-results-count__text rs-results-count__text--loading">${this.label('results_loading')}</span>`;
      return;
    }

    let text: string;
    if (this.total === 0) {
      text = this.label('results_count_zero');
    } else if (this.total === 1) {
      text = this.label('results_count_one');
    } else {
      text = this.label('results_count', { count: this.total.toLocaleString() });
    }

    this.element.innerHTML = `<span class="rs-results-count__text">${text}</span>`;
  }
}

// Register component
RealtySoft.registerComponent('rs_results_count', RSResultsCount as unknown as ComponentConstructor);

export { RSResultsCount };
export default RSResultsCount;
