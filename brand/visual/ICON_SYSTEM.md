# Spreadsheet Moment - Icon System

## Icon Philosophy

Spreadsheet Moment's icon system is designed to be:
- **Clear** - Immediately recognizable and understandable
- **Consistent** - Unified visual language across all icons
- **Accessible** - WCAG 2.1 AA compliant, supports screen readers
- **Scalable** - Works from 16px to 256px
- **Personable** - Reflects our brand: intelligent, approachable

---

## Icon Style

### Design Principles

1. **Geometric Foundation**
   - Based on 24px grid
   - 2px stroke weight (primary)
   - Rounded corners (2px radius)
   - Consistent optical sizing

2. **Visual Style**
   - Outline style (primary) for versatility
   - Filled style for emphasis
   - Minimal complexity
   - No decorative elements

3. **Personality**
   - Professional but approachable
   - Technical but not intimidating
   - Modern but not trendy
   - Intelligent but not arrogant

### Icon Grid

```
24x24 pixel grid
┌────────────────────────┐
│  ■  ■  ■  ■  ■  ■  ■  │
│  ■  ■  ■  ■  ■  ■  ■  │
│  ■  ■  ■  ■  ■  ■  ■  │
│  ■  ■  ■  ■  ■  ■  ■  │
│  ■  ■  ■  ■  ■  ■  ■  │
│  ■  ■  ■  ■  ■  ■  ■  │
│  ■  ■  ■  ■  ■  ■  ■  │
│  ■  ■  ■  ■  ■  ■  ■  │
│  ■  ■  ■  ■  ■  ■  ■  │
│  ■  ■  ■  ■  ■  ■  ■  │
│  ■  ■  ■  ■  ■  ■  ■  │
│  ■  ■  ■  ■  ■  ■  ■  │
└────────────────────────┘

Stroke weight: 2px
Corner radius: 2px
Optical alignment: Visual center, not mathematical center
```

---

## Icon Categories

### 1. Core Application Icons

#### Spreadsheet Icons
- **Grid/Spreadsheet** - Primary spreadsheet interface
- **Table** - Data table representation
- **Cell** - Individual cell focus
- **Row/Column** - Structural elements
- **Range** - Selected cell range
- **Sheet** - Worksheet/tab
- **Workbook** - Multiple sheets

#### Computational Icons
- **Function/Math** - Mathematical operations
- **Tensor** - Multi-dimensional data
- **Calculate** - Computation action
- **Formula** - Formula representation
- **Variable** - Variable/data element
- **Operation** - Generic operation

#### AI Intelligence Icons
- **AI/Sparkle** - AI presence/suggestion
- **Chat/Bot** - Conversational interface
- **Query/Search** - Natural language search
- **Insight/Lightbulb** - Insight and discovery
- **Brain** - AI intelligence
- **Magic Wand** - AI-powered automation

### 2. Action Icons

#### File Operations
- **New** - Create new file
- **Open** - Open file
- **Save** - Save file
- **Save As** - Save with new name
- **Export** - Export data
- **Import** - Import data
- **Print** - Print document

#### Editing Operations
- **Undo** - Revert last action
- **Redo** - Repeat last action
- **Cut** - Cut to clipboard
- **Copy** - Copy to clipboard
- **Paste** - Paste from clipboard
- **Delete** - Remove item
- **Edit** - Edit item

#### Collaboration Operations
- **Share** - Share with others
- **Comment** - Add comment
- **User/Person** - User presence
- **Users/People** - Multiple users
- **Collaborate** - Real-time collaboration
- **Permission** - Access control

#### View Operations
- **Zoom In** - Increase zoom
- **Zoom Out** - Decrease zoom
- **Fullscreen** - Enter fullscreen
- **Sidebar** - Toggle sidebar
- **Panel** - Toggle panel
- **Grid/List** - View toggle

### 3. Status Icons

#### Success States
- **Check/Success** - Completed successfully
- **Done/Complete** - Finished
- **Verified** - Verified/confirmed
- **Saved** - Changes saved

