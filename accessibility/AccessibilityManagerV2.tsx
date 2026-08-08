/**
 * Spreadsheet Moment - Enhanced WCAG 2.1 AA Accessibility System
 *
 * Version 2.0 - Comprehensive accessibility improvements
 * Target: 98%+ WCAG 2.1 Level AA compliance
 *
 * Key Improvements:
 * - Dynamic page title management
 * - Enhanced skip navigation
 * - Improved focus indicators
 * - ARIA landmarks management
 * - Better color contrast
 * - Complete icon labeling
 * - Link description improvements
 * - Motion preferences support
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

/**
 * Enhanced accessibility preferences
 */
export interface A11yPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  textScale: number;
  screenReader: boolean;
  fontSize: 'small' | 'normal' | 'large' | 'extra-large';
  showFocus: boolean;
  disableAnimations: boolean;
}

/**
 * Page title configuration
 */
interface PageTitleConfig {
  basename: string;
  separator: string;
  routeMap: Record<string, string>;
}

/**
 * Accessibility context value
 */
interface A11yContextValue {
  preferences: A11yPreferences;
  updatePreferences: (updates: Partial<A11yPreferences>) => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  focusElement: (selector: string) => boolean;
  setPageTitle: (pageName: string) => void;
  registerLandmark: (role: string, label: string, element: HTMLElement) => void;
}

const A11yContext = createContext<A11yContextValue>({
  preferences: {
    reducedMotion: false,
    highContrast: false,
    textScale: 1.0,
    screenReader: false,
    fontSize: 'normal',
    showFocus: true,
    disableAnimations: false,
  },
  updatePreferences: () => {},
  announce: () => {},
  focusElement: () => false,
  setPageTitle: () => {},
  registerLandmark: () => {},
});

/**
 * Default page title configuration
 */
const DEFAULT_TITLE_CONFIG: PageTitleConfig = {
  basename: 'Spreadsheet Moment',
  separator: ' - ',
  routeMap: {
    '/': 'Home',
    '/dashboard': 'Dashboard',
    '/spreadsheet': 'Spreadsheet',
    '/analytics': 'Analytics',
    '/settings': 'Settings',
    '/community': 'Community',
    '/templates': 'Templates',
    '/login': 'Sign In',
    '/register': 'Create Account',
  },
};

/**
 * Enhanced Accessibility Provider
 */
