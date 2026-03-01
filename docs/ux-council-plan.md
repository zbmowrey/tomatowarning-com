# Tomato Warning — Unified UI/UX Improvement Plan
## Council of Experts Synthesis

*Produced by: Aria Chen, Marcus Cole, Dr. Lena Olsson, Tomás Reyes, Sofia Marchetti, Priya Kapoor, Jin-Soo Park, Viktor Strand, Diane Achebe*

---

## Executive Summary

The Tomato Warning site is a well-built Astro static site with a strong brand identity, disciplined four-color palette, excellent font pairing, and a genuinely differentiated product concept. However, the council identified **systemic issues** that undermine conversion, accessibility, and user trust. The site is currently designed for the brand, not the buyer. The plan below addresses this in three phases: Critical Fixes, Experience Refinement, and System Hardening.

---

## Phase 1: Critical Fixes (Must Ship)

These issues actively harm users, break accessibility, or violate user trust.

### 1.1 Make EF Scale Bar Jars Clickable
**Identified by:** Marcus (promise-violation pattern), Viktor (actively harmful), Priya (false affordance), Lena (predicted 30-40% increase in product visits), Aria (broken user journey)

**Problem:** `EFScaleBar.astro:106-111` — Jars animate on hover (`translateY(-8px) scale(1.03)`) with badge color change, but are `<li>` elements with `cursor: default`. Users expect interactivity and get nothing.

**Fix:**
- `src/components/hero/EFScaleBar.astro` — Wrap each jar item's content in `<a href="/products/${product.slug}/">`
- Change `cursor: default` to `cursor: pointer` on `.scale-jar-item`
- Add `aria-label` to each link (e.g., "EF-1 Coastal Calm — View product")
- On mobile where product names are hidden, the link still works via the jar image

---

### 1.2 Replace Mobile Nav CSS Checkbox Hack with Minimal JS
**Identified by:** Priya (WCAG failures: no focus trap, no Escape, label-not-button, aria-modal lies), Jin-Soo (worth ~2KB for proper accessibility), Viktor (edge case failures)

**Problem:** `MobileNav.astro:7` uses `<input type="checkbox" aria-hidden="true">` with `<label>` triggers. Violates WCAG 2.1.1 (Keyboard), 2.4.3 (Focus Order). The `aria-modal="true"` at line 9 is a lie — no JS enforces inertness.

**Fix:**
- `src/components/layout/MobileNav.astro` — Replace checkbox with a `<script>` block (~15 lines)
- Toggle via `<button>` (not `<label>`) in `Header.astro:47`
- Add: focus trap, Escape to close, body scroll lock, focus return to trigger on close
- Update `aria-expanded` dynamically on the trigger button
- Remove `aria-modal="true"` (use `inert` attribute on `<main>` instead, or keep as dialog with proper JS)

---

### 1.3 Add `prefers-reduced-motion` Support
**Identified by:** Priya (zero support exists — WCAG 2.3.3 violation), Marcus (all animations need reduced-motion path)

**Problem:** No `@media (prefers-reduced-motion: reduce)` anywhere in the codebase. The `storm-pulse` animation runs infinitely with no opt-out. `scroll-behavior: smooth` in `global.css:77` is unconditional.

