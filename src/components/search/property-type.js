/**
 * RealtySoft Widget v2 - Property Type Component
 * Variations: 1=Typeahead, 2=Flat Multi-select, 3=Accordion Multi-select, 4=Traditional Dropdown
 */

class RSPropertyType extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        this.lockedMode = this.isLocked('propertyType');
        this.propertyTypes = RealtySoftState.get('data.propertyTypes') || [];
        this.selectedIds = new Set();
        this.selectedName = this.getFilter('propertyTypeName') || '';
        this.isOpen = false;
        this.searchTerm = '';
        this.filteredTypes = [];
        this.highlightIndex = -1;
        this.expandedParents = new Set();

        // Initialize from existing filter
        const existingFilter = this.getFilter('propertyType');
        if (existingFilter) {
            if (Array.isArray(existingFilter)) {
                existingFilter.forEach(id => this.selectedIds.add(String(id)));
            } else {
                this.selectedIds.add(String(existingFilter));
            }
        }

        // If locked, find the property type name for display
        if (this.lockedMode && this.selectedIds.size > 0) {
            const lockedId = Array.from(this.selectedIds)[0];
            const lockedType = this.propertyTypes.find(t => String(t.id) === lockedId);
            if (lockedType) {
                this.selectedName = lockedType.name;
            }
        }

        this.render();

        // Apply locked styles if locked (but still show the component)
        if (this.lockedMode) {
            this.applyLockedStyle();
        } else {
            this.bindEvents();
        }

        // Subscribe to data updates
        this.subscribe('data.propertyTypes', (types) => {
            this.propertyTypes = types;
            this.updateList();
        });

        // Subscribe to filter changes
        this.subscribe('filters.propertyType', (value) => {
            if (value === null) {
                this.selectedIds.clear();
            }
            this.updateDisplay();
        });
    }

    // Get parent property types (no parent_id or parent_id = 0)
    getParentTypes() {
        return this.propertyTypes
            .filter(type => !type.parent_id || type.parent_id === '0' || type.parent_id === 0)
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    // Get child property types for a parent
    getChildTypes(parentId) {
        return this.propertyTypes
            .filter(type => type.parent_id == parentId)
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    // Get all child IDs for a parent
    getAllChildIds(parentId) {
        return this.getChildTypes(parentId).map(child => String(child.id));
    }

    // Check if all children of a parent are selected
    areAllChildrenSelected(parentId) {
        const childIds = this.getAllChildIds(parentId);
        return childIds.length > 0 && childIds.every(id => this.selectedIds.has(id));
    }

    render() {
        this.element.classList.add('rs-property-type', `rs-property-type--v${this.variation}`);

        switch (this.variation) {
            case '2':
                this.renderFlatMultiSelect();
                break;
            case '3':
                this.renderAccordionMultiSelect();
                break;
            case '4':
                this.renderTraditionalDropdown();
                break;
            default:
                this.renderTypeahead();
        }
    }

    // VARIATION 1: Search/Autocomplete (Single Select)
    renderTypeahead() {
        this.element.innerHTML = `
            <div class="rs-property-type__wrapper">
                <label class="rs-property-type__label">${this.label('search_property_type')}</label>
                <div class="rs-property-type__search-wrapper">
                    <input type="text"
                           class="rs-property-type__input"
                           placeholder="Enter property type"
                           value="${this.selectedName}"
                           autocomplete="off">
                    <button class="rs-property-type__clear" type="button" style="display: ${this.selectedName ? 'block' : 'none'}">×</button>
                </div>
                <div class="rs-property-type__dropdown" style="display: none;">
                    <div class="rs-property-type__list"></div>
                </div>
            </div>
        `;

        this.input = this.element.querySelector('.rs-property-type__input');
        this.dropdown = this.element.querySelector('.rs-property-type__dropdown');
        this.list = this.element.querySelector('.rs-property-type__list');
        this.clearBtn = this.element.querySelector('.rs-property-type__clear');

        this.filteredTypes = this.propertyTypes;
    }

    // VARIATION 2: Flat Multi-Select with Filter (styled like Location V3)
    renderFlatMultiSelect() {
        const count = this.selectedIds.size;
        const buttonText = count > 0 ? (count + ' selected') : this.label('search_property_type');
        const hasSelectionClass = count > 0 ? 'has-selection' : '';

        this.element.innerHTML = `
            <div class="rs-property-type__wrapper">
                <label class="rs-property-type__label">${this.label('search_property_type')}</label>
                <button type="button" class="rs-property-type__button ${hasSelectionClass}">
                    <span class="rs-property-type__button-text">${buttonText}</span>
                    <span class="rs-property-type__button-arrow">▼</span>
                </button>
                <div class="rs-property-type__tags"></div>
                <div class="rs-property-type__dropdown rs-property-type__dropdown--multiselect" style="display: none;">
                    <input type="text" class="rs-property-type__filter" placeholder="${this.label('search_location_placeholder') || 'Search...'}">
                    <div class="rs-property-type__list"></div>
                </div>
            </div>
        `;

        this.button = this.element.querySelector('.rs-property-type__button');
        this.buttonText = this.element.querySelector('.rs-property-type__button-text');
        this.tagsContainer = this.element.querySelector('.rs-property-type__tags');
        this.dropdown = this.element.querySelector('.rs-property-type__dropdown');
        this.filterInput = this.element.querySelector('.rs-property-type__filter');
        this.list = this.element.querySelector('.rs-property-type__list');

        this.renderFlatList();
        this.updateTags();
    }

    // VARIATION 3: Accordion Multi-Select with Filter
    renderAccordionMultiSelect() {
        const count = this.selectedIds.size;
        const buttonText = count > 0 ? `${count} type${count > 1 ? 's' : ''} selected` : this.label('search_property_type_placeholder');

        this.element.innerHTML = `
            <div class="rs-property-type__wrapper">
                <label class="rs-property-type__label">${this.label('search_property_type')}</label>
                <button type="button" class="rs-property-type__button">
                    <span class="rs-property-type__button-text">${buttonText}</span>
                    <span class="rs-property-type__button-arrow">▼</span>
                </button>
                <div class="rs-property-type__dropdown rs-property-type__dropdown--accordion" style="display: none;">
                    <input type="text" class="rs-property-type__filter" placeholder="Search property types...">
                    <div class="rs-property-type__list"></div>
                </div>
            </div>
        `;

        this.button = this.element.querySelector('.rs-property-type__button');
        this.buttonText = this.element.querySelector('.rs-property-type__button-text');
        this.dropdown = this.element.querySelector('.rs-property-type__dropdown');
        this.filterInput = this.element.querySelector('.rs-property-type__filter');
        this.list = this.element.querySelector('.rs-property-type__list');

        this.renderAccordionList();
    }

    // VARIATION 4: Traditional Hierarchical Dropdown (Single Select)
    renderTraditionalDropdown() {
        this.element.innerHTML = `
            <div class="rs-property-type__wrapper">
                <label class="rs-property-type__label">${this.label('search_property_type')}</label>
                <div class="rs-property-type__select-wrapper">
                    <select class="rs-property-type__select">
                        <option value="">${this.label('search_property_type_placeholder')}</option>
                    </select>
                </div>
            </div>
        `;

        this.select = this.element.querySelector('.rs-property-type__select');
        this.populateHierarchicalSelect();
    }

    // Update typeahead list (V1)
    updateTypeaheadList() {
        if (!this.list) return;

        const results = this.filteredTypes.slice(0, 10);

        if (results.length === 0) {
            this.list.innerHTML = '<div class="rs-property-type__no-results">No results found</div>';
            return;
        }

        this.list.innerHTML = results.map((type, index) => {
            const isParent = !type.parent_id || type.parent_id === '0' || type.parent_id === 0;
            return `
                <div class="rs-property-type__item ${index === this.highlightIndex ? 'rs-property-type__item--highlight' : ''}"
                     data-id="${type.id}"
                     data-name="${this.escapeHtml(type.name)}">
                    <span class="rs-property-type__item-text">${this.escapeHtml(type.name)}</span>
                    ${!isParent ? '<span class="rs-property-type__item-badge">Sub-type</span>' : ''}
                </div>
            `;
        }).join('');
    }

    // Render flat list with parent/child hierarchy (V2) - styled like Location V3
    renderFlatList(filterQuery = '') {
        if (!this.list) return;

        const parents = this.getParentTypes();
        const lowerQuery = filterQuery.toLowerCase();
        let html = '';

        parents.forEach(parent => {
            const parentMatches = (parent.name || '').toLowerCase().includes(lowerQuery);
            const children = this.getChildTypes(parent.id);
            const matchingChildren = children.filter(child =>
                (child.name || '').toLowerCase().includes(lowerQuery)
            );

            if (!filterQuery || parentMatches || matchingChildren.length > 0) {
                const parentChecked = this.areAllChildrenSelected(parent.id);

                // Parent item with gray background
                html += `
                    <div class="rs-property-type__item rs-property-type__item--parent" style="background: #f5f5f5; padding: 8px 12px; border-bottom: 1px solid #eee;">
                        <label class="rs-property-type__checkbox-label" style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox"
                                   class="rs-property-type__checkbox"
                                   value="${parent.id}"
                                   data-is-parent="true"
                                   data-name="${this.escapeHtml(parent.name)}"
                                   ${parentChecked ? 'checked' : ''}
                                   style="margin-right: 10px;">
                            <span class="rs-property-type__checkbox-text" style="font-weight: 600;">${this.escapeHtml(parent.name)}</span>
                        </label>
                    </div>
                `;

                const displayChildren = filterQuery ? matchingChildren : children;
                displayChildren.forEach(child => {
                    html += `
                        <div class="rs-property-type__item rs-property-type__item--child" style="padding: 8px 12px 8px 32px; border-bottom: 1px solid #eee;">
                            <label class="rs-property-type__checkbox-label" style="display: flex; align-items: center; cursor: pointer;">
                                <input type="checkbox"
                                       class="rs-property-type__checkbox"
                                       value="${child.id}"
                                       data-parent-id="${parent.id}"
                                       data-name="${this.escapeHtml(child.name)}"
                                       ${this.selectedIds.has(String(child.id)) ? 'checked' : ''}
                                       style="margin-right: 10px;">
                                <span class="rs-property-type__checkbox-text">${this.escapeHtml(child.name)}</span>
                            </label>
                        </div>
                    `;
                });
            }
        });

        this.list.innerHTML = html || '<div class="rs-property-type__no-results">No results found</div>';
    }

    // Render accordion list (V3)
    renderAccordionList(filterQuery = '') {
        if (!this.list) return;

        const parents = this.getParentTypes();
        const lowerQuery = filterQuery.toLowerCase();
        let html = '';

        parents.forEach(parent => {
            const parentMatches = (parent.name || '').toLowerCase().includes(lowerQuery);
            const children = this.getChildTypes(parent.id);
            const matchingChildren = children.filter(child =>
                (child.name || '').toLowerCase().includes(lowerQuery)
            );

            if (!filterQuery || parentMatches || matchingChildren.length > 0) {
                const isExpanded = this.expandedParents.has(String(parent.id)) || filterQuery;
                const parentChecked = this.areAllChildrenSelected(parent.id);
                const displayChildren = filterQuery ? matchingChildren : children;

                html += `
                    <div class="rs-property-type__accordion ${isExpanded ? 'rs-property-type__accordion--expanded' : ''}">
                        <div class="rs-property-type__accordion-header">
                            <label class="rs-property-type__checkbox-label" onclick="event.stopPropagation()">
                                <input type="checkbox"
                                       class="rs-property-type__checkbox"
                                       value="${parent.id}"
                                       data-is-parent="true"
                                       ${parentChecked ? 'checked' : ''}>
                                <span class="rs-property-type__checkbox-text"><strong>${this.escapeHtml(parent.name)}</strong></span>
                            </label>
                            <button type="button" class="rs-property-type__accordion-toggle" data-parent-id="${parent.id}">
                                ${isExpanded ? '−' : '+'}
                            </button>
                        </div>
                        <div class="rs-property-type__accordion-content" style="display: ${isExpanded ? 'block' : 'none'}">
                `;

                displayChildren.forEach(child => {
                    html += `
                        <div class="rs-property-type__item rs-property-type__item--child">
                            <label class="rs-property-type__checkbox-label">
                                <input type="checkbox"
                                       class="rs-property-type__checkbox"
                                       value="${child.id}"
                                       data-parent-id="${parent.id}"
                                       ${this.selectedIds.has(String(child.id)) ? 'checked' : ''}>
                                <span class="rs-property-type__checkbox-text">${this.escapeHtml(child.name)}</span>
                            </label>
                        </div>
                    `;
                });

                html += `</div></div>`;
            }
        });

        this.list.innerHTML = html || '<div class="rs-property-type__no-results">No results found</div>';
    }

    // Populate hierarchical select (V4)
    populateHierarchicalSelect() {
        if (!this.select) return;

        const parents = this.getParentTypes();
        let html = `<option value="">${this.label('search_property_type')}</option>`;

        parents.forEach(parent => {
            html += `<option value="${parent.id}">${this.escapeHtml(parent.name)}</option>`;

            const children = this.getChildTypes(parent.id);
            children.forEach(child => {
                html += `<option value="${child.id}">&nbsp;&nbsp;├─ ${this.escapeHtml(child.name)}</option>`;
            });
        });

        this.select.innerHTML = html;

        // Restore selection if any
        if (this.selectedIds.size > 0) {
            this.select.value = Array.from(this.selectedIds)[0];
        }
    }

    bindEvents() {
        switch (this.variation) {
            case '2':
                this.bindFlatMultiSelectEvents();
                break;
            case '3':
                this.bindAccordionMultiSelectEvents();
                break;
            case '4':
                this.bindTraditionalDropdownEvents();
                break;
            default:
                this.bindTypeaheadEvents();
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this.hideDropdown();
            }
        });
    }

    // Bind events for V1 (Typeahead)
    bindTypeaheadEvents() {
        // Don't show dropdown on focus - only show when user types (like YouTube search)
        this.input.addEventListener('blur', () => {
            setTimeout(() => this.hideDropdown(), 200);
        });

        this.input.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.clearBtn.style.display = e.target.value ? 'block' : 'none';

            // Only show dropdown when user starts typing
            if (e.target.value.length >= 1) {
                this.filterTypes();
                this.showDropdown();
            } else {
                this.hideDropdown();
            }
        });

        this.input.addEventListener('keydown', (e) => this.handleKeyboard(e));

        this.list.addEventListener('click', (e) => {
            const item = e.target.closest('.rs-property-type__item');
            if (item) {
                this.selectSingleType(item.dataset.id, item.dataset.name);
            }
        });

        this.clearBtn.addEventListener('click', () => this.clearSelection());
    }

    // Bind events for V2 (Flat Multi-Select)
    bindFlatMultiSelectEvents() {
        let filterDebounce;

        this.button.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleDropdown();
        });

        // Filter with 200ms debounce
        this.filterInput.addEventListener('input', (e) => {
            clearTimeout(filterDebounce);
            filterDebounce = setTimeout(() => {
                this.renderFlatList(e.target.value.trim());
            }, 200);
        });

        this.list.addEventListener('change', (e) => {
            const checkbox = e.target;
            if (!checkbox.classList.contains('rs-property-type__checkbox')) return;

            this.handleCheckboxChange(checkbox);
        });
    }

    // Bind events for V3 (Accordion Multi-Select)
    bindAccordionMultiSelectEvents() {
        let filterDebounce;

        this.button.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleDropdown();
        });

        // Filter with 200ms debounce
        this.filterInput.addEventListener('input', (e) => {
            clearTimeout(filterDebounce);
            filterDebounce = setTimeout(() => {
                this.renderAccordionList(e.target.value.trim());
            }, 200);
        });

        // Handle accordion toggle
        this.list.addEventListener('click', (e) => {
            const toggleBtn = e.target.closest('.rs-property-type__accordion-toggle');
            if (toggleBtn) {
                const parentId = toggleBtn.dataset.parentId;
                const accordion = toggleBtn.closest('.rs-property-type__accordion');
                const content = accordion.querySelector('.rs-property-type__accordion-content');
                const isExpanded = accordion.classList.contains('rs-property-type__accordion--expanded');

                if (isExpanded) {
                    accordion.classList.remove('rs-property-type__accordion--expanded');
                    content.style.display = 'none';
                    toggleBtn.textContent = '+';
                    this.expandedParents.delete(parentId);
                } else {
                    accordion.classList.add('rs-property-type__accordion--expanded');
                    content.style.display = 'block';
                    toggleBtn.textContent = '−';
                    this.expandedParents.add(parentId);
                }
            }
        });

        // Handle checkbox changes
        this.list.addEventListener('change', (e) => {
            const checkbox = e.target;
            if (!checkbox.classList.contains('rs-property-type__checkbox')) return;

            this.handleCheckboxChange(checkbox);
        });
    }

    // Bind events for V4 (Traditional Dropdown)
    bindTraditionalDropdownEvents() {
        this.select.addEventListener('change', (e) => {
            const value = e.target.value;
            if (value) {
                this.selectedIds.clear();
                this.selectedIds.add(value);
                const option = e.target.options[e.target.selectedIndex];
                this.setFilter('propertyType', parseInt(value));
                this.setFilter('propertyTypeName', option.text.replace(/^\s*├─\s*/, ''));
            } else {
                this.selectedIds.clear();
                this.setFilter('propertyType', null);
                this.setFilter('propertyTypeName', '');
            }
        });
    }

    // Handle checkbox change for multi-select variations
    handleCheckboxChange(checkbox) {
        const typeId = checkbox.value;
        const isParent = checkbox.dataset.isParent === 'true';

        if (isParent) {
            const childIds = this.getAllChildIds(typeId);

            if (checkbox.checked) {
                this.selectedIds.add(typeId);
                childIds.forEach(id => this.selectedIds.add(id));
            } else {
                this.selectedIds.delete(typeId);
                childIds.forEach(id => this.selectedIds.delete(id));
            }

            // Update child checkboxes in DOM
            this.list.querySelectorAll(`input[data-parent-id="${typeId}"]`).forEach(cb => {
                cb.checked = checkbox.checked;
            });
        } else {
            if (checkbox.checked) {
                this.selectedIds.add(typeId);
            } else {
                this.selectedIds.delete(typeId);
            }

            // Update parent checkbox state
            const parentId = checkbox.dataset.parentId;
            const parentCheckbox = this.list.querySelector(`input[value="${parentId}"][data-is-parent="true"]`);
            if (parentCheckbox) {
                parentCheckbox.checked = this.areAllChildrenSelected(parentId);
            }
        }

        this.updateButtonText();
        this.updateTags();
        this.updateFilters();
    }

    filterTypes() {
        if (!this.searchTerm) {
            this.filteredTypes = this.propertyTypes;
        } else {
            this.filteredTypes = this.propertyTypes.filter(type =>
                (type.name || '').toLowerCase().includes(this.searchTerm)
            );
        }
        this.highlightIndex = -1;
        this.updateTypeaheadList();
    }

    showDropdown() {
        if (!this.dropdown) return;
        this.isOpen = true;
        this.dropdown.style.display = 'block';
    }

    hideDropdown() {
        if (!this.dropdown) return;
        this.isOpen = false;
        this.dropdown.style.display = 'none';
        this.highlightIndex = -1;
    }

    toggleDropdown() {
        if (this.isOpen) {
            this.hideDropdown();
        } else {
            this.showDropdown();
        }
    }

    handleKeyboard(e) {
        if (!this.isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                this.showDropdown();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.highlightIndex = Math.min(this.highlightIndex + 1, this.filteredTypes.slice(0, 10).length - 1);
                this.updateTypeaheadList();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.highlightIndex = Math.max(this.highlightIndex - 1, 0);
                this.updateTypeaheadList();
                break;
            case 'Enter':
                e.preventDefault();
                if (this.highlightIndex >= 0 && this.filteredTypes[this.highlightIndex]) {
                    const type = this.filteredTypes[this.highlightIndex];
                    this.selectSingleType(type.id, type.name);
                }
                break;
            case 'Escape':
                this.hideDropdown();
                break;
        }
    }

    selectSingleType(id, name) {
        this.selectedIds.clear();
        this.selectedIds.add(String(id));
        this.selectedName = name;

        this.setFilter('propertyType', parseInt(id));
        this.setFilter('propertyTypeName', name);

        if (this.input) {
            this.input.value = name;
            this.clearBtn.style.display = 'block';
        }

        this.hideDropdown();
    }

    clearSelection() {
        this.selectedIds.clear();
        this.selectedName = '';
        this.setFilter('propertyType', null);
        this.setFilter('propertyTypeName', '');

        if (this.input) {
            this.input.value = '';
            this.clearBtn.style.display = 'none';
        }
        if (this.select) {
            this.select.value = '';
        }

        this.updateButtonText();
    }

    updateButtonText() {
        if (!this.buttonText) return;
        const count = this.selectedIds.size;
        if (count > 0) {
            this.buttonText.textContent = count + ' selected';
            this.button.classList.add('has-selection');
        } else {
            this.buttonText.textContent = this.label('search_property_type');
            this.button.classList.remove('has-selection');
        }
    }

    // Update tags for V2 (similar to Location V3)
    updateTags() {
        if (!this.tagsContainer) return;

        if (this.selectedIds.size === 0) {
            this.tagsContainer.innerHTML = '';
            return;
        }

        // Get selected type names
        const selectedTypes = [];
        this.selectedIds.forEach(id => {
            const type = this.propertyTypes.find(t => String(t.id) === String(id));
            if (type) {
                selectedTypes.push({ id: type.id, name: type.name });
            }
        });

        const html = selectedTypes.map(type => `
            <span class="rs-property-type__tag" style="display: inline-flex; align-items: center; background: #2e7d32; color: white; padding: 4px 10px; border-radius: 4px; margin: 4px 4px 4px 0; font-size: 13px;">
                ${this.escapeHtml(type.name)}
                <button type="button" class="rs-property-type__tag-remove" data-id="${type.id}" style="background: none; border: none; color: white; margin-left: 6px; cursor: pointer; font-size: 14px; padding: 0; line-height: 1;">&times;</button>
            </span>
        `).join('');

        this.tagsContainer.innerHTML = html;

        // Bind remove events
        this.tagsContainer.querySelectorAll('.rs-property-type__tag-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                this.selectedIds.delete(String(id));
                this.updateButtonText();
                this.updateTags();
                this.updateFilters();
                this.renderFlatList(this.filterInput?.value || '');
            });
        });
    }

    updateFilters() {
        if (this.selectedIds.size > 0) {
            const ids = Array.from(this.selectedIds).map(id => parseInt(id));
            this.setFilter('propertyType', ids.length === 1 ? ids[0] : ids);
        } else {
            this.setFilter('propertyType', null);
        }
    }

    updateList() {
        switch (this.variation) {
            case '2':
                this.renderFlatList();
                break;
            case '3':
                this.renderAccordionList();
                break;
            case '4':
                this.populateHierarchicalSelect();
                break;
            default:
                this.filterTypes();
        }
    }

    updateDisplay() {
        const currentFilter = this.getFilter('propertyType');

        // Variation 1: Typeahead
        if (this.input) {
            this.input.value = this.selectedName || '';
        }

        // Variation 4: Traditional dropdown
        if (this.select) {
            this.select.value = this.selectedIds.size > 0 ? Array.from(this.selectedIds)[0] : '';
        }

        // Variations 2 & 3: Multi-select - reset if no filter
        if ((this.variation === '2' || this.variation === '3') && !currentFilter) {
            this.selectedIds.clear();
            this.selectedName = '';
            // Update checkbox states
            this.element.querySelectorAll('.rs-property-type__checkbox').forEach(checkbox => {
                checkbox.checked = false;
            });
            // Update tags
            this.updateTags();
        }

        this.updateButtonText();
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Register component
RealtySoft.registerComponent('rs_property_type', RSPropertyType);