#### Warning States
- **Warning/Alert** - Caution required
- **Pending** - In progress
- **Clock/Time** - Time-related
- **Sync** - Synchronizing

#### Error States
- **Error/Cross** - Error occurred
- **Alert/Bell** - Attention needed
- **Blocked** - Action blocked
- **Offline** - No connection

#### Information States
- **Info** - Information
- **Help/Question** - Help available
- **Tip** - Helpful suggestion
- **Tutorial** - Tutorial/guide

### 4. Navigation Icons

#### Primary Navigation
- **Home** - Home/dashboard
- **Dashboard** - Main dashboard
- **Files** - File browser
- **Recent** - Recent files
- **Starred** - Starred/favorites
- **Trash** - Deleted items

#### Directional Navigation
- **Arrow Up** - Move up or expand
- **Arrow Down** - Move down or collapse
- **Arrow Left** - Go back
- **Arrow Right** - Go forward
- **Chevron** - Sub-navigation
- **Menu/Hamburger** - Mobile menu

### 5. Hardware & Performance Icons

#### Hardware
- **CPU** - Processor
- **GPU** - Graphics processor
- **Memory/RAM** - Memory usage
- **Storage** - Disk storage
- **Cloud** - Cloud services
- **Chip** - Hardware acceleration

#### Performance
- **Speed** - Performance indicator
- **Energy** - Power usage
- **Thermal** - Temperature
- **Network** - Network connection
- **Lightning** - Fast/accelerated

### 6. Content Type Icons

#### Data Types
- **Number** - Numeric data
- **Text** - Text data
- **Date/Time** - Temporal data
- **Boolean** - True/false data
- **Array/List** - Ordered data
- **Object** - Structured data

#### File Types
- **Image** - Image file
- **Video** - Video file
- **Audio** - Audio file
- **Document** - Document file
- **Archive** - Compressed file
- **Code** - Code file

---

## Icon Sizing System

### Size Scale
| Size | Usage | Stroke Weight |
|------|-------|---------------|
| **16px** | Small UI, buttons | 1.5px |
| **20px** | Standard UI, lists | 2px |
| **24px** | Primary UI, navigation | 2px |
| **32px** | Large UI, cards | 2.5px |
| **48px** | Feature emphasis | 3px |
| **64px+** | Illustrations | 4px |

### Responsive Sizing
```css
.icon {
  width: 1.5rem;
  height: 1.5rem;
  stroke-width: 2px;
}

@media (max-width: 640px) {
  .icon {
    width: 1.25rem;
    height: 1.25rem;
  }
}
```

---

## Icon Usage Guidelines

### Do's
✅ Use icons for their intended purpose
✅ Maintain consistent sizing within context
✅ Provide text labels for icon-only buttons (accessibility)
✅ Use appropriate icon for cultural context
✅ Test icon recognition with users
✅ Ensure sufficient color contrast

### Don'ts
❌ Don't use icons as decoration only
❌ Don't mix icon styles (outline vs filled)
❌ Don't rotate icons unless intended
❌ Don't create custom icons without approval
❌ Don't use icons without clear meaning
❌ Don't overcrowd interfaces with icons

---

## Icon Accessibility

### Screen Reader Support
```html
<!-- With text label -->
<button>
  <svg aria-hidden="true" ...>...</svg>
  <span>Save</span>
</button>

<!-- Icon-only button with label -->
<button aria-label="Save">
  <svg ...>...</svg>
</button>

<!-- Decorative icon -->
<div role="img" aria-label="Description">
  <svg ...>...</svg>
</div>
```

### Color Contrast
- Icons must meet 4.5:1 contrast ratio
- Test in both light and dark modes
- Consider color blindness accessibility

### Focus Indicators
- Icons as interactive elements need focus states
- Maintain 2px minimum focus ring
- Use brand primary color for focus

### Touch Targets
- Minimum 44x44px for touch interfaces
- Icon can be smaller, but target must be large enough
- Provide adequate spacing between interactive icons

