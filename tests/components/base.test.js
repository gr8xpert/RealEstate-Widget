/**
 * Tests for RSBaseComponent
 * Tests: initialization, lifecycle, subscriptions, helpers
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the state module first (dependency)
const stateCode = fs.readFileSync(
  path.resolve(__dirname, '../../src/core/state.js'),
  'utf-8'
);

// Load the labels module (dependency)
const labelsCode = fs.readFileSync(
  path.resolve(__dirname, '../../src/core/labels.js'),
  'utf-8'
);

// Load the base component
const baseCode = fs.readFileSync(
  path.resolve(__dirname, '../../src/components/base.js'),
  'utf-8'
);

// Create all modules in a browser-like environment
function createEnvironment() {
  // Create State
  const stateModuleCode = stateCode.replace(
    /if \(typeof module !== 'undefined'[\s\S]*$/,
    ''
  );
  const stateFn = new Function('localStorage', `${stateModuleCode}; return RealtySoftState;`);
  const State = stateFn(globalThis.localStorage);

  // Create Labels
  const labelsModuleCode = labelsCode.replace(
    /if \(typeof module !== 'undefined'[\s\S]*$/,
    ''
  );
  const labelsFn = new Function(
    'navigator',
    'document',
    'Intl',
    `${labelsModuleCode}; return RealtySoftLabels;`
  );
  const Labels = labelsFn(
    { language: 'en-US', userLanguage: 'en-US' },
    { documentElement: { lang: 'en' } },
    Intl
  );
  Labels.init('en_US');

  // Create Base Component with dependencies
  const baseModuleCode = baseCode.replace(
    /if \(typeof module !== 'undefined'[\s\S]*$/,
    ''
  );
  const baseFn = new Function(
    'RealtySoftState',
    'RealtySoftLabels',
    'RealtySoft',
    'document',
    `${baseModuleCode}; return RSBaseComponent;`
  );

  // Mock RealtySoft controller
  const mockRealtySoft = {
    setFilter: vi.fn(),
  };

  const BaseComponent = baseFn(State, Labels, mockRealtySoft, document);

  return { State, Labels, BaseComponent, mockRealtySoft };
}

describe('RSBaseComponent', () => {
  let State, Labels, BaseComponent, mockRealtySoft;
  let testElement;

  beforeEach(() => {
    const env = createEnvironment();
    State = env.State;
    Labels = env.Labels;
    BaseComponent = env.BaseComponent;
    mockRealtySoft = env.mockRealtySoft;

    // Create a test element
    testElement = document.createElement('div');
    testElement.id = 'test-component';
    document.body.appendChild(testElement);
  });

  afterEach(() => {
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
  });

  describe('constructor', () => {
    it('should initialize with element and options', () => {
      const component = new BaseComponent(testElement, { variation: '2' });

      expect(component.element).toBe(testElement);
      expect(component.options.variation).toBe('2');
      expect(component.variation).toBe('2');
    });

    it('should use default variation if not provided', () => {
      const component = new BaseComponent(testElement);

      expect(component.variation).toBe('1');
    });

    it('should mark element as initialized', () => {
      const component = new BaseComponent(testElement);

      expect(testElement.dataset.rsInit).toBe('true');
    });

    it('should call init on construction', () => {
      const initSpy = vi.spyOn(BaseComponent.prototype, 'init');
      const component = new BaseComponent(testElement);

      expect(initSpy).toHaveBeenCalled();
      initSpy.mockRestore();
    });
  });

  describe('init', () => {
    it('should call render and bindEvents', () => {
      const renderSpy = vi.spyOn(BaseComponent.prototype, 'render');
      const bindEventsSpy = vi.spyOn(BaseComponent.prototype, 'bindEvents');

      const component = new BaseComponent(testElement);

      expect(renderSpy).toHaveBeenCalled();
      expect(bindEventsSpy).toHaveBeenCalled();

      renderSpy.mockRestore();
      bindEventsSpy.mockRestore();
    });
  });

  describe('subscribe', () => {
    it('should subscribe to state changes', () => {
      const component = new BaseComponent(testElement);
      const callback = vi.fn();

      component.subscribe('filters.location', callback);
      State.set('filters.location', 123);

      expect(callback).toHaveBeenCalledWith(123, null, 'filters.location');
    });

    it('should track subscriptions for cleanup', () => {
      const component = new BaseComponent(testElement);
      const callback = vi.fn();

      component.subscribe('filters.location', callback);

      expect(component.subscriptions.length).toBe(1);
    });

    it('should return unsubscribe function', () => {
      const component = new BaseComponent(testElement);
      const callback = vi.fn();

      const unsubscribe = component.subscribe('filters.location', callback);
      unsubscribe();
      State.set('filters.location', 456);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('label', () => {
    it('should get labels from Labels module', () => {
      const component = new BaseComponent(testElement);

      const label = component.label('search_button');

      expect(label).toBe('Search');
    });

    it('should support replacements', () => {
      const component = new BaseComponent(testElement);

      const label = component.label('results_count', { count: 10 });

      expect(label).toBe('10 properties found');
    });
  });

  describe('isLocked', () => {
    it('should check if filter is locked', () => {
      State.setLockedFilters({ location: 100 });
      const component = new BaseComponent(testElement);

      expect(component.isLocked('location')).toBe(true);
      expect(component.isLocked('priceMin')).toBe(false);
    });
  });

  describe('applyLockedStyle', () => {
    it('should add locked class to element', () => {
      const component = new BaseComponent(testElement);

      component.applyLockedStyle();

      expect(testElement.classList.contains('rs-filter--locked')).toBe(true);
      expect(testElement.getAttribute('title')).toBe(
        'This filter is pre-set for this page'
      );
    });
  });

  describe('setFilter', () => {
    it('should call RealtySoft.setFilter', () => {
      const component = new BaseComponent(testElement);

      component.setFilter('location', 200);

      expect(mockRealtySoft.setFilter).toHaveBeenCalledWith('location', 200);
    });
  });

  describe('getFilter', () => {
    it('should get filter value from state', () => {
      State.set('filters.priceMin', 100000);
      const component = new BaseComponent(testElement);

      const value = component.getFilter('priceMin');

      expect(value).toBe(100000);
    });
  });

  describe('createElement', () => {
    it('should create element with tag and class', () => {
      const component = new BaseComponent(testElement);

      const el = component.createElement('div', 'my-class');

      expect(el.tagName).toBe('DIV');
      expect(el.className).toBe('my-class');
    });

    it('should create element with innerHTML', () => {
      const component = new BaseComponent(testElement);

      const el = component.createElement('span', 'label', 'Hello');

      expect(el.innerHTML).toBe('Hello');
    });

    it('should handle empty class', () => {
      const component = new BaseComponent(testElement);

      const el = component.createElement('div', '', 'Content');

      expect(el.className).toBe('');
      expect(el.innerHTML).toBe('Content');
    });
  });

  describe('destroy', () => {
    it('should unsubscribe all subscriptions', () => {
      const component = new BaseComponent(testElement);
      const callback = vi.fn();

      component.subscribe('filters.location', callback);
      component.destroy();

      State.set('filters.location', 789);
      expect(callback).not.toHaveBeenCalled();
    });

    it('should clear element innerHTML', () => {
      const component = new BaseComponent(testElement);
      testElement.innerHTML = '<p>Content</p>';

      component.destroy();

      expect(testElement.innerHTML).toBe('');
    });

    it('should remove data attributes', () => {
      const component = new BaseComponent(testElement);

      component.destroy();

      expect(testElement.dataset.rsInit).toBeUndefined();
    });

    it('should clear subscriptions array', () => {
      const component = new BaseComponent(testElement);
      component.subscribe('filters.location', vi.fn());

      component.destroy();

      expect(component.subscriptions.length).toBe(0);
    });
  });

  describe('subclass usage', () => {
    it('should allow subclassing with custom render', () => {
      class CustomComponent extends BaseComponent {
        render() {
          this.element.innerHTML = '<p>Custom Content</p>';
        }
      }

      const component = new CustomComponent(testElement);

      expect(testElement.innerHTML).toBe('<p>Custom Content</p>');
    });

    it('should allow subclassing with custom bindEvents', () => {
      const clickHandler = vi.fn();

      class ClickableComponent extends BaseComponent {
        render() {
          this.element.innerHTML = '<button>Click</button>';
        }

        bindEvents() {
          this.element.querySelector('button').addEventListener('click', clickHandler);
        }
      }

      const component = new ClickableComponent(testElement);
      testElement.querySelector('button').click();

      expect(clickHandler).toHaveBeenCalled();
    });
  });
});
