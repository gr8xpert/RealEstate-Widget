/**
 * RealtySoft Widget v2 - Reference Component
 * Single text input for property reference search
 */

class RSReference extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        this.lockedMode = this.isLocked('ref');
        this.value = this.getFilter('ref') || '';

        this.render();

        // Apply locked styles if locked (but still show the component)
        if (this.lockedMode) {
            this.applyLockedStyle();
        } else {
            this.bindEvents();
        }

        this.subscribe('filters.ref', (value) => {
            this.value = value || '';
            this.updateDisplay();
        });
    }

    render() {
        this.element.classList.add('rs-reference');

        this.element.innerHTML = `
            <div class="rs-reference__wrapper">
                <label class="rs-reference__label">${this.label('search_reference')}</label>
                <div class="rs-reference__input-wrapper">
                    <input type="text"
                           class="rs-reference__input"
                           placeholder="${this.label('search_reference')}"
                           value="${this.value}"
                           autocomplete="off">
                    ${this.value ? '<button class="rs-reference__clear" type="button">&times;</button>' : ''}
                </div>
            </div>
        `;

        this.input = this.element.querySelector('.rs-reference__input');
        this.clearBtn = this.element.querySelector('.rs-reference__clear');
    }

    bindEvents() {
        let debounceTimer;

        this.input.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.setFilter('ref', e.target.value.trim() || '');
                this.updateClearButton();
            }, 300);
        });

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.setFilter('ref', this.input.value.trim() || '');
                RealtySoft.search();
            }
        });

        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => {
                this.input.value = '';
                this.setFilter('ref', '');
                this.updateClearButton();
            });
        }
    }

    updateDisplay() {
        if (this.input) {
            this.input.value = this.value;
        }
        this.updateClearButton();
    }

    updateClearButton() {
        let clearBtn = this.element.querySelector('.rs-reference__clear');
        const hasValue = this.input && this.input.value.trim();

        if (hasValue && !clearBtn) {
            clearBtn = document.createElement('button');
            clearBtn.className = 'rs-reference__clear';
            clearBtn.type = 'button';
            clearBtn.innerHTML = '&times;';
            clearBtn.addEventListener('click', () => {
                this.input.value = '';
                this.setFilter('ref', '');
                this.updateClearButton();
            });
            this.element.querySelector('.rs-reference__input-wrapper').appendChild(clearBtn);
        } else if (!hasValue && clearBtn) {
            clearBtn.remove();
        }
    }
}

// Register component
RealtySoft.registerComponent('rs_ref', RSReference);
