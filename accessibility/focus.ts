/**
 * Focus Management Utilities for WCAG 2.1 AA Compliance
 * Provides comprehensive focus management and visible focus indicators
 */

/**
 * Focus trap configuration
 */
export interface FocusTrapConfig {
  escapeDeactivates?: boolean;
  clickOutsideDeactivates?: boolean;
  returnFocusOnDeactivate?: boolean;
  initialFocus?: string | HTMLElement;
  onActivate?: () => void;
  onDeactivate?: () => void;
}

/**
 * Focus trap instance
 */
export interface FocusTrap {
  activate: () => void;
  deactivate: () => void;
  update: () => void;
  isActive: () => boolean;
}

/**
 * Focus history entry
 */
interface FocusHistoryEntry {
  element: HTMLElement;
  timestamp: number;
}

/**
 * Focus manager class
 */
export class FocusManager {
  private focusHistory: FocusHistoryEntry[] = [];
  private maxHistorySize = 10;
  private activeTraps: Map<HTMLElement, FocusTrap> = new Map();
  private previousActiveElement: HTMLElement | null = null;

  /**
   * Set focus to element
   */
  setFocus(element: HTMLElement, options?: { preventScroll?: boolean }): boolean {
    try {
      element.focus({
        preventScroll: options?.preventScroll ?? false,
      });

      // Announce focus change
      this.announceFocusChange(element);

      return true;
    } catch (error) {
      console.error('Failed to set focus:', error);
      return false;
    }
  }

  /**
   * Capture current focus
   */
  captureFocus(): void {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      this.focusHistory.push({
        element: activeElement,
        timestamp: Date.now(),
      });

      // Limit history size
      if (this.focusHistory.length > this.maxHistorySize) {
        this.focusHistory.shift();
      }
    }
  }

  /**
   * Restore focus to previous element
   */
  restoreFocus(): boolean {
    const entry = this.focusHistory.pop();

    if (!entry) {
      return false;
    }

    // Check if element is still in DOM
    if (!document.body.contains(entry.element)) {
      return this.restoreFocus(); // Try previous element
    }

    return this.setFocus(entry.element);
  }

  /**
   * Create focus trap
   */
  createFocusTrap(container: HTMLElement, config: FocusTrapConfig = {}): FocusTrap {
    let isActive = false;

    const getFocusableElements = (): HTMLElement[] => {
      const selectors = [
        'button:not([disabled])',
        '[href]',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]',
      ].join(', ');

      return Array.from(container.querySelectorAll<HTMLElement>(selectors));
    };

    const getFirstFocusable = (): HTMLElement | null => {
      const elements = getFocusableElements();
      return elements[0] || null;
    };

    const getLastFocusable = (): HTMLElement | null => {
      const elements = getFocusableElements();
      return elements[elements.length - 1] || null;
    };

    const activate = (): void => {
      if (isActive) return;

      isActive = true;
      this.previousActiveElement = document.activeElement as HTMLElement;

      // Set initial focus
      if (config.initialFocus) {
        const initialElement =
          typeof config.initialFocus === 'string'
            ? container.querySelector<HTMLElement>(config.initialFocus)
            : config.initialFocus;

        if (initialElement) {
          this.setFocus(initialElement);
        }
      } else {
        const firstElement = getFirstFocusable();
        if (firstElement) {
          this.setFocus(firstElement);
        }
      }

      // Add tab key listener
      container.addEventListener('keydown', handleTabKey);

      // Mark container
      container.setAttribute('data-focus-trap', 'active');

      if (config.onActivate) {
        config.onActivate();
      }
    };

    const deactivate = (): void => {
      if (!isActive) return;

      isActive = false;

      // Remove tab key listener
      container.removeEventListener('keydown', handleTabKey);

      // Remove marker
      container.removeAttribute('data-focus-trap');

      // Restore focus
      if (config.returnFocusOnDeactivate && this.previousActiveElement) {
        this.setFocus(this.previousActiveElement);
      }

      if (config.onDeactivate) {
        config.onDeactivate();
      }
    };

    const handleTabKey = (event: KeyboardEvent): void => {
      if (event.key !== 'Tab' || !isActive) return;

      const firstElement = getFirstFocusable();
      const lastElement = getLastFocusable();

      if (!firstElement || !lastElement) return;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && isActive && config.escapeDeactivates) {
        deactivate();
      }
    };

    const handleClickOutside = (event: MouseEvent): void => {
      if (isActive && config.clickOutsideDeactivates && !container.contains(event.target as Node)) {
        deactivate();
      }
    };

    // Add additional listeners
    if (config.escapeDeactivates) {
      container.addEventListener('keydown', handleEscape);
    }

    if (config.clickOutsideDeactivates) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    const trap: FocusTrap = {
      activate,
      deactivate,
      update: () => {
        // Re-calculate focusable elements
        getFocusableElements();
      },
      isActive: () => isActive,
    };

    this.activeTraps.set(container, trap);
    return trap;
  }

  /**
   * Get all focusable elements
   */
  getFocusableElements(container: HTMLElement = document.body): HTMLElement[] {
    const selectors = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    return Array.from(container.querySelectorAll<HTMLElement>(selectors));
  }

  /**
   * Check if element is focusable
   */
  isFocusable(element: HTMLElement): boolean {
    if (element.disabled || element.hidden) {
      return false;
    }

    const tabIndex = parseInt(element.getAttribute('tabindex') || '0', 10);
    const isNativelyFocusable = [
      'BUTTON',
      'INPUT',
      'SELECT',
      'TEXTAREA',
      'A',
    ].includes(element.tagName);

    return isNativelyFocusable || tabIndex >= 0;
  }

  /**
   * Move focus to next element
   */
  focusNext(container: HTMLElement = document.body): boolean {
    const focusableElements = this.getFocusableElements(container);
    const currentIndex = focusableElements.indexOf(
      document.activeElement as HTMLElement
    );

    const nextIndex = (currentIndex + 1) % focusableElements.length;
    const nextElement = focusableElements[nextIndex];

    if (nextElement) {
      return this.setFocus(nextElement);
    }

    return false;
  }

  /**
   * Move focus to previous element
   */
  focusPrevious(container: HTMLElement = document.body): boolean {
    const focusableElements = this.getFocusableElements(container);
    const currentIndex = focusableElements.indexOf(
      document.activeElement as HTMLElement
    );

    const previousIndex =
      currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
    const previousElement = focusableElements[previousIndex];

    if (previousElement) {
      return this.setFocus(previousElement);
    }

    return false;
  }

  /**
   * Move focus to first element
   */
  focusFirst(container: HTMLElement = document.body): boolean {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];

    if (firstElement) {
      return this.setFocus(firstElement);
    }

    return false;
  }

  /**
   * Move focus to last element
   */
  focusLast(container: HTMLElement = document.body): boolean {
    const focusableElements = this.getFocusableElements(container);
    const lastElement = focusableElements[focusableElements.length - 1];

    if (lastElement) {
      return this.setFocus(lastElement);
    }

    return false;
  }

  /**
   * Announce focus change to screen readers
   */
  private announceFocusChange(element: HTMLElement): void {
    const label = element.getAttribute('aria-label') ||
                  element.getAttribute('aria-labelledby') ||
                  element.textContent ||
                  '';

    if (label) {
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.className = 'sr-only';
      announcement.textContent = `Focused on ${label}`;

      Object.assign(announcement.style, {
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        borderWidth: '0',
      });

      document.body.appendChild(announcement);

      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  }

  /**
   * Clean up all focus traps
   */
  cleanup(): void {
    this.activeTraps.forEach((trap) => trap.deactivate());
    this.activeTraps.clear();
    this.focusHistory = [];
    this.previousActiveElement = null;
  }
}

