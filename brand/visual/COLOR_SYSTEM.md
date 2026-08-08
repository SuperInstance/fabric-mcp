# Spreadsheet Moment - Color System

## Color Philosophy

Spreadsheet Moment's color system is designed to be:
- **Accessible** - WCAG 2.1 AA compliant (4.5:1 contrast ratio minimum)
- **Semantic** - Colors communicate meaning and function
- **Scalable** - Works across light and dark modes
- **Emotional** - Evokes our brand personality: intelligent, approachable, empowering

---

## Primary Palette

### Brand Primary
**"Moment Indigo"**
- **Light Mode:** `#4F46E5` (Indigo 600)
- **Dark Mode:** `#6366F1` (Indigo 500)
- **Usage:** Primary actions, links, brand presence
- **Psychology:** Intelligence, trust, innovation
- **Accessibility:** 4.5:1 contrast with white text

### Brand Secondary
**"Insight Teal"**
- **Light Mode:** `#0D9488` (Teal 600)
- **Dark Mode:** `#14B8A6` (Teal 500)
- **Usage:** Secondary actions, success states, highlights
- **Psychology:** Clarity, growth, balance
- **Accessibility:** 4.5:1 contrast with white text

### Brand Accent
**"Discovery Amber"**
- **Light Mode:** `#F59E0B` (Amber 500)
- **Dark Mode:** `#FBBF24` (Amber 400)
- **Usage:** Call-to-action buttons, warnings, highlights
- **Psychology:** Energy, creativity, optimism
- **Accessibility:** 4.5:1 contrast with dark text

---

## Neutral Palette

### Text Colors

#### Primary Text
- **Light Mode:** `#111827` (Gray 900)
- **Dark Mode:** `#F9FAFB` (Gray 50)
- **Usage:** Headings, body text, primary content
- **Accessibility:** 15:1+ contrast ratio

#### Secondary Text
- **Light Mode:** `#4B5563` (Gray 600)
- **Dark Mode:** `#9CA3AF` (Gray 400)
- **Usage:** Supporting text, descriptions, metadata
- **Accessibility:** 7:1+ contrast ratio

#### Tertiary Text
- **Light Mode:** `#9CA3AF` (Gray 400)
- **Dark Mode:** `#6B7280` (Gray 500)
- **Usage:** Disabled text, placeholders, hints
- **Accessibility:** 4.5:1+ contrast ratio

### Background Colors

#### Primary Background
- **Light Mode:** `#FFFFFF` (White)
- **Dark Mode:** `#111827` (Gray 900)
- **Usage:** Main canvas, card backgrounds
- **Psychology:** Clarity, focus, simplicity

#### Secondary Background
- **Light Mode:** `#F9FAFB` (Gray 50)
- **Dark Mode:** `#1F2937` (Gray 800)
- **Usage:** Subtle section separation, nested containers
- **Psychology:** Depth without distraction

#### Tertiary Background
- **Light Mode:** `#F3F4F6` (Gray 100)
- **Dark Mode:** `#374151` (Gray 700)
- **Usage:** Hover states, subtle emphasis
- **Psychology:** Interactive feedback

### Border Colors

#### Default Border
- **Light Mode:** `#E5E7EB` (Gray 200)
- **Dark Mode:** `#374151` (Gray 700)
- **Usage:** Default borders, dividers
- **Visibility:** Subtle but clear

#### Emphasis Border
- **Light Mode:** `#D1D5DB` (Gray 300)
- **Dark Mode:** `#4B5563` (Gray 600)
- **Usage:** Active states, focused elements
- **Visibility:** Clear visual hierarchy

#### Subtle Border
- **Light Mode:** `#F3F4F6` (Gray 100)
- **Dark Mode:** `#1F2937` (Gray 800)
- **Usage:** Very subtle dividers, internal borders
- **Visibility:** Minimal visual weight

---

## Semantic Colors

### Success
**"Breakthrough Green"**
- **Light Mode:** `#10B981` (Emerald 500)
- **Dark Mode:** `#34D399` (Emerald 400)
- **Usage:** Success messages, completed states, positive indicators
- **Psychology:** Achievement, completion, correctness
- **Accessibility:** 4.5:1 contrast ratio

