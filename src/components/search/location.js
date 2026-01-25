/**
 * RealtySoft Widget v2 - Location Component
 * Variations:
 *   1 = Search/Autocomplete (typeahead single select)
 *   2 = Two Dropdowns (parent + child cascading multi-select)
 *   3 = Hierarchical Multi-Select (single dropdown with tree)
 *   4 = Traditional Dropdown (simple select with hierarchy)
 */

class RSLocation extends RSBaseComponent {
    constructor(element, options) {
        super(element, options);
    }

    init() {
        this.lockedMode = this.isLocked('location');
        this.locations = RealtySoftState.get('data.locations') || [];
        this.selectedLocations = new Set();
        this.selectedLocation = this.getFilter('location');
        this.selectedName = this.getFilter('locationName') || '';
        this.isOpen = false;
        this.searchTerm = '';
        this.filteredLocations = [];
        this.highlightIndex = -1;

        // For variation 2 (two dropdowns)
        this.selectedParents = new Set();
        this.selectedChildren = new Set();

        // Get parent/child type from data attributes or defaults
        this.parentType = this.element.dataset.rsParentType || 'municipality';
        this.childType = this.element.dataset.rsChildType || 'city';

        // If locked, find the location name for display
        if (this.lockedMode) {
            const lockedValue = this.getFilter('location');
            if (lockedValue) {
                const lockedLocation = this.locations.find(loc => loc.id == lockedValue);
                if (lockedLocation) {
                    this.selectedName = lockedLocation.name;
                }
            }
        }

        this.render();

        // Apply locked styles if locked (but still show the component)
        if (this.lockedMode) {
            this.applyLockedStyle();
        } else {
            this.bindEvents();
        }

        // Subscribe to location data updates
        this.subscribe('data.locations', (locations) => {
            this.locations = locations;
            this.updateLocationData();
        });

        // Subscribe to filter changes
        this.subscribe('filters.location', (value) => {
            this.selectedLocation = value;
            this.updateDisplay();
        });
    }

