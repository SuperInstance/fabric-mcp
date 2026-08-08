/**
 * Keyboard Navigation Utilities for WCAG 2.1 AA Compliance
 * Provides comprehensive keyboard navigation support
 */

/**
 * Keyboard event types
 */
export interface KeyboardEvent extends KeyboardEvent {
  preventDefault?: () => void;
}

/**
 * Navigation direction
 */
export type NavigationDirection =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'first'
  | 'last'
  | 'pageUp'
  | 'pageDown'
  | 'next'
  | 'previous';

/**
 * Keyboard shortcut configuration
 */
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  description: string;
  handler: (event: KeyboardEvent) => void;
}

/**
 * Keyboard navigation configuration
 */
export interface KeyboardConfig {
  enableArrowKeys?: boolean;
  enableHomeEnd?: boolean;
  enablePageUpDown?: boolean;
  enableTabNavigation?: boolean;
  enableEscape?: boolean;
  customShortcuts?: Record<string, () => void>;
}

/**
 * Default keyboard shortcuts for spreadsheet
 */
export const DEFAULT_SHORTCUTS: Record<string, string> = {
  'ArrowUp': 'Move up one cell',
  'ArrowDown': 'Move down one cell',
  'ArrowLeft': 'Move left one cell',
  'ArrowRight': 'Move right one cell',
  'Ctrl+ArrowUp': 'Move to top cell',
  'Ctrl+ArrowDown': 'Move to bottom cell',
  'Ctrl+ArrowLeft': 'Move to first column',
  'Ctrl+ArrowRight': 'Move to last column',
  'Home': 'Move to first column',
  'End': 'Move to last column',
  'Ctrl+Home': 'Move to first cell (A1)',
  'Ctrl+End': 'Move to last cell',
  'PageUp': 'Move up one page',
  'PageDown': 'Move down one page',
  'Tab': 'Move to next cell',
  'Shift+Tab': 'Move to previous cell',
  'Enter': 'Edit cell',
  'Escape': 'Cancel editing',
  'F2': 'Edit cell',
  'Delete': 'Clear cell',
  'Ctrl+C': 'Copy',
  'Ctrl+V': 'Paste',
  'Ctrl+X': 'Cut',
  'Ctrl+Z': 'Undo',
  'Ctrl+Y': 'Redo',
  'Ctrl+A': 'Select all',
  'Ctrl+F': 'Find',
  'Ctrl+H': 'Replace',
  'Ctrl+S': 'Save',
  'F1': 'Help',
};

/**
 * Keyboard navigation manager
 */
export class KeyboardNavManager {
  private shortcuts: Map<string, () => void> = new Map();
  private isEnabled = true;
  private focusableElements: HTMLElement[] = [];

  /**
   * Register keyboard shortcut
   */
  registerShortcut(combo: string, handler: () => void): void {
    this.shortcuts.set(combo.toLowerCase(), handler);
  }

  /**
   * Unregister keyboard shortcut
   */
  unregisterShortcut(combo: string): void {
    this.shortcuts.delete(combo.toLowerCase());
  }

  /**
   * Handle keyboard event
   */
  handleEvent(event: KeyboardEvent): boolean {
    if (!this.isEnabled) {
      return false;
    }

    // Check if should ignore this event
    if (this.shouldIgnoreEvent(event)) {
      return false;
    }

    const combo = this.getComboString(event);
    const handler = this.shortcuts.get(combo);

    if (handler) {
      event.preventDefault();
      handler();
      return true;
    }

    return false;
  }

  /**
   * Check if should ignore keyboard event
   */
  private shouldIgnoreEvent(event: KeyboardEvent): boolean {
    const target = event.target as HTMLElement;

    // Ignore if in input field (unless it's readonly)
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return target.getAttribute('readonly') === null;
    }

    // Ignore if content is editable
    if (target.isContentEditable) {
      return true;
    }