**Variants:**
- Success Light: `#D1FAE5` (Emerald 100) - backgrounds
- Success Dark: `#065F46` (Emerald 800) - text on light backgrounds

### Warning
**"Caution Orange"**
- **Light Mode:** `#F97316` (Orange 500)
- **Dark Mode:** `#FB923C` (Orange 400)
- **Usage:** Warning messages, caution states
- **Psychology:** Attention without alarm
- **Accessibility:** 4.5:1 contrast ratio

**Variants:**
- Warning Light: `#FFEDD5` (Orange 100) - backgrounds
- Warning Dark: `#9A3412` (Orange 800) - text on light backgrounds

### Error
**"Critical Red"**
- **Light Mode:** `#EF4444` (Red 500)
- **Dark Mode:** `#F87171` (Red 400)
- **Usage:** Error messages, destructive actions, critical issues
- **Psychology:** Urgency, importance, attention
- **Accessibility:** 4.5:1 contrast ratio

**Variants:**
- Error Light: `#FEE2E2` (Red 100) - backgrounds
- Error Dark: `#991B1B` (Red 800) - text on light backgrounds

### Info
**"Guidance Blue"**
- **Light Mode:** `#3B82F6` (Blue 500)
- **Dark Mode:** `#60A5FA` (Blue 400)
- **Usage:** Informational messages, help text, tips
- **Psychology:** Trust, information, assistance
- **Accessibility:** 4.5:1 contrast ratio

**Variants:**
- Info Light: `#DBEAFE` (Blue 100) - backgrounds
- Info Dark: `#1E40AF` (Blue 800) - text on light backgrounds

---

## Data Visualization Colors

### Categorical Colors (Qualitative)
For charts and graphs with discrete categories:

1. **Primary:** `#4F46E5` (Indigo 600)
2. **Secondary:** `#0D9488` (Teal 600)
3. **Tertiary:** `#F59E0B` (Amber 500)
4. **Quaternary:** `#EC4899` (Pink 500)
5. **Quinary:** `#8B5CF6` (Violet 500)
6. **Senary:** `#10B981` (Emerald 500)

**Design Principles:**
- Distinct colors for colorblind accessibility (deuteranopia, protanopia, tritanopia)
- Balanced lightness values for monochrome printing
- Consistent saturation levels for visual harmony

### Sequential Colors (Quantitative)
For heat maps and gradient visualizations:

**Cool Palette (Low to High):**
1. `#E0E7FF` (Indigo 100) - lowest
2. `#A5B4FC` (Indigo 300)
3. `#6366F1` (Indigo 500)
4. `#4338CA` (Indigo 700)
5. `#312E81` (Indigo 900) - highest

**Warm Palette (Low to High):**
1. `#FEF3C7` (Amber 100) - lowest
2. `#FCD34D` (Amber 300)
3. `#FBBF24` (Amber 500)
4. `#D97706` (Amber 700)
5. `#92400E` (Amber 900) - highest

### Diverging Colors
For visualizations with meaningful center point:

**Negative (Cold) to Neutral to Positive (Hot):**
1. `#0D9488` (Teal 600) - most negative
2. `#2DD4BF` (Teal 400)
3. `#E5E7EB` (Gray 200) - neutral
4. `#FB923C` (Orange 400)
5. `#DC2626` (Red 600) - most positive

---

## Color Tokens (Design Tokens)

