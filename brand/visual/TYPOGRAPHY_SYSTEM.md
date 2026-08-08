# Spreadsheet Moment - Typography System

## Typography Philosophy

Spreadsheet Moment's typography system is designed to be:
- **Legible** - Clear, readable text at all sizes
- **Hierarchical** - Clear visual hierarchy for content structure
- **Expressive** - Reflects our brand personality: intelligent, approachable
- **Accessible** - Meets WCAG 2.1 AA requirements
- **Cross-Platform** - Consistent across web, desktop, and mobile

---

## Type Families

### Primary Type Family: Inter
**"The typeface for computer interfaces"**

**Why Inter:**
- Designed specifically for computer screens
- Excellent legibility at small sizes
- Open source and widely available
- Neutral, professional personality
- Strong variable font support

**Weights:** 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

**Usage:** UI text, body copy, buttons, labels, navigation

**Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

### Secondary Type Family: JetBrains Mono
**"The typeface for developers"**

**Why JetBrains Mono:**
- Designed specifically for code and technical content
- Excellent character differentiation (0/O, 1/l/I)
- Optimized for programming ligatures
- Open source and actively maintained

**Weights:** 400 (Regular), 500 (Medium)

**Usage:** Code blocks, formulas, technical documentation, keyboard shortcuts

**Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
```

### Accent Type Family: Cal Sans
**"The typeface for headlines and moments"**

**Why Cal Sans:**
- Modern, geometric personality
- Strong visual impact for headlines
- Complementary to Inter and JetBrains Mono
- Open source variable font

**Weights:** 600 (SemiBold), 700 (Bold)

**Usage:** Marketing headlines, hero sections, announcements

**Import:**
```css
@import url('https://fonts.cdnfonts.com/css/cal-sans');
```

---

## Type Scale

### Base Settings
- **Font Size Base:** 16px (1rem)
- **Line Height Base:** 1.5 (150%)
- **Letter Spacing Base:** 0
- **Paragraph Spacing:** 1rem

### Type Scale (Major Third - 1.250)

| Scale | Rem | Pixels | Usage | Weight | Line Height |
|-------|-----|--------|-------|--------|-------------|
| **Display 1** | 4.5rem | 72px | Hero headlines (marketing) | 700 | 1.1 |
| **Display 2** | 3.75rem | 60px | Page titles (marketing) | 700 | 1.1 |
| **Display 3** | 3rem | 48px | Section headers | 700 | 1.2 |
| **Heading 1** | 2.5rem | 40px | Page titles (app) | 600 | 1.2 |
| **Heading 2** | 2rem | 32px | Major section headers | 600 | 1.3 |
| **Heading 3** | 1.5rem | 24px | Subsection headers | 600 | 1.4 |
| **Heading 4** | 1.25rem | 20px | Card titles, headers | 600 | 1.4 |
| **Heading 5** | 1rem | 16px | Small headers, labels | 600 | 1.5 |
| **Heading 6** | 0.875rem | 14px | Metadata, captions | 600 | 1.5 |
| **Body Large** | 1.125rem | 18px | Lead paragraphs, emphasis | 400 | 1.5 |
| **Body** | 1rem | 16px | Body text, content | 400 | 1.5 |
| **Body Small** | 0.875rem | 14px | Secondary text, descriptions | 400 | 1.5 |
| **Caption** | 0.75rem | 12px | Captions, fine print | 400 | 1.5 |

### Monospace Scale (Code)
| Scale | Rem | Pixels | Usage | Weight | Line Height |
|-------|-----|--------|-------|--------|-------------|
| **Code Large** | 1rem | 16px | Inline code, formulas | 400 | 1.5 |
| **Code** | 0.875rem | 14px | Code blocks | 400 | 1.6 |
| **Code Small** | 0.75rem | 12px | Small code snippets | 400 | 1.6 |

---

## Typography Tokens (CSS)

```css
:root {
  /* Font Families */
  --font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-family-secondary: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  --font-family-accent: 'Cal Sans', 'Inter', -apple-system, sans-serif;

  /* Font Sizes */
  --font-size-display-1: 4.5rem;
  --font-size-display-2: 3.75rem;
  --font-size-display-3: 3rem;
  --font-size-h1: 2.5rem;
  --font-size-h2: 2rem;
  --font-size-h3: 1.5rem;
  --font-size-h4: 1.25rem;
  --font-size-h5: 1rem;
  --font-size-h6: 0.875rem;
  --font-size-body-large: 1.125rem;
  --font-size-body: 1rem;
  --font-size-body-small: 0.875rem;
  --font-size-caption: 0.75rem;

  /* Font Weights */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Line Heights */
  --line-height-tight: 1.1;
  --line-height-snug: 1.2;
  --line-height-normal: 1.3;
  --line-height-relaxed: 1.4;
  --line-height-loose: 1.5;
  --line-height-code: 1.6;

  /* Letter Spacing */
  --letter-spacing-tight: -0.025em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.025em;
  --letter-spacing-wider: 0.05em;
  --letter-spacing-widest: 0.1em;
}
```

---

## Typography Usage Patterns

### Marketing Content

#### Hero Headline
```css
.hero-headline {
  font-family: var(--font-family-accent);
  font-size: var(--font-size-display-1);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tight);
}
```

#### Section Header
```css
.section-header {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-snug);
}
```

#### Body Copy
```css
.body-copy {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-loose);
}
```

### Application UI

#### Navigation Labels
```css
.nav-label {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-body-small);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-loose);
  letter-spacing: 0.01em;
  text-transform: none;
}
```

#### Button Text
```css
.button-text {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-normal);
}
```

#### Input Labels
```css
.input-label {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-body-small);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-relaxed);
}
```

#### Input Placeholder
```css
.input-placeholder {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-loose);
  color: var(--color-text-tertiary);
}
```

### Technical Content

#### Inline Code
```css
.inline-code {
  font-family: var(--font-family-secondary);
  font-size: 0.9em;
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-loose);
  background: var(--color-bg-tertiary);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}