**Fix:**
- `src/styles/global.css` — Add global reduced-motion media query:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```
- This covers all animations site-wide in one rule. More targeted overrides can follow.

---

### 1.4 Fix `aria-hidden` on Product Images
**Identified by:** Priya (good alt text written but never exposed to assistive tech)

**Problem:**
- `ProductHero.astro:36` — `aria-hidden="true"` on `.jar-placeholder` hides the product jar image and its alt text from the accessibility tree
- `ProductCard.astro:24-27` — Same issue on card image container

**Fix:**
- `src/components/product/ProductHero.astro` — Remove `aria-hidden="true"` from the `.jar-placeholder` div. If the placeholder text needs hiding, apply `aria-hidden` only to the text span, not the container.
- `src/components/product/ProductCard.astro` — Remove `aria-hidden="true"` from the image container div.

---

### 1.5 Fix SHU Tooltip Accessibility
**Identified by:** Priya (role="tooltip" without association, no focus trigger), Lena (invisible on touch devices), Aria (hover-only = inaccessible on mobile)

**Problem:** `ProductHero.astro:133-134` — Tooltip shown on CSS `:hover` only. Has `role="tooltip"` but no `aria-describedby` on the trigger. No keyboard or touch activation.

**Fix:**
- `src/components/product/ProductHero.astro` — Add `tabindex="0"` to `.shu-wrapper` for keyboard focus
- Add `:focus-within` to the CSS rule alongside `:hover` for tooltip visibility
- Add `id` to the tooltip element and `aria-describedby` pointing to it on the trigger
- Consider replacing the tooltip with always-visible inline text on mobile (progressive disclosure via details/summary or simply showing the SHU range inline)

---

### 1.6 Fix Opacity-Based Contrast Failures
**Identified by:** Priya (systemic — 8-10 instances below WCAG AA 4.5:1), Tomás (opacity hierarchy creates maintenance risk)

**Problem:** The site uses `opacity` values (0.55–0.75) to create text hierarchy. Every instance below ~0.72 on light backgrounds and ~0.7 on dark backgrounds fails WCAG AA.

**Failing instances:**
| Element | File | Current | Fix |
|---------|------|---------|-----|
| Products subtitle | `index.astro` | opacity 0.65 | Use explicit `#767268` or similar |
| Privacy last-updated | `privacy.astro` | opacity 0.6 | Use explicit color |
| EF scale product names | `EFScaleBar.astro:137` | opacity 0.65 | Use explicit color |
| Footer copyright | `Footer.astro` | opacity 0.6 | Use explicit color |
| Asset unavailable text | `AssetDownload.astro` | opacity 0.55 | Use explicit color |
| Logo tagline | `Header.astro` | opacity 0.7, 0.7rem | Use explicit color, increase size |
| Footer form privacy link | `FooterSignupForm.tsx:115` | text-gray-600 on dark | Use premium-white with opacity 0.8+ |
| Fundraiser benefit text | `fundraisers.astro` | opacity 0.7 | Borderline — increase to 0.75+ |

**Fix:** Replace all opacity-based text dimming with explicit color values that meet 4.5:1 minimum. Define two "muted" text tokens:
- `--text-muted-light: #716B62` (on premium-white background, ~4.6:1)
- `--text-muted-dark: #A9A29A` (on storm-charcoal background, ~4.6:1)

---

## Phase 2: Experience Refinement

These changes improve conversion, clarity, and the quality of user journeys.

### 2.1 Standardize Interaction Timing System
**Identified by:** Marcus (18 transitions audited, inconsistent curves and durations), Tomás (no design tokens for motion)

**Problem:** Transitions use a mix of `ease`, no curve, and `cubic-bezier(0.16, 1, 0.3, 1)`. Durations range from 0.1s to 0.4s without clear rationale.

**Fix:** Define motion tokens in `global.css`:
```css
:root {
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-fade: cubic-bezier(0.25, 0.1, 0.25, 1);
  --duration-fast: 0.15s;    /* color/opacity swaps */
  --duration-normal: 0.25s;  /* positional/shadow changes */
  --duration-slow: 0.4s;     /* large movement, entrance */
}
```
Then update all transitions to reference these tokens:
- Footer nav, asset download, distributors email link → `var(--duration-fast) var(--ease-fade)`
- Product cards, nav links, product nav → `var(--duration-normal) var(--ease-spring)`
- EF jar hover, hero entrance → `var(--duration-slow) var(--ease-spring)`

---

### 2.2 Add Missing Interaction States
**Identified by:** Marcus (comprehensive gap analysis)

**Additions needed:**
1. **Header logo hover** (`Header.astro`) — Add subtle opacity shift (1 → 0.85) on hover with `var(--duration-fast)`
2. **Product card image** (`ProductCard.astro`) — Add `scale(1.03)` on image within card on card hover (overflow hidden on container)
3. **`:active` states** — Add `transform: translateY(0) scale(0.98)` to product cards, nav links, and form submit buttons (matching existing CTA pattern)
4. **Form submit loading** — Add CSS spinner animation or button background pulse during `submitting` state across all form components
5. **FormSuccess/FormError entrance** — Add `fade-in-up` animation (0.3s) to success and error message containers
6. **Prose page links** — Add `transition: color var(--duration-fast) var(--ease-fade)` and hover color to `var(--accent-gold)` for `.prose a`
7. **Pairing pills** (`ProductDetails.astro:137-145`) — Either add subtle hover effect or remove interactive visual affordance (border-radius + border + colored background looks clickable)