---

## Icon Animation

### Micro-Interactions
```css
.icon-button:hover .icon {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

.icon-button:active .icon {
  transform: scale(0.95);
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### Animation Principles
- **Duration:** 0.2-0.3s for hover, 1s for loading
- **Easing:** ease-out for hover, linear for loading
- **Purpose:** Provide feedback, not decoration
- **Performance:** Use transforms, avoid layout changes

---

## Icon Library (React Components)

```typescript
// Icon component structure
interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export const GridIcon: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
  ariaLabel,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-label={ariaLabel}
    aria-hidden={!ariaLabel}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
    <path d="M9 21V9" />
  </svg>
);
```

---

## Icon Naming Convention

### Format: `[Category][Action/Object]Icon`

Examples:
- `SpreadsheetGridIcon` - Spreadsheet grid icon
- `ActionSaveIcon` - Save action icon
- `StatusSuccessIcon` - Success status icon
- `NavHomeIcon` - Home navigation icon
- `HardwareGpuIcon` - GPU hardware icon

---

## Icon Asset Management

### File Organization
```
/brand/assets/icons/
├── svg/
│   ├── grid.svg
│   ├── formula.svg
│   ├── ai-insight.svg
│   └── ...
├── react/
│   ├── GridIcon.tsx
│   ├── FormulaIcon.tsx
│   ├── AiInsightIcon.tsx
│   └── ...
└── sprite/
    └── icons.svg (all icons in one file)
```

### Delivery Formats
- **SVG** - Primary format, scalable
- **React Components** - For React applications
- **Icon Font** - For legacy support (deprecated)
- **Sprite Sheet** - For performance optimization

---

## Custom Icon Requests

### Process
1. Submit request with use case and meaning
2. Design team reviews and creates initial design
3. Test with users for recognition
4. Approve and add to icon library
5. Document in icon system

### Guidelines for Custom Icons
- Must follow existing icon style
- Must be culturally appropriate
- Must be tested for recognition
- Must be documented properly
- Must be accessible

---

## Icon Testing

### Recognition Testing
- Test icon recognition with target users
- Test across different cultures
- Test with and without text labels
- Test in various contexts

### Usability Testing
- Test icon functionality
- Test hover and click targets
- Test focus states for keyboard users
- Test screen reader announcements

### A/B Testing
- Test icon variations
- Test icon vs text labels
- Test icon placement
- Test icon size preferences

---

## Icon Evolution Strategy

### Phase 1: Launch
- Core icon library (100 icons)
- Primary outline style
- Basic documentation

### Phase 2: Growth
- Expand to 200+ icons
- Add filled style variants
- Enhanced animations

### Phase 3: Maturity
- 500+ icon library
- Specialized icon sets
- Custom icon builder tool

---

## Competitive Icon Analysis

### Excel
- **Style:** Corporate, detailed, colorful
- **Differentiation:** Our icons are simpler, more modern

### Google Sheets
- **Style:** Material Design, colorful
- **Differentiation:** Our icons are more technical, specialized

### Airtable
- **Style:** Minimal, outline-based
- **Differentiation:** Our icons emphasize computation and AI

### Notion
- **Style:** Playful, illustrated
- **Differentiation:** Our icons are more professional, focused

---

## Icon Resources

### Design Tools
- Figma icon library
- Sketch icon library
- Illustrator source files

### Development Resources
- React icon components
- SVG sprite sheets
- Icon font (deprecated)

### Documentation
- Icon usage guidelines
- Icon accessibility guide
- Icon best practices

---

## Conclusion

Icons are a critical part of Spreadsheet Moment's visual language. They communicate function, provide feedback, and enhance usability. Consistent, proper icon usage builds a cohesive, professional product experience.

**Remember:** Icons should simplify complexity, not create confusion. When in doubt, use text labels with icons or test with users.

---

**Last Updated:** 2026-03-15
**Version:** 1.0
**Owner:** Spreadsheet Moment Design Team