### CSS Custom Properties
```css
:root {
  /* Brand Colors */
  --color-primary: #4F46E5;
  --color-primary-hover: #4338CA;
  --color-primary-active: #3730A3;

  --color-secondary: #0D9488;
  --color-secondary-hover: #0F766E;
  --color-secondary-active: #115E59;

  --color-accent: #F59E0B;
  --color-accent-hover: #D97706;
  --color-accent-active: #B45309;

  /* Neutral Colors */
  --color-text-primary: #111827;
  --color-text-secondary: #4B5563;
  --color-text-tertiary: #9CA3AF;

  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F9FAFB;
  --color-bg-tertiary: #F3F4F6;

  --color-border-default: #E5E7EB;
  --color-border-emphasis: #D1D5DB;
  --color-border-subtle: #F3F4F6;

  /* Semantic Colors */
  --color-success: #10B981;
  --color-warning: #F97316;
  --color-error: #EF4444;
  --color-info: #3B82F6;
}

[data-theme="dark"] {
  --color-primary: #6366F1;
  --color-primary-hover: #818CF8;
  --color-primary-active: #4F46E5;

  --color-secondary: #14B8A6;
  --color-secondary-hover: #2DD4BF;
  --color-secondary-active: #0D9488;

  --color-accent: #FBBF24;
  --color-accent-hover: #F59E0B;
  --color-accent-active: #D97706;

  --color-text-primary: #F9FAFB;
  --color-text-secondary: #9CA3AF;
  --color-text-tertiary: #6B7280;

  --color-bg-primary: #111827;
  --color-bg-secondary: #1F2937;
  --color-bg-tertiary: #374151;

  --color-border-default: #374151;
  --color-border-emphasis: #4B5563;
  --color-border-subtle: #1F2937;
}
```

### Tailwind Configuration
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        secondary: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        accent: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
      },
    },
  },
}
```

---

## Color Usage Guidelines

### Do's
✅ Use semantic colors for their intended purpose
✅ Ensure 4.5:1 contrast ratio for text and interactive elements
✅ Test color combinations in both light and dark modes
✅ Use color in combination with other indicators (icons, text)
✅ Consider colorblind accessibility in all color choices
✅ Use the palette consistently across all touchpoints

### Don'ts
❌ Don't use color as the only indicator of meaning
❌ Don't use semantic colors for decorative purposes
❌ Don't create new colors outside the palette
❌ Don't use low-contrast colors for important information
❌ Don't rely on color alone to convey error or success
❌ Don't use color combinations that vibrate or cause discomfort

---

## Accessibility Considerations

### Color Blindness
- Test with deuteranopia, protanopia, and tritanopia simulators
- Use patterns, textures, or labels in addition to color
- Ensure primary/secondary color distinction works for all types

### Contrast Ratios
- Normal text (14px+): 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- Graphical objects and UI components: 3:1 minimum
- Focus indicators: 3:1 minimum against adjacent colors

### Light Sensitivity
- Avoid pure white backgrounds (#FFFFFF) in dark mode
- Provide options to reduce saturation
- Test for strobing or flickering effects

### Testing Tools
- WebAIM Contrast Checker
- Chrome DevTools contrast ratio tool
- Color Oracle (colorblindness simulator)
- Stark (Sketch/Figma plugin)

---

## Print Considerations

### CMYK Equivalents
For print materials:

**Moment Indigo**
- RGB: #4F46E5
- CMYK: (85, 80, 0, 0)
- Pantone: 2726 C

**Insight Teal**
- RGB: #0D9488
- CMYK: (95, 35, 55, 10)
- Pantone: 327 C

**Discovery Amber**
- RGB: #F59E0B
- CMYK: (0, 45, 90, 0)
- Pantone: 144 C

### Monochrome Printing
- All colors maintain sufficient lightness contrast
- Sequential colors work in grayscale
- Use patterns for critical distinctions

---

## Color Psychology Reference

### Primary Color (Indigo)
**Associations:** Intelligence, wisdom, intuition, technology
**Use Cases:** Trust-building, technology, innovation
**Avoid For:** Food, emergency systems

### Secondary Color (Teal)
**Associations:** Clarity, communication, balance, healing
**Use Cases:** Information, communication, growth
**Avoid For:** Warnings, urgent calls to action

### Accent Color (Amber)
**Associations:** Energy, creativity, optimism, attention
**Use Cases:** Highlights, CTAs, optimistic messages
**Avoid For:** Error states, serious warnings

---

## Evolution Strategy

### Phase 1: Launch
- Establish core palette (Primary, Secondary, Accent)
- Implement semantic colors
- Create initial design tokens

### Phase 2: Refinement
- Add intermediate shades for better gradients
- Refine based on user feedback
- Expand data visualization palette

### Phase 3: Expansion
- Add color themes (seasonal, special occasions)
- Develop industry-specific color schemes
- Create user-customizable themes

---

**Last Updated:** 2026-03-15
**Version:** 1.0
**Owner:** Spreadsheet Moment Design Team
