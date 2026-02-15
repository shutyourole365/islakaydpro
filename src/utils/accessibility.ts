/**
 * Accessibility utilities for better user experience
 */

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement is made
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Focus trap for modals and dialogs
 */
export class FocusTrap {
  private container: HTMLElement;
  private previousFocus: HTMLElement | null = null;
  private firstFocusable: HTMLElement | null = null;
  private lastFocusable: HTMLElement | null = null;
  private handleKeyDown: (e: KeyboardEvent) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.handleKeyDown = this.onKeyDown.bind(this);
    this.activate();
  }

  private getFocusableElements(): HTMLElement[] {
    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ];
    
    return Array.from(
      this.container.querySelectorAll<HTMLElement>(selectors.join(','))
    ).filter(el => el.offsetParent !== null);
  }

  private updateFocusableElements(): void {
    const elements = this.getFocusableElements();
    this.firstFocusable = elements[0] || null;
    this.lastFocusable = elements[elements.length - 1] || null;
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (e.key !== 'Tab') return;
    
    this.updateFocusableElements();
    
    if (!this.firstFocusable || !this.lastFocusable) return;

    if (e.shiftKey) {
      if (document.activeElement === this.firstFocusable) {
        e.preventDefault();
        this.lastFocusable.focus();
      }
    } else {
      if (document.activeElement === this.lastFocusable) {
        e.preventDefault();
        this.firstFocusable.focus();
      }
    }
  }

  activate(): void {
    this.previousFocus = document.activeElement as HTMLElement;
    this.updateFocusableElements();
    
    document.addEventListener('keydown', this.handleKeyDown);
    
    // Focus first element
    if (this.firstFocusable) {
      this.firstFocusable.focus();
    }
  }

  deactivate(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
    
    // Restore focus
    if (this.previousFocus && this.previousFocus.focus) {
      this.previousFocus.focus();
    }
  }
}

/**
 * Manage roving tabindex for keyboard navigation
 */
export class RovingTabIndex {
  private container: HTMLElement;
  private selector: string;
  private currentIndex = 0;
  private handleKeyDown: (e: KeyboardEvent) => void;
  private orientation: 'horizontal' | 'vertical' | 'both';

  constructor(
    container: HTMLElement,
    selector: string,
    orientation: 'horizontal' | 'vertical' | 'both' = 'both'
  ) {
    this.container = container;
    this.selector = selector;
    this.orientation = orientation;
    this.handleKeyDown = this.onKeyDown.bind(this);
    this.initialize();
  }

  private getItems(): HTMLElement[] {
    return Array.from(this.container.querySelectorAll<HTMLElement>(this.selector));
  }

  private initialize(): void {
    const items = this.getItems();
    items.forEach((item, index) => {
      item.setAttribute('tabindex', index === 0 ? '0' : '-1');
    });
    
    this.container.addEventListener('keydown', this.handleKeyDown);
  }

  private onKeyDown(e: KeyboardEvent): void {
    const items = this.getItems();
    if (items.length === 0) return;

    const isHorizontal = this.orientation === 'horizontal' || this.orientation === 'both';
    const isVertical = this.orientation === 'vertical' || this.orientation === 'both';

    let newIndex = this.currentIndex;

    switch (e.key) {
      case 'ArrowRight':
        if (isHorizontal) {
          e.preventDefault();
          newIndex = (this.currentIndex + 1) % items.length;
        }
        break;
      case 'ArrowLeft':
        if (isHorizontal) {
          e.preventDefault();
          newIndex = (this.currentIndex - 1 + items.length) % items.length;
        }
        break;
      case 'ArrowDown':
        if (isVertical) {
          e.preventDefault();
          newIndex = (this.currentIndex + 1) % items.length;
        }
        break;
      case 'ArrowUp':
        if (isVertical) {
          e.preventDefault();
          newIndex = (this.currentIndex - 1 + items.length) % items.length;
        }
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = items.length - 1;
        break;
      default:
        return;
    }

    this.setCurrentIndex(newIndex);
  }

