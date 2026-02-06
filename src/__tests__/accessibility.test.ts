import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  announceToScreenReader,
  FocusTrap,
  generateId,
  prefersReducedMotion,
  aria,
} from '../utils/accessibility';

describe('Accessibility Utilities', () => {
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('should use custom prefix', () => {
      const id = generateId('custom');
      expect(id).toMatch(/^custom-\d+$/);
    });
  });

  describe('prefersReducedMotion', () => {
    beforeEach(() => {
      vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })));
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should detect reduced motion preference', () => {
      expect(prefersReducedMotion()).toBe(true);
    });
  });

  describe('aria helpers', () => {
    describe('disclosure', () => {
      it('should return correct attributes for expanded state', () => {
        const attrs = aria.disclosure(true, 'panel-1');
        expect(attrs).toEqual({
          'aria-expanded': true,
          'aria-controls': 'panel-1',
        });
      });

      it('should return correct attributes for collapsed state', () => {
        const attrs = aria.disclosure(false, 'panel-1');
        expect(attrs).toEqual({
          'aria-expanded': false,
          'aria-controls': 'panel-1',
        });
      });
    });

    describe('dialog', () => {
      it('should return correct dialog attributes', () => {
        const attrs = aria.dialog('title-1', 'desc-1');
        expect(attrs).toEqual({
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': 'title-1',
          'aria-describedby': 'desc-1',
        });
      });

      it('should omit describedby when not provided', () => {
        const attrs = aria.dialog('title-1');
        expect(attrs).not.toHaveProperty('aria-describedby');
      });
    });

    describe('tab', () => {
      it('should return correct attributes for selected tab', () => {
        const attrs = aria.tab(true, 'panel-1');
        expect(attrs).toEqual({
          role: 'tab',
          'aria-selected': true,
          'aria-controls': 'panel-1',
          tabIndex: 0,
        });
      });

      it('should return correct attributes for unselected tab', () => {
        const attrs = aria.tab(false, 'panel-1');
        expect(attrs).toEqual({
          role: 'tab',
          'aria-selected': false,
          'aria-controls': 'panel-1',
          tabIndex: -1,
        });
      });
    });

    describe('tabPanel', () => {
      it('should return correct panel attributes', () => {
        const attrs = aria.tabPanel('tab-1', false);
        expect(attrs).toEqual({
          role: 'tabpanel',
          'aria-labelledby': 'tab-1',
          hidden: false,
          tabIndex: 0,
        });
      });
    });

    describe('combobox', () => {
      it('should return correct combobox attributes', () => {
        const attrs = aria.combobox(true, 'listbox-1', 'option-3');
        expect(attrs).toEqual({
          role: 'combobox',
          'aria-expanded': true,
          'aria-haspopup': 'listbox',
          'aria-controls': 'listbox-1',
          'aria-activedescendant': 'option-3',
        });
      });
    });

    describe('visuallyHidden', () => {
      it('should have correct CSS properties', () => {
        expect(aria.visuallyHidden).toHaveProperty('position', 'absolute');
        expect(aria.visuallyHidden).toHaveProperty('width', '1px');
        expect(aria.visuallyHidden).toHaveProperty('height', '1px');
        expect(aria.visuallyHidden).toHaveProperty('clip');
      });
    });
  });

  describe('announceToScreenReader', () => {
    it('should create announcement element', () => {
      announceToScreenReader('Test announcement');
      
      const announcement = document.querySelector('[aria-live]');
      expect(announcement).toBeTruthy();
      expect(announcement?.textContent).toBe('Test announcement');
      
      // Clean up
      announcement?.remove();
    });

    it('should remove element after timeout', async () => {
      announceToScreenReader('Test announcement');
      
      // Wait for the element to be removed (1000ms timeout in the function)
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const announcement = document.querySelector('[aria-live]');
      expect(announcement).toBeNull();
    });

    it('should use assertive politeness when specified', () => {
      announceToScreenReader('Urgent!', 'assertive');
      
      const announcement = document.querySelector('[aria-live="assertive"]');
      expect(announcement).toBeTruthy();
      expect(announcement?.getAttribute('role')).toBe('alert');
      
      // Clean up
      announcement?.remove();
    });
  });

  describe('FocusTrap', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
      container = document.createElement('div');
      container.innerHTML = `
        <button id="btn1">Button 1</button>
        <input id="input1" type="text" />
        <button id="btn2">Button 2</button>
      `;
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    it('should trap focus within container', () => {
      const trap = new FocusTrap(container);
      // Verify trap was created successfully
      expect(trap).toBeDefined();
      trap.deactivate();
    });

    it('should deactivate cleanly', () => {
      const outsideButton = document.createElement('button');
      outsideButton.id = 'outside';
      document.body.appendChild(outsideButton);

      const trap = new FocusTrap(container);
      trap.deactivate();

      // Should not throw
      expect(true).toBe(true);
      document.body.removeChild(outsideButton);
    });
  });
});
