---
name: Lealtix Core
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#341100'
  on-tertiary-container: '#d95f00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffdbca'
  tertiary-fixed-dim: '#ffb690'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#783200'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
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
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system is engineered for a high-performance B2B SaaS environment, specifically tailored for the HORECA sector. The brand personality is **Trustworthy, Innovative, and Results-driven**, demanding a UI that feels like a precision tool rather than a social utility.

The aesthetic follows a **Modern Corporate** direction with a **High-Tech Software** finish. This is achieved through:
- **Clean Minimalism:** Generous whitespace to reduce cognitive load during complex data management.
- **Precision Detailing:** Micro-borders and subtle gradients that suggest a premium, well-engineered product.
- **Metric-First Visuals:** Data and ROI are prioritized through high-contrast accents and clear visual hierarchies.
- **Professional Polish:** A focus on functional clarity over decorative elements, ensuring the interface recedes to let the user's business data take center stage.

## Colors
The palette is rooted in stability and growth. 

- **Primary (Deep Navy):** Used for sidebars, primary navigation, and heavy headings to establish institutional trust.
- **Secondary (Teal):** Representing innovation and the "Lealtix" brand spirit. Used for secondary actions and subtle brand accents.
- **Accent (ROI Orange):** A vibrant, high-energy orange reserved exclusively for primary Call-to-Actions (CTAs), critical conversion points, and positive growth metrics.
- **Success (Green):** A refined emerald green (#10B981) used for ROI indicators and "active" status states.
- **Neutral (Slate):** A tiered grey scale that avoids "dead" blacks, keeping the interface feeling modern and expansive.

## Typography
This design system utilizes a dual-font strategy to balance character with utility. 

**Plus Jakarta Sans** is used for headlines and display text. Its slightly wider stance and modern geometric terminals provide a "tech-forward" and premium feel. Heavy weights (600-700) should be used for section titles to maintain a strong hierarchy.

**Inter** is the workhorse for all UI elements, body copy, and data tables. It is chosen for its exceptional legibility at small sizes and its neutral, systematic appearance.

- Use **display-lg** for dashboard hero metrics (e.g., Total Revenue).
- Use **label-md** with letter spacing for table headers and overlines.
- Maintain a minimum of 1.5x line height for body copy to ensure readability in long-form reports.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model. The main dashboard content is contained within a max-width of 1440px to prevent excessive line lengths on ultra-wide monitors, while the sidebar remains fixed or collapsible.

- **Grid:** A 12-column grid is used for desktop layouts. Dashboard cards typically span 3, 4, 6, or 12 columns.
- **Rhythm:** An 8px linear scale governs all spacing. Use `stack-md` (16px) for internal card padding and `stack-lg` (32px) for gaps between major layout sections.
- **Mobile Adaptivity:** On mobile, margins shrink to 16px and the 12-column grid collapses into a single-column vertical stack. Cards should transition to full-width with reduced internal padding.

## Elevation & Depth
Depth is conveyed through **Tonal Layering** and **Ambient Shadows**. This creates a sophisticated, "stacked" software look.

- **Surface Levels:** The background uses a very light grey (#F8FAFC). Cards and primary containers use pure white (#FFFFFF). This creates a natural "lift" without heavy shadows.
- **Shadows:** Use a "soft-depth" approach. Shadows should be ultra-diffused, using the primary navy color at very low opacity (e.g., `box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`).
- **Interactive States:** Hovering over a card or interactive element should slightly increase the shadow spread and lift the element by 1-2px, providing tactile feedback.
- **Glassmorphism:** Reserved exclusively for navigation overlays or "Floating Action Buttons" (FABs) using a 12px backdrop blur and 80% white opacity.

## Shapes
The shape language is **Rounded**, reflecting a modern, accessible SaaS aesthetic.

- **Standard Elements:** Buttons, input fields, and small cards use a 0.5rem (8px) radius. This balances professionalism with a contemporary feel.
- **Large Containers:** Dashboard widgets and main content areas use `rounded-lg` (1rem / 16px) to define them clearly against the page background.
- **Buttons:** While primary buttons are 8px rounded, "Status Chips" or "Badges" can use the `rounded-xl` (pill) style to distinguish them from actionable buttons.

## Components
Consistent styling across these key components ensures the platform feels unified:

- **Buttons:**
    - **Primary:** ROI Orange background, white text, bold weight. Minimal 2px bottom border for a subtle "tactile" press effect.
    - **Secondary:** Transparent background, Teal border and text.
- **ROI Calculator:** Use a distinct "Calculation Card" with a subtle secondary teal background tint. Inputs should be large with clear unit labels (e.g., %, $).
- **Dashboard Cards:** Must include a "Header" section with an icon (24px) and a "More" action. Content area should have a consistent 24px padding.
- **Input Fields:** Use a 1px Slate-200 border that transitions to Primary Navy on focus. Include clear validation states (Error: Red, Success: Green).
- **Pricing Tables:** High-contrast tiers. The "Recommended" plan should be slightly scaled (1.05x) and feature the ROI Orange accent color.
- **HORECA Icons:** Use thick-stroke (2pt) monoline icons. Avoid filled icons unless used for active states in navigation.
- **Lists:** Data tables should feature "Zebra Striping" using a 2% opacity version of the Primary color on alternate rows for high-density readability.