  setCurrentIndex(index: number): void {
    const items = this.getItems();
    if (index < 0 || index >= items.length) return;

    items[this.currentIndex]?.setAttribute('tabindex', '-1');
    items[index]?.setAttribute('tabindex', '0');
    items[index]?.focus();
    
    this.currentIndex = index;
  }

  destroy(): void {
    this.container.removeEventListener('keydown', this.handleKeyDown);
  }
}

/**
 * Skip link component helper
 */
export function createSkipLink(targetId: string, text = 'Skip to main content'): HTMLAnchorElement {
  const link = document.createElement('a');
  link.href = `#${targetId}`;
  link.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded';
  link.textContent = text;
  return link;
}

/**
 * Generate unique IDs for ARIA relationships
 */
let idCounter = 0;
export function generateId(prefix = 'aria'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: more)').matches;
}

/**
 * Check color scheme preference
 */
export function prefersColorScheme(): 'dark' | 'light' | 'no-preference' {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
  return 'no-preference';
}

/**
 * ARIA helpers for common patterns
 */
export const aria = {
  /**
   * Create ARIA attributes for a disclosure (accordion, collapsible)
   */
  disclosure(expanded: boolean, controlsId: string) {
    return {
      'aria-expanded': expanded,
      'aria-controls': controlsId,
    };
  },

  /**
   * Create ARIA attributes for a dialog/modal
   */
  dialog(labelledBy: string, describedBy?: string) {
    return {
      role: 'dialog' as const,
      'aria-modal': true,
      'aria-labelledby': labelledBy,
      ...(describedBy && { 'aria-describedby': describedBy }),
    };
  },

  /**
   * Create ARIA attributes for tabs
   */
  tab(selected: boolean, controlsId: string) {
    return {
      role: 'tab' as const,
      'aria-selected': selected,
      'aria-controls': controlsId,
      tabIndex: selected ? 0 : -1,
    };
  },

  /**
   * Create ARIA attributes for tab panel
   */
  tabPanel(labelledBy: string, hidden: boolean) {
    return {
      role: 'tabpanel' as const,
      'aria-labelledby': labelledBy,
      hidden,
      tabIndex: 0,
    };
  },

  /**
   * Create ARIA attributes for a menu
   */
  menu(labelledBy?: string) {
    return {
      role: 'menu' as const,
      ...(labelledBy && { 'aria-labelledby': labelledBy }),
    };
  },

  /**
   * Create ARIA attributes for a menu item
   */
  menuItem(disabled = false) {
    return {
      role: 'menuitem' as const,
      ...(disabled && { 'aria-disabled': true }),
    };
  },

  /**
   * Create ARIA attributes for a combobox/autocomplete
   */
  combobox(expanded: boolean, listboxId: string, activeDescendant?: string) {
    return {
      role: 'combobox' as const,
      'aria-expanded': expanded,
      'aria-haspopup': 'listbox' as const,
      'aria-controls': listboxId,
      ...(activeDescendant && { 'aria-activedescendant': activeDescendant }),
    };
  },

  /**
   * Hide element visually but not from screen readers
   */
  visuallyHidden: {
    position: 'absolute' as const,
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap' as const,
    border: '0',
  },
};

/**
 * Live region manager for dynamic content updates
 */
export class LiveRegion {
  private element: HTMLElement;

  constructor(
    politeness: 'polite' | 'assertive' = 'polite',
    atomic = true
  ) {
    this.element = document.createElement('div');
    this.element.setAttribute('aria-live', politeness);
    this.element.setAttribute('aria-atomic', String(atomic));
    this.element.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status');
    this.element.className = 'sr-only';
    document.body.appendChild(this.element);
  }

  announce(message: string): void {
    // Clear and re-announce for consistent screen reader behavior
    this.element.textContent = '';
    requestAnimationFrame(() => {
      this.element.textContent = message;
    });
  }

  destroy(): void {
    document.body.removeChild(this.element);
  }
}