export function A11yProviderV2({
  children,
  titleConfig = DEFAULT_TITLE_CONFIG,
}: {
  children: React.ReactNode;
  titleConfig?: Partial<PageTitleConfig>;
}) {
  const config = { ...DEFAULT_TITLE_CONFIG, ...titleConfig };
  const [preferences, setPreferences] = useState<A11yPreferences>(() => {
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const prefersHighContrast = window.matchMedia('(prefers-contrast: more)').matches;

      return {
        reducedMotion: prefersReducedMotion,
        highContrast: prefersHighContrast,
        textScale: 1.0,
        screenReader: false,
        fontSize: 'normal',
        showFocus: true,
        disableAnimations: prefersReducedMotion,
      };
    }
    return {
      reducedMotion: false,
      highContrast: false,
      textScale: 1.0,
      screenReader: false,
      fontSize: 'normal',
      showFocus: true,
      disableAnimations: false,
    };
  });

  const liveRegionRef = useRef<HTMLDivElement | null>(null);
  const assertiveRegionRef = useRef<HTMLDivElement | null>(null);
  const landmarksRef = useRef<Map<string, HTMLElement>>(new Map());
  const previousTitleRef = useRef<string>('');

  // Enhanced CSS variable updates
  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty('--text-scale', preferences.textScale.toString());
    root.style.setProperty('--focus-ring-width', preferences.showFocus ? '2px' : '0');
    root.style.setProperty('--focus-ring-color', preferences.highContrast ? '#000' : '#3b82f6');

    if (preferences.highContrast) {
      root.classList.add('high-contrast');
      root.classList.add('force-focus-visible');
    } else {
      root.classList.remove('high-contrast');
      root.classList.remove('force-focus-visible');
    }

    if (preferences.reducedMotion || preferences.disableAnimations) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

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
      updatePreferences({ reducedMotion: e.matches, disableAnimations: e.matches });
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

  // Enhanced screen reader detection
  useEffect(() => {
    let screenReaderDetected = false;
    let keyboardNavigationCount = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Track keyboard navigation patterns
      if (e.key === 'Tab' || e.key === 'Enter') {
        keyboardNavigationCount++;

        // Screen readers often use specific navigation patterns
        if (keyboardNavigationCount > 5) {
          const activeElement = document.activeElement;
          if (activeElement) {
            const styles = getComputedStyle(activeElement);
            // Screen readers may interact with hidden elements
            if (styles.display === 'none' || styles.visibility === 'hidden') {
              screenReaderDetected = true;
            }
          }
        }
      }
    };

    const handleTouchStart = () => {
      // Touch device detected, likely not a screen reader user
      screenReaderDetected = false;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('touchstart', handleTouchStart);

    // Debounced update
    const timer = setTimeout(() => {
      if (screenReaderDetected) {
        updatePreferences({ screenReader: true });
      }
    }, 2000);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('touchstart', handleTouchStart);
      clearTimeout(timer);
    };
  }, []);

  const updatePreferences = useCallback((updates: Partial<A11yPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const region = priority === 'assertive' ? assertiveRegionRef.current : liveRegionRef.current;
    if (!region) return;

    // Clear previous message
    region.textContent = '';

    // Use setTimeout to ensure screen readers register the change
    setTimeout(() => {
      if (region) {
        region.textContent = message;
      }
    }, 100);
  }, []);

  const focusElement = useCallback((selector: string): boolean => {
    const element = document.querySelector<HTMLElement>(selector);
    if (element) {
      element.focus();
      announce(`Focused on ${element.getAttribute('aria-label') || element.textContent || selector}`);
      return true;
    }
    return false;
  }, [announce]);

  // Dynamic page title management
  const setPageTitle = useCallback((pageName: string) => {
    const currentPath = window.location.pathname;
    const routeTitle = config.routeMap[currentPath] || pageName;

    const newTitle = routeTitle
      ? `${routeTitle}${config.separator}${config.basename}`
      : config.basename;

    if (newTitle !== previousTitleRef.current) {
      document.title = newTitle;
      previousTitleRef.current = newTitle;

      // Announce page change to screen readers
      announce(`Navigated to ${routeTitle || 'page'}`, 'polite');
    }
  }, [config, announce]);

  // ARIA landmarks management
  const registerLandmark = useCallback((role: string, label: string, element: HTMLElement) => {
    if (!element) return;

    // Set ARIA attributes
    element.setAttribute('role', role);
    element.setAttribute('aria-label', label);

    // Track landmarks
    landmarksRef.current.set(`${role}-${label}`, element);

    // Announce new landmark
    announce(`${label} region available`, 'polite');
  }, [announce]);

  return (
    <A11yContext.Provider
      value={{
        preferences,
        updatePreferences,
        announce,
        focusElement,
        setPageTitle,
        registerLandmark,
      }}
    >
      {/* Enhanced live regions */}
      <div
        ref={liveRegionRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        aria-hidden="false"
      />
      <div
        ref={assertiveRegionRef}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        aria-hidden="false"
      />
      {children}
    </A11yContext.Provider>
  );
}

/**
 * Hook to use enhanced accessibility features
 */
export function useA11yV2() {
  return useContext(A11yContext);
}

/**
 * Enhanced Skip Links Component
 * Addresses: WCAG 2.4.1 Bypass Blocks
 */