/**
 * Check if focus is visible
 */
export function isFocusVisible(): boolean {
  // Check if user is navigating with keyboard
  let hasKeyboardFocus = false;

  const handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Tab' || e.key === 'Shift') {
      hasKeyboardFocus = true;
    }
  };

  const handleMouseDown = (): void => {
    hasKeyboardFocus = false;
  };

  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('mousedown', handleMouseDown);

  return hasKeyboardFocus;
}

/**
 * Add focus visible class
 */
export function addFocusVisibleStyles(): void {
  const styleId = 'focus-visible-styles';

  if (document.getElementById(styleId)) {
    return;
  }

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    :focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }

    :focus:not(:focus-visible) {
      outline: none;
    }

    .focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }

    @media (prefers-reduced-motion: reduce) {
      :focus-visible {
        transition: none;
      }
    }
  `;

  document.head.appendChild(style);
}

/**
 * Manage programmatic focus
 */
export function manageProgrammaticFocus(
  element: HTMLElement,
  callback: () => void
): () => void {
  // Capture current focus
  const previousFocus = document.activeElement as HTMLElement;

  // Set new focus
  element.focus();

  // Return cleanup function
  return () => {
    callback();
    if (previousFocus && document.body.contains(previousFocus)) {
      previousFocus.focus();
    }
  };
}

/**
 * Focus utilities
 */
export const focusUtils = {
  isFocusVisible,
  addFocusVisibleStyles,
  manageProgrammaticFocus,
};

/**
 * Global focus manager instance
 */
export const focusManager = new FocusManager();

/**
 * Initialize focus management
 */
export function initializeFocusManagement(): void {
  // Add focus visible styles
  addFocusVisibleStyles();

  // Handle focus restoration after navigation
  let previousFocus: HTMLElement | null = null;

  document.addEventListener('focusin', (event) => {
    const target = event.target as HTMLElement;

    // Store focus for potential restoration
    if (target !== document.body) {
      previousFocus = target;
    }
  }, true);

  // Restore focus after page visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && previousFocus) {
      focusManager.setFocus(previousFocus);
    }
  });
}