```

#### Code Block
```css
.code-block {
  font-family: var(--font-family-secondary);
  font-size: var(--font-size-code);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-code);
  background: var(--color-bg-secondary);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}
```

#### Formula Display
```css
.formula-display {
  font-family: var(--font-family-secondary);
  font-size: var(--font-size-body-large);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-relaxed);
}
```

---

## Responsive Typography

### Mobile (< 640px)
- Display sizes reduced by 30%
- Heading sizes reduced by 20%
- Body text remains at base size

### Tablet (640px - 1024px)
- Display sizes reduced by 15%
- Heading sizes reduced by 10%
- Body text remains at base size

### Desktop (> 1024px)
- Full type scale in effect
- Optimal line lengths (60-75 characters)

### Fluid Typography (Optional)
```css
:root {
  --fluid-min: 320px;
  --fluid-max: 1200px;
  --fluid-font-size-min: 16px;
  --fluid-font-size-max: 20px;
}

.fluid-text {
  font-size: clamp(
    var(--fluid-font-size-min),
    calc(
      var(--fluid-font-size-min) +
      (var(--fluid-font-size-max) - var(--fluid-font-size-min)) *
      ((100vw - var(--fluid-min)) / (var(--fluid-max) - var(--fluid-min)))
    ),
    var(--fluid-font-size-max)
  );
}
```

---

## Typography Hierarchy Examples

### Document Structure
```
Display 1 (72px) - Page title (rare, marketing only)
Display 2 (60px) - Section title (marketing)
Display 3 (48px) - Major section header
Heading 1 (40px) - Primary page title
Heading 2 (32px) - Major section
  Heading 3 (24px) - Subsection
    Heading 4 (20px) - Component header
      Heading 5 (16px) - Small header
        Heading 6 (14px) - Metadata
