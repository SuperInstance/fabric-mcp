# Accessibility Quick Reference Guide

## Immediate Actions for Developers

### 1. Adding Accessible Components

```tsx
// Import what you need
import { AccessibleButton, AccessibleInput, useA11y } from '@/accessibility';

// Use accessible components
<AccessibleButton
  variant="primary"
  ariaLabel="Save changes"
  onClick={handleSave}
>
  Save
</AccessibleButton>

<AccessibleInput
  label="Email"
  type="email"
  required
  value={email}
  onChange={setEmail}
  error={errors.email}
/>
```

### 2. Adding Screen Reader Announcements

```tsx
import { useA11y } from '@/accessibility';

function MyComponent() {
  const { announce } = useA11y();

  const handleAction = () => {
    // Your action here
    doSomething();

    // Announce to screen readers
    announce('Action completed successfully', 'polite');
  };

  return <button onClick={handleAction}>Do Something</button>;
}
```

### 3. Managing Focus

```tsx
import { focusManager } from '@/accessibility';

// Set focus to element
focusManager.setFocus(element);

// Create focus trap for modals
const trap = focusManager.createFocusTrap(modalContainer, {
  escapeDeactivates: true,
  returnFocusOnDeactivate: true,
});

// Activate/deactivate
trap.activate();
// later
trap.deactivate();
```

### 4. Adding Keyboard Shortcuts

```tsx
import { keyboardManager } from '@/accessibility';

// Register shortcut
keyboardManager.registerShortcut('ctrl+s', () => {
  saveData();
});

// Cleanup when done
keyboardManager.unregisterShortcut('ctrl+s');
```

## WCAG AA Quick Checklist

### Must-Have for All Components

- [ ] Keyboard accessible (all functions)
- [ ] Visible focus indicator (2px outline)
- [ ] ARIA labels for all interactive elements
- [ ] Color contrast ≥4.5:1 (normal text)
- [ ] Color contrast ≥3:1 (large text, UI)
- [ ] Screen reader announcements for changes
- [ ] Error messages with suggestions
- [ ] Labels for all form inputs
- [ ] Skip links for long pages
- [ ] No keyboard traps

### Testing Quick Checks

**Keyboard Test:**
1. Unplug mouse
2. Try to complete all tasks
3. Verify: Can you do everything?

**Screen Reader Test:**
1. Turn on NVDA/JAWS/VoiceOver
2. Navigate through your component
3. Verify: Can you understand what's happening?

**Color Contrast Test:**
1. Use axe DevTools or WAVE
2. Check all color combinations
3. Verify: All pass WCAG AA

**Focus Test:**
1. Tab through component
2. Verify: Focus is always visible
3. Verify: Logical tab order

## Common Accessibility Patterns

### Modal Dialog

```tsx
import { AccessibleModal } from '@/accessibility';

<AccessibleModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="My Modal"
  description="This is an accessible modal"
>
  <p>Modal content here</p>
</AccessibleModal>
```

### Dropdown Menu

```tsx
import { useA11y } from '@/accessibility';

function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { announce } = useA11y();

  return (
    <div>
      <button
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen(!isOpen);
          announce(isOpen ? 'Menu opened' : 'Menu closed', 'polite');
        }}
      >
        Menu
      </button>
      {isOpen && (
        <ul role="menu">
          <li role="menuitem">Item 1</li>
          <li role="menuitem">Item 2</li>
        </ul>
      )}
    </div>
  );
}
```

### Form with Validation

```tsx
import { AccessibleInput } from '@/accessibility';

function MyForm() {
  const [errors, setErrors] = useState({});

  return (
    <form>
      <AccessibleInput
        label="Email"
        type="email"
        required
        value={email}
        onChange={setEmail}
        error={errors.email}
        hint="We'll never share your email"
      />

      <button type="submit">Submit</button>
    </form>
  );
}
```

### Loading State