export function EnhancedSkipLinks() {
  const { focusElement } = useA11yV2();

  const skipLinks = [
    { id: 'skip-main', label: 'Skip to main content', target: '#main-content' },
    { id: 'skip-nav', label: 'Skip to navigation', target: '#main-navigation' },
    { id: 'skip-search', label: 'Skip to search', target: '#search' },
  ];

  const handleSkip = (target: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.querySelector<HTMLElement>(target);
    if (element) {
      element.tabIndex = -1;
      element.focus();
      focusElement(target);
      // Reset tabindex after blur
      element.addEventListener('blur', () => element.removeAttribute('tabindex'), { once: true });
    }
  };

  return (
    <div className="skip-links">
      {skipLinks.map((link) => (
        <a
          key={link.id}
          href={link.target}
          onClick={handleSkip(link.target)}
          className="skip-link"
          data-skip-link={link.id}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

/**
 * Enhanced Focus Wrapper Component
 * Ensures visible focus indicators (WCAG 2.4.7 Focus Visible)
 */
export function FocusWrapper({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { preferences } = useA11yV2();

  return (
    <div
      className={`focus-wrapper ${preferences.showFocus ? 'show-focus' : ''} ${className}`.trim()}
      data-focus-wrapper="true"
    >
      {children}
    </div>
  );
}

/**
 * Enhanced Icon Button Component
 * Ensures proper ARIA labels (WCAG 1.1.1 Non-text Content)
 */
export function EnhancedIconButton({
  icon,
  label,
  ariaLabel,
  ariaDescription,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: React.ReactNode;
  label: string;
  ariaLabel?: string;
  ariaDescription?: string;
}) {
  return (
    <button
      aria-label={ariaLabel || label}
      aria-describedby={ariaDescription}
      {...props}
      className={`icon-button ${props.className || ''}`.trim()}
    >
      <span className="sr-only">{label}</span>
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}

/**
 * Enhanced Link Component
 * Ensures descriptive link text (WCAG 2.4.4 Link Purpose)
 */
export function EnhancedLink({
  href,
  children,
  ariaLabel,
  ariaDescription,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: React.ReactNode;
  ariaLabel?: string;
  ariaDescription?: string;
}) {
  const textContent = typeof children === 'string' ? children : null;
  const needsAriaLabel = !textContent || ['click here', 'read more', 'more'].includes(textContent.toLowerCase());

  return (
    <a
      href={href}
      aria-label={needsAriaLabel ? ariaLabel || textContent : undefined}
      aria-describedby={ariaDescription}
      {...props}
      className={`enhanced-link ${props.className || ''}`.trim()}
    >
      {children}
    </a>
  );
}

/**
 * ARIA Landmark Component
 * Helps with landmark navigation (WCAG 1.3.1 Info and Relationships)
 */
export function AriaLandmark({
  role,
  label,
  children,
  as = 'div',
  ...props
}: {
  role: string;
  label: string;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  [key: string]: any;
}) {
  const { registerLandmark } = useA11yV2();
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      registerLandmark(role, label, elementRef.current);
    }
  }, [role, label, registerLandmark]);

  const Component = as as keyof JSX.IntrinsicElements;

  return (
    <Component
      ref={elementRef as any}
      role={role}
      aria-label={label}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * Visibly Hidden Component (screen reader only)
 */
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="sr-only"
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
 * Enhanced Page Title Manager
 * Automatically updates document.title based on route
 */
export function usePageTitle(pageName: string) {
  const { setPageTitle } = useA11yV2();

  useEffect(() => {
    setPageTitle(pageName);
  }, [pageName, setPageTitle]);
}

/**
 * Motion preference hook
 */
export function useMotionPreference() {
  const { preferences } = useA11yV2();
  return preferences.reducedMotion || preferences.disableAnimations;
}

/**
 * High contrast mode hook
 */
export function useHighContrastMode() {
  const { preferences } = useA11yV2();
  return preferences.highContrast;
}

/**
 * Enhanced CSS injection
 */
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.id = 'enhanced-a11y-styles';
  style.textContent = `
    /* Screen reader only content */
    .sr-only {
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    }

    .sr-only-focusable:focus {
      position: static !important;
      width: auto !important;
      height: auto !important;
      padding: inherit !important;
      margin: inherit !important;
      overflow: visible !important;
      clip: auto !important;
      white-space: normal !important;
    }

    /* Enhanced skip links */
    .skip-links {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .skip-link {
      position: absolute;
      top: -100%;
      left: 8px;
      padding: 12px 24px;
      background: #000;
      color: #fff;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      font-size: 14px;
      transition: top 0.3s ease;
      z-index: 9999;
    }

    .skip-link:hover,
    .skip-link:focus {
      top: 8px;
      outline: 3px solid #fff;
      outline-offset: 2px;
    }

    /* Enhanced focus indicators (WCAG 2.4.7) */
    :focus-visible {
      outline: 3px solid var(--focus-ring-color, #3b82f6) !important;
      outline-offset: 2px !important;
    }

    .force-focus-visible *:focus {
      outline: 3px solid #000 !important;
      outline-offset: 2px !important;
    }

    /* High contrast mode */
    @media (prefers-contrast: high) {
      .high-contrast * {
        border: 2px solid currentColor !important;
        outline: 2px solid currentColor !important;
      }
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce),
    .reduced-motion {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }

    /* Enhanced button focus */
    button:focus-visible,
    a:focus-visible,
    [role="button"]:focus-visible {
      outline: 3px solid var(--focus-ring-color, #3b82f6) !important;
      outline-offset: 2px !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
    }

    /* Enhanced form focus */
    input:focus-visible,
    textarea:focus-visible,
    select:focus-visible {
      outline: 3px solid var(--focus-ring-color, #3b82f6) !important;
      outline-offset: 2px !important;
      border-color: var(--focus-ring-color, #3b82f6) !important;
    }

    /* Skip link visibility */
    .skip-link:not(:focus) {
      position: absolute;
      top: -100px;
    }

    /* Icon button styles */
    .icon-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .icon-button .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
    }

    /* Enhanced link styles */
    .enhanced-link:focus-visible {
      outline: 3px solid var(--focus-ring-color, #3b82f6) !important;
      outline-offset: 2px !important;
      text-decoration: underline;
    }

    /* Landmark region styles */
    [role="banner"],
    [role="navigation"],
    [role="main"],
    [role="complementary"],
    [role="contentinfo"],
    [role="search"] {
      position: relative;
    }
  `;
  document.head.appendChild(style);
}

export default A11yProviderV2;
