/**
 * Spreadsheet Moment - WCAG 2.1 AA Accessibility System
 *
 * Round 15: Comprehensive accessibility support ensuring WCAG 2.1 AA compliance
 * Features: Screen reader support, keyboard navigation, high contrast, focus management
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

/**
 * Accessibility preferences
 */
export interface A11yPreferences {
  /** Reduced motion preference */
  reducedMotion: boolean;
  /** High contrast mode */
  highContrast: boolean;
  /** Text scaling factor (1.0 = normal, 2.0 = 200%) */
  textScale: number;
  /** Screen reader active */
  screenReader: boolean;
  /** Font size preference */
  fontSize: 'small' | 'normal' | 'large' | 'extra-large';
  /** Focus visible preference */
  showFocus: boolean;
}

/**
 * Accessibility context
 */
interface A11yContextValue {
  preferences: A11yPreferences;
  updatePreferences: (updates: Partial<A11yPreferences>) => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  focusElement: (selector: string) => boolean;
}

const A11yContext = createContext<A11yContextValue>({
  preferences: {
    reducedMotion: false,
    highContrast: false,
    textScale: 1.0,
    screenReader: false,
    fontSize: 'normal',
    showFocus: true,
  },
  updatePreferences: () => {},
  announce: () => {},
  focusElement: () => false,
});

/**
 * Accessibility Provider
 */
export function A11yProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<A11yPreferences>(() => {
    // Detect system preferences
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const prefersHighContrast = window.matchMedia('(prefers-contrast: more)').matches;

      return {
        reducedMotion: prefersReducedMotion,
        highContrast: prefersHighContrast,
        textScale: 1.0,
        screenReader: false, // Will be detected via interaction patterns
        fontSize: 'normal',
        showFocus: true,
      };
    }
    return {
      reducedMotion: false,
      highContrast: false,
      textScale: 1.0,
      screenReader: false,
      fontSize: 'normal',
      showFocus: true,
    };
  });

  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  // Update CSS variables based on preferences
  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty('--text-scale', preferences.textScale.toString());

    if (preferences.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (preferences.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Apply font size
    const fontSizes = {
      small: '14px',
      normal: '16px',
      large: '18px',
      'extra-large': '20px',
    };
    root.style.fontSize = fontSizes[preferences.fontSize];
  }, [preferences]);

  // Listen for system preference changes
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: more)');

    const handleMotionChange = (e: MediaQueryListEvent) => {
      updatePreferences({ reducedMotion: e.matches });
    };

    const handleContrastChange = (e: MediaQueryListEvent) => {
      updatePreferences({ highContrast: e.matches });
    };

    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  // Detect screen reader usage through interaction patterns
  useEffect(() => {
    let screenReaderDetected = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Screen readers often use Tab + Space/Enter for navigation
      if (e.key === 'Tab' || e.key === 'Enter') {
        const focusableElements = document.querySelectorAll(
          'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        // If focusing non-visible elements, might be screen reader
        if (focusableElements.length > 0) {
          const activeElement = document.activeElement;
          if (activeElement && getComputedStyle(activeElement).display === 'none') {
            screenReaderDetected = true;
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Debounced update
    const timer = setTimeout(() => {
      if (screenReaderDetected) {
        updatePreferences({ screenReader: true });
      }
    }, 1000);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, []);

  const updatePreferences = useCallback((updates: Partial<A11yPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Create temporary live region for announcement
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';

    document.body.appendChild(liveRegion);
    liveRegion.textContent = message;

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 1000);
  }, []);

  const focusElement = useCallback((selector: string): boolean => {
    const element = document.querySelector<HTMLElement>(selector);
    if (element) {
      element.focus();
      return true;
    }
    return false;
  }, []);

  return (
    <A11yContext.Provider value={{ preferences, updatePreferences, announce, focusElement }}>
      {/* Live regions for screen reader announcements */}
      <div
        ref={liveRegionRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
      {children}
    </A11yContext.Provider>
  );
}

/**
 * Hook to use accessibility features
 */
export function useA11y() {
  return useContext(A11yContext);
}

/**
 * Visibly Hidden component for screen reader only content
 */
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        borderWidth: 0,
      }}
    >
      {children}
    </span>
  );
}

/**
 * Skip links component for keyboard navigation
 */
export function SkipLinks() {
  const { focusElement } = useA11y();

  const skipTo = (selector: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    focusElement(selector);
  };

  return (
    <VisuallyHidden>
      <a
        href="#main-content"
        onClick={skipTo('#main-content')}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        onClick={skipTo('#navigation')}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-60 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
      >
        Skip to navigation
      </a>
    </VisuallyHidden>
  );
}

/**
 * Accessible button with proper ARIA support
 */
export function AccessibleButton({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  ariaLabel,
  ariaDescription,
  ariaPressed,
  ariaExpanded,
  ariaControls,
  ariaHaspopup,
  onClick,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  ariaLabel?: string;
  ariaDescription?: string;
  ariaPressed?: boolean;
  ariaExpanded?: boolean;
  ariaControls?: string;
  ariaHaspopup?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
}) {
  const { preferences } = useA11y();

  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
  };

  const sizeStyles = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };

  return (
    <button
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescription}
      aria-pressed={ariaPressed}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-haspopup={ariaHaspopup}
      aria-busy={loading}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium rounded-lg
        transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        focus-visible:outline-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${preferences.highContrast ? 'border-2 border-current' : ''}
        ${loading ? 'cursor-wait' : ''}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

/**
 * Accessible form input with error handling
 */