---

### 2.3 Add Entrance Animation Choreography
**Identified by:** Marcus (EFScaleBar has no entrance animation, asymmetric with hero copy)

**Fix:**
- `EFScaleBar.astro` — Add staggered `fade-in-up` to jar items with 80ms delay per item (0s, 80ms, 160ms, 240ms, 320ms), starting 0.3s after hero copy animation
- `ProductCard.astro` — Accept an `index` prop, apply `animation-delay: calc(${index} * 60ms)` for staggered grid entrance on homepage and products page
- `ProductHero.astro` — Add `fade-in-up` (0.4s) on `.hero-content` for continuity with homepage entrance

---

### 2.4 Simplify Footer Signup Form
**Identified by:** Lena (Hick's law violation — "I am a..." selector adds unnecessary friction, predicted 15-25% conversion loss), Diane (forcing self-categorization at the simplest conversion point)

**Problem:** `FooterSignupForm.tsx:111` — The audience selector forces consumers (the vast majority) to self-categorize before signing up.

**Fix:**
- Remove the "I am a..." selector from the footer form
- Default to consumer signup (email + optional zip)
- Add a small text link below: "Are you a retailer or organization? [Contact us](/retailers/)"
- Keep dedicated forms on the partner pages for segmented collection

---

### 2.5 Fix Navigation for B2B Audiences
**Identified by:** Aria (B2B pages buried), Lena ("Partners" doesn't match retailer mental model — predicted <60% first-click success), Diane (revenue-critical pages hidden)

**Problem:** `src/config/site.ts:22` — Retailers, distributors, fundraisers, and press are all behind a "Partners" dropdown. Retailers look for "Wholesale," fundraisers look for "Fundraising."

**Fix options (recommend A):**
- **A:** Rename "Partners" to "Work With Us" — slightly clearer intent signal
- **B:** Break into two top-level items: "For Stores" and "Fundraising" (press stays in footer)
- **C:** Keep "Partners" but add descriptive subtitles in the dropdown items

---

### 2.6 Fix Content Data Inconsistencies
**Identified by:** Aria (SHU mismatch), Tomás (wrong teal hex), Sofia-adjacent (via Lena's copy analysis)

**Fixes:**
- `press.astro` — Change "500,000+ SHU" to match EF-5 product data max of 350,000 SHU
- `ProductDetails.astro:144` — Fix rgba teal value from `rgba(0,178,169,0.08)` to `rgba(0,180,216,0.08)` to match `--radar-teal: #00B4D8`
- `retailers.astro` body — Add the "40-45% retailer margins" mentioned in the meta description to the visible page content (Lena: bait-and-switch perception)

---

### 2.7 Consolidate Color Definitions
**Identified by:** Jin-Soo (colors defined in 4+ places), Tomás (double declaration maintenance risk)

**Problem:** Colors declared in `global.css` @theme block, `global.css` :root block, `src/config/site.ts`, and hardcoded in product JSON files.

**Fix:**
- Remove the `:root` custom property block (lines 50-63) from `global.css` — use only @theme tokens
- Update all scoped CSS to reference `var(--color-storm-charcoal)` etc. (the @theme names)
- Or: keep `:root` as the canonical source and remove @theme duplicates
- Pick ONE approach and make it the single source of truth
- Replace hardcoded hex values in component styles with token references

---

### 2.8 Fix Heading Hierarchy Issues
**Identified by:** Priya (duplicate h1 on mission/privacy, heading skip on products index)

**Fixes:**
- `src/content/pages/mission.md:9` — Remove the `# Our Mission` heading (the page template already renders h1)
- `src/content/pages/privacy.md:9` — Remove the `# Privacy Policy` heading
- `src/pages/products/index.astro` — Either change ProductCard headings from h3 to h2, or add an h2 wrapper section

---

### 2.9 Fix Desktop Nav ARIA
**Identified by:** Priya (role="menu" without required keyboard pattern)

**Problem:** `Header.astro:29,32` uses `role="menu"` and `role="menuitem"` but does not implement the ARIA menu keyboard pattern (arrow keys, Home/End, typeahead).

**Fix:** Remove `role="menu"` and `role="menuitem"`. Use standard `<ul>/<li>/<a>` navigation pattern. Update `aria-expanded` on the dropdown trigger button dynamically (currently hardcoded to `false` at line 23) — requires a small `<script>` block.

---

### 2.10 Unify storm-pulse Animation
**Identified by:** Marcus (defined twice with different behavior), Jin-Soo (maintenance hazard)

**Problem:** `global.css:22-35` defines `storm-pulse` with opacity only. `EFScaleBar.astro:83-86` redefines it with opacity + scaleY.

**Fix:** Remove the unused global definition. Keep the EFScaleBar-scoped version (it's the only one actually used). If the global version is needed later, define it once and reference it.

---

## Phase 3: System Hardening & Polish

These changes improve maintainability, performance, and resilience.

### 3.1 DRY Form Component Architecture
**Identified by:** Jin-Soo (~500 lines of duplicated boilerplate across 5 form components)

**Problem:** All five form components share ~80% identical patterns: useState hooks, handleSubmit flow, FormSuccess/FormError rendering, button styling.

**Fix:** Extract a `useForm` hook or `FormShell` wrapper:
```typescript
// src/hooks/useForm.ts
function useForm<T>(config: { validate, submit, fields }) {
  // shared: status, errors, handleSubmit, field rendering
}
```
Reduces 5 × ~120 lines to 5 × ~30 lines + 1 × ~100 line shared hook.

---

### 3.2 Shared Product Type Definition
**Identified by:** Jin-Soo (product types defined inline in 5+ components)

**Fix:** Create `src/types/product.ts` with a canonical `Product` interface. Components use `Pick<Product, 'name' | 'efLevel' | ...>` for their subsets.

---

### 3.3 Extract Shared Page Styles
**Identified by:** Jin-Soo (eyebrow, page-header, page-lead duplicated across 4 partner pages)

**Fix:** Create shared utility classes in `global.css` or a `src/styles/pages.css`:
```css
.eyebrow { /* shared eyebrow styling */ }
.page-header h1 { /* shared clamp heading */ }
.page-lead { /* shared lead paragraph */ }
```

---

### 3.4 Optimize Font Loading
**Identified by:** Jin-Soo (8 font files, render-blocking, potential FOUT), Viktor (Google Fonts CDN dependency)

**Fix:**
- Audit weight usage: Inter 500 and Outfit 400 may be unused — remove if confirmed
- Self-host via `@fontsource/inter` and `@fontsource/outfit` for cache control and no third-party dependency
- Add `font-display: optional` for Inter (system-ui fallback is visually close)
- Keep `font-display: swap` for Outfit (display font difference is more noticeable)

---

### 3.5 Optimize Product Images
**Identified by:** Jin-Soo (product images not using Astro optimization), Viktor (no width/height on card images = CLS)

**Fix:**
- `ProductCard.astro` and `ProductHero.astro` — Use Astro `<Image>` or `<Picture>` component instead of raw `<img>` for format negotiation and responsive widths
- Add explicit `width` and `height` attributes to all product images to prevent CLS
- Remove dead `{ Image } from 'astro:assets'` import in `JarImage.astro:7`

---

### 3.6 Move noscript Fallbacks Outside Preact Islands
**Identified by:** Viktor (noscript inside Preact components is unreachable without JS), Priya (confirmed)

**Problem:** `<noscript>` blocks inside `.tsx` files never render if JS is disabled (the component itself doesn't mount).

**Fix:** Move noscript fallbacks to the Astro template level, wrapping each `client:visible` island:
```astro
<ConsumerSignupForm client:visible />
<noscript>
  <p>Email us at <a href="mailto:hello@tomatowarning.com">hello@tomatowarning.com</a></p>
</noscript>
```

---

### 3.7 Add Form Resilience
**Identified by:** Viktor (no fetch timeout), Priya (no focus-to-first-error, no error summary)

**Fixes:**
- All form submit functions — Add `AbortController` with 15-second timeout
- On validation failure — Focus the first invalid field
- For forms with 5+ fields (retailer, nonprofit) — Add error summary at top with links to invalid fields
- Add required field legend ("* indicates required") to all multi-field forms

---

### 3.8 Clean Up Technical Debt
**Identified by:** Jin-Soo (comprehensive list)

- Remove `@preact/signals` from `package.json` (unused dependency)
- Remove dead `{ Image }` import from `JarImage.astro:7`
- Fix orphaned `</style>` tag in `[slug].astro:55`
- Remove duplicate dropdown options from form components (use `src/config/forms.ts` as single source)
- Remove unused global `storm-pulse` animation from `global.css`
- Remove draft banner logic from `mission.astro` if page is permanently published
- Add `flex-wrap: wrap` to footer nav `ul` (overflows at 320px)

---

### 3.9 Add 404 Page
**Identified by:** Diane (no 404 page exists)

**Fix:** Create `src/pages/404.astro` with brand-consistent design, clear messaging, and links to homepage and products.

---

## Deferred / Future Considerations

These items were raised by the council but are not part of the current implementation scope:

1. **Purchase path / e-commerce readiness** — Viktor's pre-mortem: the site converts to email but has no purchase mechanism. When e-commerce arrives, it needs to be designed into the architecture, not retrofitted. Consider adding "Coming Soon — Notify Me" CTAs on product pages as an interim step.

2. **Downloadable materials for fundraiser coordinators** (Lena) — Committee decision-makers need a PDF to bring to meetings.

3. **Distributor page content** (Lena, Diane) — Currently near-empty; signals brand unreadiness.

4. **Astro View Transitions** (Marcus) — Page-to-page navigation is a full reload. A simple fade transition would smooth the experience.

5. **Formalize type scale** (Tomás) — Currently "type soup" with functionally identical sizes. Adopt a strict modular scale.

6. **Brand-align form feedback colors** (Tomás) — FormSuccess uses generic Tailwind greens, FormError uses generic reds. Consider teal/gold for success and EF-palette reds for errors.

7. **Product-specific "Notify Me" CTA** (Lena H3) — Predicted 40-60% more signups than generic footer form.

8. **EF education placement** (Lena) — Move the "What is EF?" explanation from the hero (where nobody reads it) to the product grid section or a dedicated micro-page.

9. **Hero background image at 3840px** (Viktor) — Current max is 2560px; upscales on 4K displays.

10. **Auto-hide sticky header on mobile scroll-down** (Priya) — Reclaim ~80px of viewport.

---

## Implementation Priority Order

| Order | Item | Phase | Effort | Impact |
|-------|------|-------|--------|--------|
| 1 | 1.1 Make EF jars clickable | P1 | Small | High — fixes false affordance, adds navigation |
| 2 | 1.3 Add prefers-reduced-motion | P1 | Small | High — WCAG compliance, one CSS rule |
| 3 | 1.4 Fix aria-hidden on images | P1 | Small | High — two attribute removals |
| 4 | 1.6 Fix opacity contrast failures | P1 | Medium | High — systemic accessibility fix |
| 5 | 1.5 Fix SHU tooltip | P1 | Small | Medium — mobile + keyboard access |
| 6 | 2.4 Simplify footer form | P2 | Small | High — conversion improvement |
| 7 | 2.6 Fix content inconsistencies | P2 | Small | Medium — data accuracy |
| 8 | 2.8 Fix heading hierarchy | P2 | Small | Medium — accessibility |
| 9 | 2.1 Standardize motion tokens | P2 | Medium | Medium — design system coherence |
| 10 | 2.2 Add missing interactions | P2 | Medium | Medium — polish and craft |
| 11 | 2.9 Fix desktop nav ARIA | P2 | Small | Medium — accessibility |
| 12 | 1.2 Replace mobile nav hack | P1 | Medium | High — WCAG compliance |
| 13 | 2.3 Entrance choreography | P2 | Medium | Low-Medium — delight |
| 14 | 2.10 Unify storm-pulse | P2 | Small | Low — cleanup |
| 15 | 2.5 Fix nav for B2B | P2 | Small | Medium — B2B conversion |
| 16 | 2.7 Consolidate colors | P2 | Medium | Low — maintainability |
| 17 | 3.8 Clean up tech debt | P3 | Small | Low — hygiene |
| 18 | 3.6 Move noscript fallbacks | P3 | Small | Low — resilience |
| 19 | 3.5 Optimize product images | P3 | Medium | Medium — performance |
| 20 | 3.4 Optimize font loading | P3 | Medium | Medium — performance |
| 21 | 3.7 Add form resilience | P3 | Medium | Low-Medium — edge cases |
| 22 | 3.1 DRY form architecture | P3 | Large | Low — maintainability |
| 23 | 3.2 Shared product type | P3 | Small | Low — maintainability |
| 24 | 3.3 Extract shared page styles | P3 | Small | Low — maintainability |
| 25 | 3.9 Add 404 page | P3 | Small | Low — completeness |
