---
name: ProductIQ Intelligence System
colors:
  surface: '#111318'
  surface-dim: '#111318'
  surface-bright: '#37393e'
  surface-container-lowest: '#0c0e12'
  surface-container-low: '#1a1c20'
  surface-container: '#1e2024'
  surface-container-high: '#282a2e'
  surface-container-highest: '#333539'
  on-surface: '#e2e2e8'
  on-surface-variant: '#c7c4d8'
  inverse-surface: '#e2e2e8'
  inverse-on-surface: '#2f3035'
  outline: '#918fa1'
  outline-variant: '#464555'
  surface-tint: '#c3c0ff'
  primary: '#c3c0ff'
  on-primary: '#1d00a5'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#4d44e3'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#885500'
  on-tertiary-container: '#ffd4a4'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#111318'
  on-background: '#e2e2e8'
  surface-variant: '#333539'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 14px
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-safe: 32px
---

## Brand & Style

The design system is engineered for high-stakes B2B Product Intelligence, where clarity and authority are paramount. The brand personality is **analytical, precise, and sophisticated**, moving away from generic SaaS aesthetics toward a specialized "Intelligence Command" feel.

The design style is **Corporate / Modern** with a heavy emphasis on **Dark-First Minimalism**. It utilizes deep charcoal foundations to reduce eye strain during prolonged data analysis. Visual interest is driven by high-quality typography and purposeful accent colors rather than decorative elements. AI features are integrated seamlessly via subtle iconography and specific indigo highlights, suggesting capability without the distraction of heavy gradients or glows.

## Colors

The palette is anchored in a multi-tiered dark scheme to establish a clear information hierarchy.

- **Foundations:** The core background uses `#0a0c10`, with UI surfaces stepping up in lightness (`#11141b` to `#222933`) to indicate elevation.
- **Accents:** The Indigo primary (`#4f46e5`) is reserved for critical AI-driven insights and primary call-to-actions.
- **Semantic Logic:** Success (Emerald), Warning (Amber), and Danger (Rose) are used with high intentionality—only appearing when data requires user intervention or indicates a specific state change.
- **Strokes:** All borders use a low-contrast `#2d333b` to define structure without creating visual noise in data-heavy views.

## Typography

This design system utilizes a dual-font approach to balance technical precision with readability.

- **Geist** is used for headlines and labels to provide a clean, slightly technical "developer-grade" feel. Large headlines use negative letter-spacing to maintain a tight, professional look.
- **Inter** is the workhorse for all body copy and data entry, chosen for its exceptional legibility at small sizes and high-density information environments.
- **Numeric Data:** For tables and dashboards, use tabular lining figures to ensure vertical alignment of digits.

## Layout & Spacing

The layout philosophy follows a **12-column Fluid Grid** that transitions to a **Fixed Grid** on ultra-wide monitors (max-width: 1440px) to prevent data lines from becoming too long to read comfortably.

- **Rhythm:** An 8px linear scale governs all dimensions. Internal component padding typically uses `12px` (sm) or `16px` (2x base) for a balanced density.
- **Density:** While the application is data-dense, "generous whitespace" is applied between major logical sections (using the `lg` spacing unit) to prevent cognitive overload.
- **Mobile Adaptivity:** At the 768px breakpoint, margins reduce to `16px` and the 12-column layout collapses to a 4-column vertical stack.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** rather than traditional drop shadows. In a dark-first environment, brightness equals proximity.

- **Level 0 (Background):** `#0a0c10` - The canvas.
- **Level 1 (Cards/Sidebar):** `#11141b` - Primary containers.
- **Level 2 (Modals/Popovers):** `#1a1f26` - Overlays that require immediate focus.

**Shadows:** When necessary for modals, use a very large, diffused shadow: `0px 20px 40px rgba(0, 0, 0, 0.4)`.
**Outlines:** Use subtle, 1px solid strokes (`#2d333b`) on all interactive elements to maintain crisp boundaries in the dark theme.

## Shapes

The shape language is **Soft (0.25rem)** to maintain a professional, architectural feel. 

- **Standard Elements:** Inputs, buttons, and checkboxes use a `4px` (0.25rem) radius.
- **Large Containers:** Cards and dashboard widgets use `8px` (0.5rem) to provide a distinct but subtle framing.
- **Status Pills:** Badges for "AI Confidence" or "Risk Level" use a fully rounded/pill shape to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Solid `#4f46e5` with white text. High contrast.
- **Secondary:** Transparent background with `#2d333b` border.
- **AI Action:** Primary button with a subtle 16px "Sparkle" icon prefix.

### Data Tables
- **Header:** Background `#1a1f26`, weight 600, `label-sm` typography.
- **Rows:** Subtle bottom border only. Hover state changes background to `#1a1f26`.
- **Confidence Scores:** Visualized as small, horizontal progress bars within cells using the Success/Warning/Danger palette.

### Input Fields
- **Default:** Background `#0a0c10`, border `#2d333b`, text `body-sm`.
- **Focus State:** Border shifts to `#4f46e5` with a subtle 2px outer glow of the same color at 20% opacity.

### Status Badges
- **High Confidence:** Emerald text on 10% Emerald background.
- **Duplicate Found:** Rose text on 10% Rose background.
- These are always `label-sm` and pill-shaped.

### Cards
- No shadows by default. Use a 1px border (`#2d333b`) and a slightly lighter background than the main canvas (`#11141b`).