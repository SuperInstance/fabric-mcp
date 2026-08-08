/**
 * Accessibility System Index
 * WCAG 2.1 Level AA Compliant
 *
 * Exports all accessibility utilities and components for Spreadsheet Moment
 */

// Main React components and context
export {
  A11yProvider,
  useA11y,
  VisuallyHidden,
  SkipLinks,
  AccessibleButton,
  AccessibleInput,
  AccessibleModal,
  AccessibleCheckbox,
  AccessibleSelect,
  useFocusVisible,
  checkContrastRatio,
  useAnnounce,
} from './AccessibilityManager.tsx';

// ARIA utilities
export {
  generateCellAriaLabel,
  setAriaAttributes,
  createLiveRegion,
  announce as announceAria,
  generateGridAriaDescription,
  getCellRole,
  validateAriaAttributes,
  ariaUtils,
} from './aria';

// Keyboard navigation
export {
  KeyboardNavManager,
  keyboardManager,
  createShortcutHint,
  matchesKeyCombo,
  trapFocus as trapFocusKey,
  getFocusableElements,
  announceShortcut,
  keyboardUtils,
  DEFAULT_SHORTCUTS,
} from './keyboard';

// Screen reader support
export {
  ScreenReaderManager,
  screenReaderManager,
  detectScreenReader,
  createScreenReaderOnlyElement,
  addScreenReaderLabel,
  removeScreenReaderLabel,
  announceToScreenReader,
  screenReaderUtils,
} from './screen-reader';

// Focus management
export {
  FocusManager,
  focusManager,
  isFocusVisible,
  addFocusVisibleStyles,
  manageProgrammaticFocus,
  focusUtils,
  initializeFocusManagement,
} from './focus';

// React examples
export {
  AccessibilityExamples,
} from './examples';

// Type exports from main module
export type {
  A11yPreferences,
} from './AccessibilityManager.tsx';

// Additional type exports
export type {
  KeyboardShortcut,
  KeyboardConfig,
  NavigationDirection,
  ScreenReaderInfo,
  AnnouncementPriority,
  FocusTrapConfig,
  FocusTrap,
} from './keyboard';