Body (16px) - Primary content
Body Small (14px) - Secondary content
Caption (12px) - Supporting information
```

### UI Hierarchy
```
Heading 4 (20px, 600) - Card title
Body (16px, 400) - Card content
Body Small (14px, 400) - Supporting text
Caption (12px, 400) - Timestamp, metadata
```

---

## Special Typography Treatments

### Gradient Text
```css
.gradient-text {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Glow Effect
```css
.text-glow {
  text-shadow: 0 0 20px rgba(79, 70, 229, 0.5);
}
```

### Outline Text (Rare, decorative only)
```css
.text-outline {
  -webkit-text-stroke: 2px var(--color-primary);
  color: transparent;
}
```

---

## Accessibility Guidelines

### Minimum Font Sizes
- Body text: 16px minimum
- Touch targets: 16px minimum
- Captions: 12px minimum

### Line Length
- Optimal: 60-75 characters
- Maximum: 90 characters
- Minimum: 40 characters

### Line Height
- Body text: 1.5 minimum
- Headings: 1.1-1.3
- Code: 1.6 minimum

### Letter Spacing
- Avoid negative letter spacing for body text
- Use wide letter spacing for uppercase text (0.05em)
- Consider dyslexic users: 0.05em letter spacing helps

### Font Loading
```html
<!-- Preload critical fonts -->
<link rel="preload" href="/fonts/inter-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/inter-600.woff2" as="font" type="font/woff2" crossorigin>

<!-- Fallback to system fonts -->
<style>
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
</style>
```

---

## Writing Style Guidelines

### Marketing Copy
- **Tone:** Enthusiastic, inspiring, confident
- **Headings:** Short, punchy, action-oriented
- **Body:** Conversational, benefit-focused
- **CTA:** Clear, direct, urgent

### UI Text
- **Tone:** Helpful, efficient, concise
- **Labels:** Clear, descriptive, consistent
- **Messages:** Actionable, specific, helpful
- **Errors:** Non-blaming, constructive, solution-oriented

### Documentation
- **Tone:** Patient, explanatory, thorough
- **Headers:** Descriptive, scannable
- **Body:** Step-by-step, examples
- **Code:** Commented, contextual

### Technical Writing
- **Tone:** Precise, authoritative, complete
- **Structure:** Logical, hierarchical
- **Terminology:** Consistent, defined
- **Examples:** Real-world, tested

---

## Typography in Components

### Buttons
- **Primary:** 600 weight, uppercase, 0.05em letter spacing
- **Secondary:** 500 weight, title case, 0.025em letter spacing
- **Ghost:** 500 weight, title case, normal letter spacing

### Cards
- **Title:** 600 weight, 20px
- **Description:** 400 weight, 14px, secondary text color
- **Metadata:** 400 weight, 12px, tertiary text color

### Forms
- **Label:** 500 weight, 14px, uppercase, 0.05em letter spacing
- **Input:** 400 weight, 16px
- **Helper Text:** 400 weight, 12px, secondary text color
- **Error Text:** 500 weight, 12px, error color

### Tables
- **Header:** 600 weight, 12px, uppercase, 0.05em letter spacing
- **Cell:** 400 weight, 14px
- **Caption:** 400 weight, 12px, tertiary text color

---

## Brand Voice Typography

### Personality Through Typography
- **Intelligent:** Clean, precise type choices (Inter, JetBrains Mono)
- **Approachable:** Readable, generous spacing, neutral tone
- **Empowering:** Clear hierarchy, confident sizing
- **Professional:** Consistent, disciplined, reliable

### Emotional Hierarchy
1. **Marketing:** Expressive, impactful (Cal Sans for headlines)
2. **Application:** Functional, efficient (Inter for UI)
3. **Technical:** Precise, reliable (JetBrains Mono for code)

---

## Testing and Validation

### Legibility Testing
- Test at all sizes in the type scale
- Test on various devices and screen sizes
- Test with actual content, not placeholder text
- Test with users of varying ages and visual abilities

### Cross-Platform Testing
- Windows (ClearType)
- macOS (font smoothing)
- Linux (various font rendering)
- Mobile devices (platform-specific rendering)

### Accessibility Testing
- Screen reader compatibility
- Zoom compatibility (200% zoom)
- High contrast mode
- Text resize compatibility (up to 200%)

---

## Evolution Strategy

### Phase 1: Launch
- Implement core type scale (Inter + JetBrains Mono)
- Establish typography tokens
- Create component-level styles

### Phase 2: Optimization
- Refine based on user feedback
- Optimize font loading performance
- Add advanced typographic features (optional ligatures, etc.)

### Phase 3: Enhancement
- Add variable fonts for performance
- Implement fluid typography
- Create brand-specific typographic treatments

---

**Last Updated:** 2026-03-15
**Version:** 1.0
**Owner:** Spreadsheet Moment Design Team