    getParentLocations() {
        // Filter by parentType (default: municipality)
        return this.locations.filter(loc => {
            if (loc.type) {
                return loc.type.toLowerCase() === this.parentType.toLowerCase();
            }
            return false;
        }).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    getChildLocations(parentId) {
        // Get locations of childType that have this parentId
        return this.locations.filter(loc => {
            const pid = loc.parent_id;
            const matchesParent = pid && String(pid) === String(parentId);
            const matchesType = loc.type && loc.type.toLowerCase() === this.childType.toLowerCase();
            return matchesParent && matchesType;
        }).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    // Get all children by type (ignoring parent_id)
    getAllChildrenByType() {
        return this.locations.filter(loc => {
            return loc.type && loc.type.toLowerCase() === this.childType.toLowerCase();
        }).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    // Get all descendants of a location (recursive)
    getAllDescendants(parentId) {
        const descendants = [];
        const children = this.locations.filter(loc => {
            const pid = loc.parent_id;
            return pid && String(pid) === String(parentId);
        });
        children.forEach(child => {
            descendants.push(child);
            descendants.push(...this.getAllDescendants(child.id));
        });
        return descendants;
    }

    getAllLocationsFlat() {
        const result = [];

        // Build full hierarchy tree recursively
        const buildFlat = (parentId, level) => {
            const children = this.locations.filter(loc => {
                const pid = loc.parent_id;
                if (parentId === null) {
                    return pid === false || pid === null || pid === undefined || pid === 0 || pid === '0' || pid === '';
                }
                return pid && String(pid) === String(parentId);
            }).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

            children.forEach(loc => {
                result.push({ ...loc, level });
                buildFlat(loc.id, level + 1);
            });
        };

        buildFlat(null, 0);
        return result;
    }

    render() {
        console.log(`[RealtySoft] Location render() - variation: ${this.variation}`);
        this.element.classList.add('rs-location', `rs-location--v${this.variation}`);

        switch (this.variation) {
            case '2':
                console.log('[RealtySoft] Location: rendering Two Dropdowns');
                this.renderTwoDropdowns();
                break;
            case '3':
                console.log('[RealtySoft] Location: rendering Hierarchical MultiSelect');
                this.renderHierarchicalMultiSelect();
                break;
            case '4':
                console.log('[RealtySoft] Location: rendering Traditional Dropdown');
                this.renderTraditionalDropdown();
                break;
            default:
                console.log('[RealtySoft] Location: rendering Typeahead');
                this.renderTypeahead();
        }
    }

    // VARIATION 1: Search/Autocomplete (Typeahead)
    renderTypeahead() {
        this.element.innerHTML = `
            <div class="rs-location__wrapper">
                <label class="rs-location__label">${this.label('search_location')}</label>
                <div class="rs-location__input-wrapper">
                    <input type="text"
                           class="rs-location__input"
                           placeholder="Enter location name"
                           value="${this.selectedName}"
                           autocomplete="off">
                    ${this.selectedLocation ? '<button class="rs-location__clear" type="button">&times;</button>' : ''}
                </div>
                <div class="rs-location__dropdown" style="display: none;">
                    <ul class="rs-location__list"></ul>
                </div>
            </div>
        `;

        this.input = this.element.querySelector('.rs-location__input');
        this.dropdown = this.element.querySelector('.rs-location__dropdown');
        this.list = this.element.querySelector('.rs-location__list');
        this.clearBtn = this.element.querySelector('.rs-location__clear');
    }

    // VARIATION 2: Two Dropdowns (Parent + Child)
    renderTwoDropdowns() {
        const parentLabel = this.label('search_location') || 'Location';
        const childLabel = this.label('search_sublocation') || 'Sub-location';

        this.element.innerHTML = `
            <div class="rs-location__wrapper rs-location__two-dropdowns">
                <label class="rs-location__label">${this.label('search_location')}</label>

                <div class="rs-location__parent-container">
                    <button type="button" class="rs-location__multi-btn rs-location__parent-btn">
                        ${parentLabel}
                    </button>
                    <div class="rs-location__dropdown rs-location__parent-dropdown" style="display: none;">
                        <input type="text" class="rs-location__filter-input" placeholder="${this.label('search_location_placeholder') || 'Search location...'}">
                        <div class="rs-location__checklist rs-location__parent-list"></div>
                    </div>
                </div>

                <div class="rs-location__child-container" style="margin-top: 10px;">
                    <button type="button" class="rs-location__multi-btn rs-location__child-btn" disabled>
                        ${childLabel}
                    </button>
                    <div class="rs-location__dropdown rs-location__child-dropdown" style="display: none;">
                        <input type="text" class="rs-location__filter-input" placeholder="${this.label('search_location_placeholder') || 'Search location...'}">
                        <div class="rs-location__checklist rs-location__child-list"></div>
                    </div>
                </div>
            </div>
        `;

        this.parentLabel = parentLabel;
        this.childLabel = childLabel;

        this.parentBtn = this.element.querySelector('.rs-location__parent-btn');
        this.parentDropdown = this.element.querySelector('.rs-location__parent-dropdown');
        this.parentList = this.element.querySelector('.rs-location__parent-list');
        this.parentFilter = this.parentDropdown.querySelector('.rs-location__filter-input');

        this.childBtn = this.element.querySelector('.rs-location__child-btn');
        this.childDropdown = this.element.querySelector('.rs-location__child-dropdown');
        this.childList = this.element.querySelector('.rs-location__child-list');
        this.childFilter = this.childDropdown.querySelector('.rs-location__filter-input');

        this.renderParentChecklist();
    }

    renderParentChecklist(filter = '') {
        const parents = this.getParentLocations();
        const filtered = filter
            ? parents.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
            : parents;

        if (filtered.length === 0) {
            this.parentList.innerHTML = '<div class="rs-location__no-results">No results</div>';
            return;
        }

        this.parentList.innerHTML = filtered.map(loc => `
            <label class="rs-location__check-item">
                <input type="checkbox" value="${loc.id}" data-name="${this.escapeHtml(loc.name)}"
                       ${this.selectedParents.has(String(loc.id)) ? 'checked' : ''}>
                <span>${this.escapeHtml(loc.name)}</span>
                ${loc.count ? `<span class="rs-location__count">(${loc.count})</span>` : ''}
            </label>
        `).join('');
    }

    renderChildChecklist(filter = '') {
        if (this.selectedParents.size === 0) {
            this.childList.innerHTML = '<div class="rs-location__no-results">Select a municipality first</div>';
            return;
        }

        let children = [];
        this.selectedParents.forEach(parentId => {
            children = children.concat(this.getChildLocations(parentId));
        });

        const filtered = filter
            ? children.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()))
            : children;

        if (filtered.length === 0) {
            this.childList.innerHTML = '<div class="rs-location__no-results">No areas found</div>';
            return;
        }

        this.childList.innerHTML = filtered.map(loc => `
            <label class="rs-location__check-item">
                <input type="checkbox" value="${loc.id}" data-name="${this.escapeHtml(loc.name)}"
                       ${this.selectedChildren.has(String(loc.id)) ? 'checked' : ''}>
                <span>${this.escapeHtml(loc.name)}</span>
                ${loc.count ? `<span class="rs-location__count">(${loc.count})</span>` : ''}
            </label>
        `).join('');
    }

    // VARIATION 3: Hierarchical Multi-Select
    renderHierarchicalMultiSelect() {
        this.element.innerHTML = `
            <div class="rs-location__wrapper">
                <label class="rs-location__label">${this.label('search_location')}</label>
                <button type="button" class="rs-location__multi-btn">
                    ${this.label('search_location') || 'Location'}
                </button>
                <div class="rs-location__dropdown" style="display: none;">
                    <input type="text" class="rs-location__filter-input" placeholder="${this.label('search_location_placeholder') || 'Search location...'}">
                    <div class="rs-location__checklist rs-location__hierarchy-list"></div>
                </div>
                <div class="rs-location__tags"></div>
            </div>
        `;

        this.multiBtn = this.element.querySelector('.rs-location__multi-btn');
        this.dropdown = this.element.querySelector('.rs-location__dropdown');
        this.filterInput = this.element.querySelector('.rs-location__filter-input');
        this.hierarchyList = this.element.querySelector('.rs-location__hierarchy-list');
        this.tagsContainer = this.element.querySelector('.rs-location__tags');

        this.renderHierarchyChecklist();
    }

    renderHierarchyChecklist(filter = '') {
        const parents = this.getParentLocations();
        let html = '';

        parents.forEach(parent => {
            const children = this.getChildLocations(parent.id);
            const matchesFilter = !filter || parent.name.toLowerCase().includes(filter.toLowerCase());
            const childrenMatch = children.some(c => c.name.toLowerCase().includes(filter.toLowerCase()));

            if (!matchesFilter && !childrenMatch) return;

            html += `
                <div class="rs-location__parent-group">
                    <label class="rs-location__check-item rs-location__check-item--parent">
                        <input type="checkbox" value="${parent.id}" data-name="${this.escapeHtml(parent.name)}" data-is-parent="true"
                               ${this.selectedLocations.has(String(parent.id)) ? 'checked' : ''}>
                        <strong>${this.escapeHtml(parent.name)}</strong>
                        ${parent.count ? `<span class="rs-location__count">(${parent.count})</span>` : ''}
                    </label>
                    <div class="rs-location__children">
            `;

            children.forEach(child => {
                if (filter && !child.name.toLowerCase().includes(filter.toLowerCase()) && !matchesFilter) return;
                html += `
                    <label class="rs-location__check-item rs-location__check-item--child">
                        <input type="checkbox" value="${child.id}" data-name="${this.escapeHtml(child.name)}" data-parent-id="${parent.id}"
                               ${this.selectedLocations.has(String(child.id)) ? 'checked' : ''}>
                        <span>${this.escapeHtml(child.name)}</span>
                        ${child.count ? `<span class="rs-location__count">(${child.count})</span>` : ''}
                    </label>
                `;
            });

            html += `</div></div>`;
        });

        this.hierarchyList.innerHTML = html || '<div class="rs-location__no-results">No locations found</div>';
    }

    // VARIATION 4: Traditional Dropdown
    renderTraditionalDropdown() {
        this.element.innerHTML = `
            <div class="rs-location__wrapper">
                <label class="rs-location__label">${this.label('search_location')}</label>
                <div class="rs-location__select-wrapper">
                    <select class="rs-location__select">
                        <option value="">${this.label('search_location')}</option>
                    </select>
                </div>
            </div>
        `;

        this.select = this.element.querySelector('.rs-location__select');
        this.populateTraditionalSelect();
    }

    populateTraditionalSelect() {
        if (!this.select) return;

        let html = `<option value="">${this.label('search_location')}</option>`;

        // Get municipalities (parents) and cities (children)
        const municipalities = this.locations
            .filter(loc => loc.type && loc.type.toLowerCase() === this.parentType.toLowerCase())
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        municipalities.forEach(municipality => {
            // Add municipality with type label
            html += `<option value="${municipality.id}">${this.escapeHtml(municipality.name)} • ${municipality.type}</option>`;

            // Find all cities that belong to this municipality (direct or via descendants)
            const descendantIds = new Set();
            const collectDescendants = (parentId) => {
                this.locations.forEach(loc => {
                    if (loc.parent_id && String(loc.parent_id) === String(parentId)) {
                        descendantIds.add(loc.id);
                        collectDescendants(loc.id);
                    }
                });
            };
            collectDescendants(municipality.id);

            // Get cities that are descendants of this municipality
            const cities = this.locations
                .filter(loc => {
                    if (!loc.type || loc.type.toLowerCase() !== this.childType.toLowerCase()) return false;
                    // Check if city is direct child or descendant
                    return (loc.parent_id && String(loc.parent_id) === String(municipality.id)) ||
                           descendantIds.has(loc.id);
                })
                .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

            cities.forEach(city => {
                html += `<option value="${city.id}">&nbsp;&nbsp;├─ ${this.escapeHtml(city.name)}</option>`;
            });
        });

        this.select.innerHTML = html;

        if (this.selectedLocation) {
            this.select.value = this.selectedLocation;
        }
    }

    bindEvents() {
        switch (this.variation) {
            case '2':
                this.bindTwoDropdownsEvents();
                break;
            case '3':
                this.bindHierarchicalEvents();
                break;
            case '4':
                this.bindTraditionalEvents();
                break;
            default:
                this.bindTypeaheadEvents();
        }
    }

    bindTypeaheadEvents() {
        let debounceTimer;

        // Don't show dropdown on focus - only show when user types (like YouTube search)
        this.input.addEventListener('blur', () => {
            setTimeout(() => this.hideDropdown(), 200);
        });

        this.input.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            this.searchTerm = e.target.value;

            // Only show dropdown when user starts typing
            if (this.searchTerm.length >= 1) {
                debounceTimer = setTimeout(() => {
                    this.searchLocations(this.searchTerm);
                    this.showDropdown();
                }, 300);
            } else {
                this.hideDropdown();
            }
        });

