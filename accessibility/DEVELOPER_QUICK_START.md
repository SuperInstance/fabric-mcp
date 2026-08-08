# Accessibility Quick Start Guide
## For Spreadsheet Moment Developers

**Version:** 2.0
**Last Updated:** March 15, 2026
**Reading Time:** 5 minutes

---

## Overview

This guide helps you integrate accessibility features into your components quickly. Follow these patterns to maintain 98%+ WCAG 2.1 Level AA compliance.

---

## Table of Contents

1. [Basic Component Patterns](#basic-component-patterns)
2. [Common Accessibility Issues](#common-accessibility-issues)
3. [Testing Checklist](#testing-checklist)
4. [Quick Reference](#quick-reference)

---

## Basic Component Patterns

### 1. Accessible Button

```typescript
import { EnhancedIconButton } from '@/accessibility';

// ✅ Good: Icon button with label
<EnhancedIconButton
  icon={<SettingsIcon />}
  label="Settings"
  ariaLabel="Open settings panel"
  onClick={handleSettings}
/>

// ❌ Bad: Icon button without label
<button onClick={handleSettings}>
  <SettingsIcon />
</button>
```

### 2. Accessible Link

```typescript
import { EnhancedLink } from '@/accessibility';

// ✅ Good: Descriptive link
<EnhancedLink href="/dashboard">
  View Dashboard
</EnhancedLink>

// ✅ Good: Link with aria-label when text is generic
<EnhancedLink
  href="/documentation"
  ariaLabel="View full documentation"
>
  Learn More
</EnhancedLink>

// ❌ Bad: Generic link without context
<a href="/page">Click here</a>
```

### 3. Accessible Input

```typescript
// ✅ Good: Properly labeled input
<div>
  <label htmlFor="email">Email address</label>
  <input
    id="email"
    type="email"
    aria-required="true"
    aria-describedby="email-help"
  />
  <span id="email-help">We'll never share your email.</span>
</div>

// ❌ Bad: Input without label
<input type="email" placeholder="Email" />
```

### 4. Accessible Modal

```typescript
// ✅ Good: Modal with proper ARIA
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Settings</h2>
  <p id="modal-description">Configure your preferences</p>
  {/* Content */}
</div>

// ❌ Bad: Modal without ARIA
<div className="modal">
  <h2>Settings</h2>
  {/* Content */}
</div>
```

### 5. Skip Links

```typescript
import { EnhancedSkipLinks } from '@/accessibility';

// Add to root layout
function Layout() {
  return (
    <>
      <EnhancedSkipLinks />
      <Header />
      <main id="main-content">
        {children}
      </main>
      <Footer />
    </>
  );
}
```

### 6. ARIA Landmarks

```typescript
import { AriaLandmark } from '@/accessibility';

// ✅ Good: Proper landmarks
<AriaLandmark role="main" label="Dashboard content">
  {dashboardContent}
</AriaLandmark>

<AriaLandmark role="navigation" label="Main menu">
  <nav>{menuItems}</nav>
</AriaLandmark>

<AriaLandmark role="complementary" label="Sidebar">
  <aside>{sidebarContent}</aside>
</AriaLandmark>
```

### 7. Dynamic Content

```typescript
import { useAnnounce } from '@/accessibility';

function DataTable() {
  const announce = useAnnounce();

  const handleDataUpdate = (newData) => {
    setData(newData);
    announce('Data updated successfully', 'polite');
  };

  return (
    <div role="region" aria-live="polite" aria-atomic="true">
      {/* Table content */}
    </div>
  );
}
```

### 8. Page Titles

```typescript
import { usePageTitle } from '@/accessibility';

function DashboardPage() {
  usePageTitle('Dashboard');

  return (
    <div>
      {/* Page content */}
    </div>
  );
}
```

---

## Common Accessibility Issues

### Issue 1: Missing Alt Text

```typescript
// ❌ Bad: Image without alt
<img src="/chart.png" />

// ✅ Good: Image with descriptive alt
<img src="/chart.png" alt="Sales chart showing 25% increase" />

// ✅ Good: Decorative image
<img src="/decorative.png" alt="" role="presentation" />
```

### Issue 2: Poor Color Contrast

```typescript
// ❌ Bad: Low contrast text
<span style={{ color: '#999', background: '#fff' }}>
  This text is hard to read
</span>

// ✅ Good: High contrast text
<span style={{ color: '#1f2937', background: '#ffffff' }}>
  This text is easy to read
</span>
```

### Issue 3: Keyboard Traps

```typescript
// ❌ Bad: Modal without focus trap
<div className="modal">
  <button onClick={close}>Close</button>
</div>

// ✅ Good: Modal with focus management
const Modal = ({ isOpen, onClose }) => {
  const previousFocus = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement;
      // Focus first element
      const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea'
      );
      firstFocusable?.focus();
    } else {
      previousFocus.current?.focus();
    }
  }, [isOpen]);

  // ... rest of component
};
```

### Issue 4: Missing Form Labels

```typescript
// ❌ Bad: Input without label
<input type="text" placeholder="Name" />

// ✅ Good: Input with proper label
<label htmlFor="name">Full name</label>
<input id="name" type="text" />
```

### Issue 5: Generic Link Text

```typescript
// ❌ Bad: Generic link text
<a href="/documentation">Click here</a> to view docs

// ✅ Good: Descriptive link text
<a href="/documentation">View documentation</a>

// ✅ Good: Context makes purpose clear
<p>
  Read the <a href="/documentation">API documentation</a> for details.
</p>
```

---

## Testing Checklist

### Before Committing Code

- [ ] **Keyboard Navigation**: Can I tab through all interactive elements?
- [ ] **Focus Indicators**: Can I see which element has focus?
- [ ] **Screen Reader**: Does a screen reader announce elements correctly?
- [ ] **Color Contrast**: Do colors meet WCAG AA standards?
- [ ] **Form Labels**: Do all inputs have associated labels?
- [ ] **Alt Text**: Do all images have appropriate alt text?
- [ ] **ARIA Attributes**: Are ARIA attributes used correctly?
- [ ] **Page Title**: Does the page have a unique, descriptive title?

### Automated Testing

```bash
# Run all accessibility tests
npm run test:a11y:all

# Run specific test suites
npm run test:a11y:axe      # axe-core tests
npm run test:a11y:pa11y    # Pa11y tests
npm run test:a11y:lighthouse  # Lighthouse tests
```

### Manual Testing Tools

1. **Keyboard Only**
   - Unplug your mouse
   - Navigate the entire application
   - Verify all functionality is available

2. **Screen Reader**
   - NVDA (Windows, Free): https://www.nvaccess.org/
   - VoiceOver (Mac): Cmd+F5 to enable
   - TalkBack (Android): Settings → Accessibility → TalkBack

3. **Browser Extensions**
   - axe DevTools: https://www.deque.com/axe/devtools/
   - WAVE: https://wave.webaim.org/
   - Lighthouse: Built into Chrome DevTools

---

## Quick Reference

### ARIA Roles

| Component | Use Role |
|-----------|----------|
| Navigation bar | `role="navigation"` |
| Main content | `role="main"` |
| Header | `role="banner"` |
| Footer | `role="contentinfo"` |
| Sidebar | `role="complementary"` |
| Search | `role="search"` |
| Dialog/Modal | `role="dialog"` |
| Alert | `role="alert"` |
| Button (div) | `role="button"` |
| Link (div) | `role="link"` |

### ARIA Attributes

| Attribute | Usage |
|-----------|-------|
| `aria-label` | Accessible name for element |
| `aria-labelledby` | Element labeled by another ID |
| `aria-describedby` | Element described by another ID |
| `aria-hidden="true"` | Hide from screen readers |
| `aria-expanded` | Toggle state (true/false) |
| `aria-selected` | Selection state (true/false) |
| `aria-live="polite"` | Announce changes when idle |
| `aria-live="assertive"` | Announce changes immediately |
| `aria-modal="true"` | Modal dialog |
| `aria-required="true"` | Required form field |

### WCAG AA Contrast Ratios

| Element | Minimum Ratio |
|---------|---------------|
| Normal text (<18pt) | 4.5:1 |
| Large text (≥18pt) | 3:1 |
| UI components | 3:1 |
| Graphical objects | 3:1 |

### Focus Management

```typescript
// Set focus programmatically
elementRef.current?.focus();

// Focus on mount
useEffect(() => {
  inputRef.current?.focus();
}, []);

// Restore focus on unmount
useEffect(() => {
  const previousFocus = document.activeElement;
  return () => {
    (previousFocus as HTMLElement)?.focus();
  };
}, []);
```

---

## Best Practices

### 1. Semantic HTML

```typescript
// ✅ Good: Semantic elements
<header>...</header>
<nav>...</nav>
<main>...</main>
<aside>...</aside>
<footer>...</footer>

// ❌ Bad: Generic divs
<div className="header">...</div>
<div className="nav">...</div>
<div className="main">...</div>
```

### 2. Heading Hierarchy

```typescript
// ✅ Good: Proper hierarchy
<h1>Page Title</h1>
  <h2>Section Title</h2>
    <h3>Subsection Title</h3>

// ❌ Bad: Skipped levels
<h1>Page Title</h1>
  <h3>Subsection Title</h3>  // Skipped h2
```

### 3. Lists

```typescript
// ✅ Good: Semantic lists
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>

// ❌ Bad: Generic divs
<div>
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### 4. Error Handling

```typescript
// ✅ Good: Accessible error messages
<div>
  <input
    id="email"
    aria-invalid={!!error}
    aria-errormessage={error ? "email-error" : undefined}
  />
  {error && (
    <span id="email-error" role="alert">
      {error}
    </span>
  )}
</div>
```

### 5. Loading States

```typescript
// ✅ Good: Announce loading
<div aria-busy={isLoading} aria-live="polite">
  {isLoading ? 'Loading...' : content}
</div>
```

---

## Getting Help

### Resources
- **WCAG 2.1 Quick Reference**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices**: https://www.w3.org/WAI/ARIA/apg/
- **WebAIM**: https://webaim.org/

### Team
- **Accessibility Lead**: accessibility@superinstance.ai
- **Slack Channel**: #accessibility
- **Documentation**: /accessibility/ACCESSIBILITY_IMPROVEMENTS.md

### Tools
- **axe DevTools**: Chrome Extension
- **WAVE**: https://wave.webaim.org/
- **Lighthouse**: Chrome DevTools → Lighthouse

---

## Quick Tips

1. **Always test with keyboard only** - Unplug your mouse
2. **Use semantic HTML** - It provides accessibility for free
3. **Add labels to everything** - If you can see it, label it
4. **Check color contrast** - Use axe DevTools or WebAIM checker
5. **Test with screen readers** - NVDA is free and works well
6. **Use ARIA carefully** - Native HTML is usually better
7. **Announce dynamic changes** - Use aria-live regions
8. **Manage focus properly** - Especially in modals and dynamic content
9. **Provide skip links** - Let users bypass repeated content
10. **Test early and often** - Don't leave accessibility to the end

---

**Remember**: Accessibility is a core part of quality, not an add-on. Building accessible components means building better components for everyone.

---

**Version:** 2.0
**Last Updated:** March 15, 2026
**Maintained By:** Accessibility Team
