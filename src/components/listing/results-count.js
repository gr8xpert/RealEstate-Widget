/**
 * RealtySoft Widget v2 - Results Count Component
 * Displays "X properties found"
 */

class RSResultsCount extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        this.total = 0;
        this.loading = false;

        this.render();

        this.subscribe('results.total', (total) => {
            this.total = total;
            this.updateDisplay();
        });

        this.subscribe('ui.loading', (loading) => {
            this.loading = loading;
            this.updateDisplay();
        });
    }

    render() {
        this.element.classList.add('rs-results-count');
        this.updateDisplay();
    }

    updateDisplay() {
        if (this.loading) {
            this.element.innerHTML = `<span class="rs-results-count__text rs-results-count__text--loading">${this.label('results_loading')}</span>`;
            return;
        }

        let text;
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
RealtySoft.registerComponent('rs_results_count', RSResultsCount);