        this.input.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });

        this.list.addEventListener('click', (e) => {
            const item = e.target.closest('.rs-location__item');
            if (item) {
                this.selectLocation(item.dataset.id, item.dataset.name);
            }
        });

        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => this.clearSelection());
        }

        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this.hideDropdown();
            }
        });
    }

    bindTwoDropdownsEvents() {
        // Debounce timers for filter inputs
        let parentFilterDebounce;
        let childFilterDebounce;

        // Parent button toggle
        this.parentBtn.addEventListener('click', () => {
            this.toggleDropdown(this.parentDropdown);
            this.hideDropdown(this.childDropdown);
        });

        // Child button toggle
        this.childBtn.addEventListener('click', () => {
            if (!this.childBtn.disabled) {
                this.toggleDropdown(this.childDropdown);
                this.hideDropdown(this.parentDropdown);
            }
        });

        // Parent filter with 200ms debounce
        this.parentFilter.addEventListener('input', (e) => {
            clearTimeout(parentFilterDebounce);
            parentFilterDebounce = setTimeout(() => {
                this.renderParentChecklist(e.target.value);
            }, 200);
        });

        // Child filter with 200ms debounce
        this.childFilter.addEventListener('input', (e) => {
            clearTimeout(childFilterDebounce);
            childFilterDebounce = setTimeout(() => {
                this.renderChildChecklist(e.target.value);
            }, 200);
        });

        // Parent checkbox changes
        this.parentList.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                const id = String(e.target.value);
                if (e.target.checked) {
                    this.selectedParents.add(id);
                } else {
                    this.selectedParents.delete(id);
                    // Remove children of this parent
                    this.getChildLocations(id).forEach(child => {
                        this.selectedChildren.delete(String(child.id));
                    });
                }
                this.updateTwoDropdownsState();
            }
        });

        // Child checkbox changes
        this.childList.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                const id = String(e.target.value);
                if (e.target.checked) {
                    this.selectedChildren.add(id);
                } else {
                    this.selectedChildren.delete(id);
                }
                this.updateTwoDropdownsState();
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this.hideDropdown(this.parentDropdown);
                this.hideDropdown(this.childDropdown);
            }
        });
    }

    updateTwoDropdownsState() {
        // Update parent button text
        if (this.selectedParents.size > 0) {
            this.parentBtn.textContent = this.selectedParents.size + ' selected';
            this.parentBtn.classList.add('has-selection');
            this.childBtn.disabled = false;
        } else {
            this.parentBtn.textContent = this.parentLabel || this.label('search_location') || 'Location';
            this.parentBtn.classList.remove('has-selection');
            this.childBtn.disabled = true;
            this.childBtn.textContent = this.childLabel || this.label('search_sublocation') || 'Sub-location';
        }

        // Update child button text
        if (this.selectedChildren.size > 0) {
            this.childBtn.textContent = this.selectedChildren.size + ' selected';
            this.childBtn.classList.add('has-selection');
        } else if (!this.childBtn.disabled) {
            this.childBtn.textContent = this.childLabel || this.label('search_sublocation') || 'Sub-location';
            this.childBtn.classList.remove('has-selection');
        }

        // Render child list
        this.renderChildChecklist(this.childFilter?.value || '');

        // Update filter - use children if selected, otherwise parents
        const locationIds = this.selectedChildren.size > 0
            ? Array.from(this.selectedChildren)
            : Array.from(this.selectedParents);

        if (locationIds.length > 0) {
            this.setFilter('location', locationIds.join(','));
        } else {
            this.setFilter('location', null);
        }
    }

    bindHierarchicalEvents() {
        let filterDebounce;

        this.multiBtn.addEventListener('click', () => {
            this.toggleDropdown(this.dropdown);
        });

        // Filter with 200ms debounce
        this.filterInput.addEventListener('input', (e) => {
            clearTimeout(filterDebounce);
            filterDebounce = setTimeout(() => {
                this.renderHierarchyChecklist(e.target.value);
            }, 200);
        });

        this.hierarchyList.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                const id = String(e.target.value);
                const name = e.target.dataset.name;
                const isParent = e.target.dataset.isParent === 'true';

                if (e.target.checked) {
                    this.selectedLocations.add(id);
                    // If parent, optionally select all children
                    if (isParent) {
                        const children = this.getChildLocations(id);
                        children.forEach(child => {
                            this.selectedLocations.add(String(child.id));
                        });
                        this.renderHierarchyChecklist(this.filterInput.value);
                    }
                } else {
                    this.selectedLocations.delete(id);
                    if (isParent) {
                        const children = this.getChildLocations(id);
                        children.forEach(child => {
                            this.selectedLocations.delete(String(child.id));
                        });
                        this.renderHierarchyChecklist(this.filterInput.value);
                    }
                }

                this.updateHierarchicalState();
            }
        });

        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this.hideDropdown(this.dropdown);
            }
        });
    }

    updateHierarchicalState() {
        // Update button
        if (this.selectedLocations.size > 0) {
            this.multiBtn.textContent = this.selectedLocations.size + ' selected';
            this.multiBtn.classList.add('has-selection');
        } else {
            this.multiBtn.textContent = this.label('search_location') || 'Location';
            this.multiBtn.classList.remove('has-selection');
        }

        // Update tags
        this.updateTags();

        // Update filter
        if (this.selectedLocations.size > 0) {
            this.setFilter('location', Array.from(this.selectedLocations).join(','));
        } else {
            this.setFilter('location', null);
        }
    }

    updateTags() {
        if (!this.tagsContainer) return;

        const tags = [];
        this.selectedLocations.forEach(id => {
            const loc = this.locations.find(l => String(l.id) === id);
            if (loc) {
                tags.push(`
                    <span class="rs-location__tag">
                        ${this.escapeHtml(loc.name)}
                        <button type="button" class="rs-location__tag-remove" data-id="${id}">&times;</button>
                    </span>
                `);
            }
        });

        this.tagsContainer.innerHTML = tags.join('');

        // Bind tag remove events
        this.tagsContainer.querySelectorAll('.rs-location__tag-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.selectedLocations.delete(id);
                this.renderHierarchyChecklist(this.filterInput?.value || '');
                this.updateHierarchicalState();
            });
        });
    }

    bindTraditionalEvents() {
        this.select.addEventListener('change', (e) => {
            const option = e.target.options[e.target.selectedIndex];
            this.setFilter('location', e.target.value ? parseInt(e.target.value) : null);
            this.setFilter('locationName', option.text.trim() || '');
        });
    }

    toggleDropdown(dropdown) {
        if (!dropdown) return;
        if (dropdown.style.display === 'none') {
            dropdown.style.display = 'block';
        } else {
            dropdown.style.display = 'none';
        }
    }

    showDropdown(dropdown) {
        const dd = dropdown || this.dropdown;
        if (!dd) return;
        this.isOpen = true;
        dd.style.display = 'block';
    }

    hideDropdown(dropdown) {
        const dd = dropdown || this.dropdown;
        if (!dd) return;
        this.isOpen = false;
        dd.style.display = 'none';
        this.highlightIndex = -1;
    }

    /**
     * Search locations using client-side filtering on preloaded data
     * This is instant since all locations are already loaded
     */
    searchLocations(term) {
        if (!term || term.length < 2) {
            this.filteredLocations = this.getAllLocationsFlat().slice(0, 15);
            this.updateDropdownItems();
            return;
        }

        // Client-side filtering for instant results
        const lowerTerm = term.toLowerCase();
        this.filteredLocations = this.getAllLocationsFlat().filter(loc =>
            loc.name.toLowerCase().includes(lowerTerm)
        ).slice(0, 20);
        this.updateDropdownItems();
    }

    updateDropdownItems() {
        if (!this.list) return;

        if (this.filteredLocations.length === 0) {
            this.list.innerHTML = `<li class="rs-location__empty">${this.label('no_results') || 'No results found'}</li>`;
            return;
        }

        this.list.innerHTML = this.filteredLocations.map((loc, index) => {
            // Show type label on right side for all except City
            const locType = loc.type ? loc.type.toLowerCase() : '';
            const showType = locType && locType !== 'city';
            const typeLabel = showType ? `<span class="rs-location__type">${this.escapeHtml(loc.type)}</span>` : '';

            return `
                <li class="rs-location__item ${loc.level ? 'rs-location__item--child' : ''} ${index === this.highlightIndex ? 'rs-location__item--highlight' : ''}"
                    data-id="${loc.id}"
                    data-name="${this.escapeHtml(loc.name)}">
                    <span class="rs-location__name">
                        ${loc.level ? '<span class="rs-location__indent"></span>' : ''}
                        ${this.escapeHtml(loc.name)}
                    </span>
                    ${typeLabel}
                    ${loc.count ? `<span class="rs-location__count">(${loc.count})</span>` : ''}
                </li>
            `;
        }).join('');
    }

    updateLocationData() {
        switch (this.variation) {
            case '2':
                this.renderParentChecklist();
                break;
            case '3':
                this.renderHierarchyChecklist();
                break;
            case '4':
                this.populateTraditionalSelect();
                break;
            default:
                this.filteredLocations = this.getAllLocationsFlat().slice(0, 15);
                this.updateDropdownItems();
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
                this.highlightIndex = Math.min(this.highlightIndex + 1, this.filteredLocations.length - 1);
                this.updateDropdownItems();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.highlightIndex = Math.max(this.highlightIndex - 1, 0);
                this.updateDropdownItems();
                break;
            case 'Enter':
                e.preventDefault();
                if (this.highlightIndex >= 0 && this.filteredLocations[this.highlightIndex]) {
                    const loc = this.filteredLocations[this.highlightIndex];
                    this.selectLocation(loc.id, loc.name);
                }
                break;
            case 'Escape':
                this.hideDropdown();
                break;
        }
    }

    selectLocation(id, name) {
        this.selectedLocation = parseInt(id);
        this.selectedName = name;

        this.setFilter('location', this.selectedLocation);
        this.setFilter('locationName', name);

        this.updateDisplay();
        this.hideDropdown();
    }

    clearSelection() {
        this.selectedLocation = null;
        this.selectedName = '';
        this.setFilter('location', null);
        this.setFilter('locationName', '');
        this.updateDisplay();
    }

    updateDisplay() {
        // Variation 1: Typeahead
        if (this.input) {
            this.input.value = this.selectedName || '';
        }

        // Variation 4: Traditional dropdown
        if (this.select) {
            this.select.value = this.selectedLocation || '';
        }

        const clearBtn = this.element.querySelector('.rs-location__clear');
        if (clearBtn) {
            clearBtn.style.display = this.selectedLocation ? 'block' : 'none';
        }

        // Variation 2: Two dropdowns - reset if no location
        if (this.variation === '2' && !this.selectedLocation) {
            this.selectedParents.clear();
            this.selectedChildren.clear();
            this.renderParentChecklist();
            this.renderChildChecklist();
            if (this.parentBtn) {
                this.parentBtn.textContent = this.parentLabel || this.label('search_location') || 'Location';
                this.parentBtn.classList.remove('has-selection');
            }
            if (this.childBtn) {
                this.childBtn.textContent = this.childLabel || this.label('search_sublocation') || 'Sub-location';
                this.childBtn.classList.remove('has-selection');
                this.childBtn.disabled = true;
            }
        }

        // Variation 3: Hierarchical multi-select - reset if no location
        if (this.variation === '3' && !this.selectedLocation) {
            this.selectedLocations.clear();
            this.renderHierarchyChecklist();
            this.updateTags();
            if (this.multiBtn) {
                this.multiBtn.textContent = this.label('search_location') || 'Location';
                this.multiBtn.classList.remove('has-selection');
            }
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Register component
RealtySoft.registerComponent('rs_location', RSLocation);