    return false;
  }

  /**
   * Get standardized key combination string
   */
  private getComboString(event: KeyboardEvent): string {
    const parts: string[] = [];

    if (event.ctrlKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');
    if (event.metaKey) parts.push('meta');

    parts.push(event.key.toLowerCase());

    return parts.join('+');
  }

  /**
   * Enable keyboard navigation
   */
  enable(): void {
    this.isEnabled = true;
  }

  /**
   * Disable keyboard navigation
   */
  disable(): void {
    this.isEnabled = false;
  }

  /**
   * Get all registered shortcuts
   */
  getShortcuts(): Record<string, string> {
    const shortcuts: Record<string, string> = {};
    this.shortcuts.forEach((_, key) => {
      shortcuts[key] = DEFAULT_SHORTCUTS[key] || 'Custom action';
    });
    return shortcuts;
  }

  /**
   * Update focusable elements
   */
  updateFocusableElements(container: HTMLElement): void {
    const focusableSelectors = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    this.focusableElements = Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelectors)
    );
  }

  /**
   * Move focus to next element
   */
  focusNext(): boolean {
    const currentIndex = this.focusableElements.indexOf(
      document.activeElement as HTMLElement
    );

    const nextIndex = (currentIndex + 1) % this.focusableElements.length;
    const nextElement = this.focusableElements[nextIndex];

    if (nextElement) {
      nextElement.focus();
      return true;
    }

    return false;
  }

  /**
   * Move focus to previous element
   */
  focusPrevious(): boolean {
    const currentIndex = this.focusableElements.indexOf(
      document.activeElement as HTMLElement
    );

    const previousIndex =
      currentIndex <= 0
        ? this.focusableElements.length - 1
        : currentIndex - 1;
    const previousElement = this.focusableElements[previousIndex];

    if (previousElement) {
      previousElement.focus();
      return true;
    }

    return false;
  }

  /**
   * Move focus to first element
   */
  focusFirst(): boolean {
    const firstElement = this.focusableElements[0];
    if (firstElement) {
      firstElement.focus();
      return true;
    }
    return false;
  }

  /**
   * Move focus to last element
   */
  focusLast(): boolean {
    const lastElement = this.focusableElements[this.focusableElements.length - 1];
    if (lastElement) {
      lastElement.focus();
      return true;
    }
    return false;
  }

  /**
   * Clean up
   */
  destroy(): void {
    this.shortcuts.clear();
    this.focusableElements = [];
  }
}

/**
 * Create keyboard shortcut hint
 */
export function createShortcutHint(keys: string[]): string {
  const formattedKeys = keys.map((key) => {
    if (key.length === 1) {
      return key.toUpperCase();
    }
    return key.charAt(0).toUpperCase() + key.slice(1);
  });

  return formattedKeys.join('+');
}

/**
 * Check if key combination matches pattern
 */
export function matchesKeyCombo(event: KeyboardEvent, combo: string): boolean {
  const [keys, ...modifiers] = combo.split('+').map((k) => k.toLowerCase());

  const hasCtrl = modifiers.includes('ctrl');
  const hasAlt = modifiers.includes('alt');
  const hasShift = modifiers.includes('shift');
  const hasMeta = modifiers.includes('meta');

  return (
    event.key.toLowerCase() === keys &&
    event.ctrlKey === hasCtrl &&
    event.altKey === hasAlt &&
    event.shiftKey === hasShift &&
    event.metaKey === hasMeta
  );
}

/**
 * Trap focus within container
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTab = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleTab);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTab);
  };
}

/**
 * Get all focusable elements within container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors));
}

/**
 * Announce keyboard shortcut to screen readers
 */
export function announceShortcut(shortcut: string, description: string): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = `Press ${shortcut} to ${description}`;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Keyboard navigation utilities
 */
export const keyboardUtils = {
  createShortcutHint,
  matchesKeyCombo,
  trapFocus,
  getFocusableElements,
  announceShortcut,
};

/**
 * Global keyboard manager instance
 */
export const keyboardManager = new KeyboardNavManager();