export function AccessibleInput({
  label,
  error,
  hint,
  required = false,
  id,
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint ? `${inputId}-hint` : undefined;

  const { preferences } = useA11y();

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      {hint && (
        <span id={hintId} className="text-xs text-gray-500 dark:text-gray-400">
          {hint}
        </span>
      )}

      <input
        id={inputId}
        aria-invalid={!!error}
        aria-required={required}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        aria-errormessage={errorId}
        className={`
          w-full px-4 py-2 rounded-lg border
          focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
          focus-visible:outline-none
          transition-all
          dark:bg-gray-700
          ${error
            ? 'border-red-500 focus-visible:ring-red-500'
            : 'border-gray-300 dark:border-gray-600'
          }
          ${preferences.highContrast ? 'border-2' : ''}
        `}
        {...props}
      />

      {error && (
        <span id={errorId} className="text-sm text-red-500 dark:text-red-400" role="alert">
          <span className="sr-only">Error: </span>
          {error}
        </span>
      )}
    </div>
  );
}

/**
 * Accessible modal with focus trap
 */
export function AccessibleModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  closeOnEscape = true,
  closeOnBackdrop = true,
  className = '',
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  className?: string;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const { announce } = useA11y();

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    // Store previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus first focusable element in modal
    const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements?.[0];
    const lastElement = focusableElements?.[focusableElements.length - 1];

    firstElement?.focus();

    // Announce modal to screen readers
    announce(`${title}. ${description || ''}`, 'assertive');

    // Handle tab key for focus trap
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);

    return () => {
      document.removeEventListener('keydown', handleTab);

      // Restore focus when modal closes
      previousActiveElement.current?.focus();
    };
  }, [isOpen, title, description, announce]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? 'modal-description' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`
          relative bg-white dark:bg-gray-800 rounded-lg shadow-xl
          max-w-lg w-full max-h-[90vh] overflow-y-auto
          ${className}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Description */}
        {description && (
          <p id="modal-description" className="sr-only">
            {description}
          </p>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/**
 * Accessible checkbox component
 */
export function AccessibleCheckbox({
  checked,
  onChange,
  label,
  description,
  required = false,
  id,
  className = '',
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  required?: boolean;
  id?: string;
  className?: string;
}) {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  const descriptionId = description ? `${checkboxId}-description` : undefined;

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <input
        type="checkbox"
        id={checkboxId}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-required={required}
        aria-describedby={descriptionId}
        className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 cursor-pointer"
      />
      <div className="flex flex-col">
        <label
          htmlFor={checkboxId}
          className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
        {description && (
          <span id={descriptionId} className="text-xs text-gray-500 dark:text-gray-400">
            {description}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Accessible dropdown/select component
 */
export function AccessibleSelect({
  label,
  options,
  value,
  onChange,
  error,
  required = false,
  id,
  className = '',
}: {
  label: string;
  options: { value: string; label: string; disabled?: boolean }[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  id?: string;
  className?: string;
}) {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label
        htmlFor={selectId}
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-required={required}
        aria-errormessage={errorId}
        className={`
          w-full px-4 py-2 rounded-lg border
          focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
          focus-visible:outline-none
          bg-white dark:bg-gray-700
          ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
        `}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <span id={errorId} className="text-sm text-red-500 dark:text-red-400" role="alert">
          <span className="sr-only">Error: </span>
          {error}
        </span>
      )}
    </div>
  );
}

/**
 * Focus visible utility hook
 */
export function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  useEffect(() => {
    let isUsingKeyboard = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'Shift') {
        isUsingKeyboard = true;
        setIsFocusVisible(true);
      }
    };

    const handleMouseDown = () => {
      isUsingKeyboard = false;
      setIsFocusVisible(false);
    };

    const handleFocus = () => {
      if (isUsingKeyboard) {
        setIsFocusVisible(true);
      }
    };

    const handleBlur = () => {
      setIsFocusVisible(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return isFocusVisible;
}

/**
 * Color contrast checker for WCAG AA compliance
 */
export function checkContrastRatio(foreground: string, background: string): {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  level: 'FAIL' | 'AA' | 'AAA';
} {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  // Calculate relative luminance
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map((val) => {
      val /= 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);

  const fgLuminance = getLuminance(fg.r, fg.g, fg.b);
  const bgLuminance = getLuminance(bg.r, bg.g, bg.b);

  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);

  const ratio = (lighter + 0.05) / (darker + 0.05);

  const passesAA = ratio >= 4.5;
  const passesAAA = ratio >= 7;

  return {
    ratio: Math.round(ratio * 100) / 100,
    passesAA,
    passesAAA,
    level: passesAAA ? 'AAA' : passesAA ? 'AA' : 'FAIL',
  };
}

/**
 * Screen reader announcement hook
 */
export function useAnnounce() {
  const { announce } = useA11y();

  const announceMessage = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      announce(message, priority);
    },
    [announce]
  );

  return announceMessage;
}

// Add CSS for screen reader only content
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }

    .sr-only-focusable:focus {
      position: static;
      width: auto;
      height: auto;
      padding: inherit;
      margin: inherit;
      overflow: visible;
      clip: auto;
      white-space: normal;
    }

    /* High contrast mode styles */
    @media (prefers-contrast: high) {
      .high-contrast * {
        border: 1px solid currentColor !important;
      }
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .reduced-motion *,
      .reduced-motion *::before,
      .reduced-motion *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }

    /* Focus visible styles */
    :focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }

    /* Text scaling */
    * {
      font-size: calc(var(--text-scale, 1) * 1em);
    }
  `;
  document.head.appendChild(style);
}