```tsx
import { useA11y } from '@/accessibility';

function DataLoader() {
  const { announce } = useA11y();
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    announce('Loading data...', 'polite');

    try {
      await fetchData();
      announce('Data loaded successfully', 'polite');
    } catch (error) {
      announce('Failed to load data', 'assertive');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={loadData}
      aria-busy={loading}
      disabled={loading}
    >
      {loading ? 'Loading...' : 'Load Data'}
    </button>
  );
}
```

## Debugging Accessibility Issues

### Issue: "Focus gets stuck"

**Solution:** Ensure no focus traps are left active
```tsx
// Always deactivate traps
useEffect(() => {
  const trap = focusManager.createFocusTrap(container);
  trap.activate();

  return () => trap.deactivate();
}, []);
```

### Issue: "Screen reader doesn't announce updates"

**Solution:** Use live regions
```tsx
// Create live region for dynamic content
const { announce } = useA11y();

// Announce changes
announce('Content updated', 'polite');
```

### Issue: "Can't access with keyboard"

**Solution:** Check for keyboard event handlers
```tsx
// Add keyboard support
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    handleClick();
  }
};

<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={handleKeyDown}
>
  Click me
</div>
```

### Issue: "Poor color contrast"

**Solution:** Use contrast checker
```tsx
import { checkContrastRatio } from '@/accessibility';

const result = checkContrastRatio('#000000', '#FFFFFF');
console.log(result.ratio); // Should be ≥4.5 for AA
console.log(result.passesAA); // Should be true
```

## Browser DevTools for Accessibility

### Chrome DevTools
- **Elements Panel:** Check ARIA attributes
- **Lighthouse:** Run accessibility audit
- **Accessibility Tree:** View accessibility structure

### Firefox DevTools
- **Accessibility Inspector:** View accessibility tree
- **Accessibility Panel:** Check roles and attributes

### Edge DevTools
- **Issues Panel:** Find accessibility problems
- **Lighthouse:** Run accessibility audit

## Testing Tools

### Automated Tools
- **axe DevTools:** Chrome/Firefox extension
- **WAVE:** Browser extension
- **Lighthouse:** Built into Chrome
- **pa11y:** Command-line tool

### Manual Testing
- **Keyboard:** Unplug mouse and test
- **Screen Reader:** NVDA (Windows), VoiceOver (Mac)
- **Zoom Test:** Set browser to 200% zoom
- **High Contrast:** Enable OS high contrast mode

## Accessibility First Development

### When Starting a New Component

1. **Plan accessibility first**
   - What keyboard interactions are needed?
   - What screen reader announcements?
   - What ARIA attributes?

2. **Use semantic HTML**
   - Use `<button>` for actions
   - Use `<input>` for forms
   - Use proper headings

3. **Add ARIA attributes**
   - Labels for all interactive elements
   - Roles for custom components
   - States for dynamic changes

4. **Test early and often**
   - Keyboard navigation
   - Screen reader
   - Color contrast

### Common Mistakes to Avoid

❌ **Don't:**
- Use `div` for buttons
- Rely on color alone
- Hide focus indicators
- Skip keyboard testing
- Forget ARIA labels

✅ **Do:**
- Use semantic elements
- Provide multiple indicators
- Show focus clearly
- Test with keyboard
- Add proper labels

## Getting Help

### Internal Resources
- `accessibility/README.md` - Full documentation
- `accessibility/examples.tsx` - Component examples
- `accessibility/IMPLEMENTATION_SUMMARY.md` - Detailed specs

### External Resources
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Checklist](https://webaim.org/standards/wcag/checklist)

### Screen Reader Shortcuts

**NVDA (Windows):**
- `NVDA + Tab`: Read current element
- `NVDA + B`: Read entire window
- `NVDA + D`: Say all

**JAWS (Windows):**
- `Insert + Tab`: Read current element
- `Insert + B`: Read window
- `Insert + Down Arrow`: Read all

**VoiceOver (Mac):**
- `VO + Shift + Left/Right`: Navigate
- `VO + Shift + I`: Read item
- `VO + A`: Read all

---

**Remember:** Accessibility is not optional - it's essential for creating an inclusive product.
