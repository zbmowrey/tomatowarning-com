---
type: technical-spec
feature: "Tomato Warning Phase 1 Branding Site"
status: approved
created: "2026-02-26"
updated: "2026-02-26"
source_stories: docs/specs/branding-site/stories.md
source_architecture: docs/architecture/branding-site-system-design.md
source_data_model: docs/architecture/branding-site-data-model.md
authors: [architect, dba, spec-skeptic]
review_rounds: 1
---

# Technical Specification: Tomato Warning Phase 1 Branding Site

## Summary

A static branding website for Tomato Warning — a premium salsa brand with an EF-1 to EF-5 tornado heat scale and a charitable mission. The site captures email signups across three audiences (consumers, retailers, nonprofits), communicates the brand's differentiator, and builds trust through the origin story and giving structure. No e-commerce, no user accounts, no database.

**Tech stack:** Astro 5.x + Preact islands + Tailwind CSS v4 + Plausible Analytics + Cloudflare Pages

**Scope:** 11 pages (homepage with hero, 5 product pages, mission, retailer CTA, nonprofit CTA, press, privacy policy), 5 form types, 3 email lists, analytics with 3 conversion events.

**KPIs:** 500+ consumer signups, 50+ retailer signups, 10+ nonprofit signups.

---

## Problem

Tomato Warning exists as a domain name and a dream. There is no digital presence to validate demand, capture interest, or communicate the brand. Before investing in product manufacturing, the founder needs proof of market interest from three audiences: consumers who want the product, retailers who would stock it, and nonprofits who would use it for fundraising. A branding site that captures signups against specific KPI targets provides that proof.

---

## Solution

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare Pages (CDN)                 │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              Static HTML/CSS/JS (Astro build)        │ │
│  │                                                       │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │ │
│  │  │ Astro    │ │ Preact   │ │ Tailwind │             │ │
│  │  │ Pages    │ │ Islands  │ │ CSS      │             │ │
│  │  │ (static) │ │ (forms)  │ │ (styles) │             │ │
│  │  └──────────┘ └────┬─────┘ └──────────┘             │ │
│  └─────────────────────┼───────────────────────────────┘ │
└─────────────────────────┼───────────────────────────────┘
                          │ API calls (client-side)
              ┌───────────┼────────────┐
              │           │            │
     ┌────────▼──┐  ┌────▼─────┐  ┌──▼──────────┐
     │ Email     │  │ Plausible│  │ CF Worker   │
     │ Platform  │  │ Analytics│  │ (optional   │
     │ (Kit)     │  │          │  │  API proxy) │
     └───────────┘  └──────────┘  └─────────────┘
```

### Tech Stack Decision (ADR)

**Framework: Astro 5.x** — Purpose-built for content-heavy static sites with selective interactivity. Zero JS by default delivers Lighthouse 85+ without optimization effort. Content Collections provide type-safe product data. Island architecture lets forms use Preact (3KB) without shipping a full SPA runtime.

**Alternatives rejected:**
- Next.js: Overkill for a static site with no API routes, no auth, no database
- Eleventy: No built-in image optimization or component model
- Hugo: Go templating is unfamiliar; poor DX for interactive islands

**Supporting tools:**

| Concern | Tool | Rationale |
|---------|------|-----------|
| Styling | Tailwind CSS v4 | Utility-first, purges unused CSS, mobile-first default |
| Form interactivity | Preact via Astro island | 3KB runtime for form validation/submission UX |
| Email platform | Kit (ConvertKit) recommended | Public form API, no server-side proxy needed. Mailchimp acceptable with CF Worker proxy. |
| Analytics | Plausible Analytics | Privacy-respecting (no cookies, GDPR-compliant), < 1KB script, custom events with properties, built-in UTM tracking |
| Deployment | Cloudflare Pages | Free static hosting, global CDN, preview deployments, existing domain likely on Cloudflare |
| Package manager | npm | Standard |
| Linting | ESLint + Prettier | Standard Astro configs |

### Site Structure

**Pages:**

```
/                          Homepage with hero section (Story 10)
/mission/                  Mission page (Story 5)
/retailers/                "Stock the Storm" retailer CTA (Story 7)
/fundraisers/              "Fundraise for Recovery" nonprofit CTA (Story 6)
/press/                    "Storm Watch" press page (Story 11)
/privacy/                  Privacy policy (Story 12)
/products/                 Product grid index
/products/ef-1-coastal-calm/   EF-1 product page
/products/ef-2-gulf-breeze/    EF-2 product page
/products/ef-3-squall-line/    EF-3 product page
/products/ef-4-supercell/      EF-4 product page
/products/ef-5-ground-zero/    EF-5 product page
```

**Layouts (inheritance chain):**

```
BaseLayout.astro          → HTML shell, <head>, analytics script, skip-nav
  └─ PageLayout.astro     → Header + Footer + main content wrapper
       └─ ProductLayout.astro → Product-specific structured data + OG tags
```

### Component Architecture

**Static components (.astro)** — Render at build time, zero client JS:

```
components/
  layout/   Header, Footer, MobileNav
  hero/     HeroSection, EFScaleBar, JarImage
  product/  ProductCard, ProductHero, ProductDetails, HeatIndicator
  common/   SEOHead, SkipNav, CTAButton, PrivacyLink
  press/    AssetDownload
```

**Interactive islands (.tsx / Preact)** — Hydrated on client via `client:visible`:

```
components/
  forms/    ConsumerSignupForm, RetailerSignupForm, NonprofitSignupForm,
            FooterSignupForm, PressInquiryForm, FormField, FormSuccess, FormError
```

**Key TypeScript interfaces:**

```typescript
interface Product {
  slug: string;                     // "ef-1-coastal-calm" (full slug = URL path segment)
  name: string;                     // "Coastal Calm"
  efLevel: 1 | 2 | 3 | 4 | 5;
  flavorHeadline: string;
  heatDescriptor: string;
  scovilleMin: number;
  scovilleMax: number;
  keyIngredients: [string, string];
  efColor: string;                  // Hex color for EF level
  jarImage: string;                 // Path to jar render asset
  jarImageAlt: string;              // Descriptive alt text (WCAG 2.1 AA)
  metaTitle: string;
  metaDescription: string;
  status: "published" | "draft";
}

interface SignupFormProps {
  listId: string;
  analyticsEvent: "consumer_signup" | "retailer_signup" | "nonprofit_signup";
  successMessage: string;
  sourceContext?: string;            // Product slug or page name
}
```

### Content Model

Product data uses Astro Content Collections with JSON files (type-safe, schema-validated at build time):

```
src/content/
  config.ts                          # Zod schemas for all collections
  products/
    ef-1-coastal-calm.json           # Product data (camelCase fields)
    ef-2-gulf-breeze.json
    ef-3-squall-line.json
    ef-4-supercell.json
    ef-5-ground-zero.json
  pages/
    mission.md                       # Long-form markdown content
    privacy.md
```

**Draft/published gating:** Products with `status: "draft"` are excluded from production builds. Mission page cannot be published while `charityPartnerName` is empty (build-time validation).

**Why JSON for products (not markdown):** Product data is structured with no prose body. JSON avoids frontmatter parsing and maps directly to TypeScript interfaces.

### Data Schemas

#### Product (5 varieties)

| Field | Type | Example |
|-------|------|---------|
| `slug` | string | `"ef-3-squall-line"` |
| `name` | string | `"Squall Line"` |
| `efLevel` | 1-5 | `3` |
| `scovilleMin` | number | `5000` |
| `scovilleMax` | number | `25000` |
| `flavorHeadline` | string | `"Habanero-forward with tropical mango counter"` |
| `heatDescriptor` | string | `"The storm is here — tropical sweetness chased by real heat"` |
| `keyIngredients` | [string, string] | `["habanero peppers", "tropical mango"]` |
| `efColor` | hex string | `"#8B2500"` |
| `jarImage` | path | `"/images/products/ef-3-squall-line.webp"` |
| `jarImageAlt` | string | `"EF-3 Squall Line salsa jar — medium-hot habanero mango salsa"` |
| `metaTitle` | string | `"EF-3 Squall Line | Tomato Warning"` |
| `metaDescription` | string (≤160 chars) | `"Habanero-forward with tropical mango..."` |
| `status` | enum | `"draft"` or `"published"` |

#### EF Color System

| EF | Name | Hex | Description |
|----|------|-----|-------------|
| 1 | Coastal Calm | `#D4A017` | Warm amber |
| 2 | Gulf Breeze | `#CC5500` | Deep orange |
| 3 | Squall Line | `#8B2500` | Rust red |
| 4 | Supercell | `#5C0A0A` | Dark crimson |
| 5 | Ground Zero | `#1C0A0A` | Near-black |

Brand palette: Storm charcoal `#2C2C2C`, Premium white `#F5F0EB`, Radar teal `#00B4D8`.

#### Email List Schemas

**List 1: Consumer "Notify Me"** (KPI: 500+)

| Field | Required | Source |
|-------|----------|--------|
| `email` | yes | Form input |
| `productInterests` | no | Derived from signup page |
| `zipCode` | no | Optional form input |
| `signupSource` | yes | Auto-captured page URL |
| UTM fields | no | Auto-captured from URL |

**List 2: Retailer "Stock the Storm"** (KPI: 50+)

| Field | Required | Source |
|-------|----------|--------|
| `email` | yes | Form input |
| `name` | yes | Form input |
| `storeName` | yes | Form input |
| `location` | yes | Form input (not gated by geography) |
| `role` | yes | Dropdown: Store Owner, Category Manager, Buyer, Other |
| `message` | no | Form input |

**List 3: Nonprofit "Fundraise for Recovery"** (KPI: 10+)

| Field | Required | Source |
|-------|----------|--------|
| `email` | yes | Form input |
| `contactName` | yes | Form input |
| `orgName` | yes | Form input |
| `orgType` | yes | Dropdown: Youth Sports, Nonprofit 501(c)(3), School, Church/Religious, Community Group, Other |
| `location` | yes | Form input |
| `campaignSize` | no | Free text, no validation |

**Cross-list deduplication:** Not performed. Same email may exist on multiple lists (per Story 1).

#### Analytics Events

| Event | Fires When | Properties | KPI |
|-------|-----------|------------|-----|
| `pageview` | Every page load | `page_url`, `page_title` | — |
| `consumer_signup` | Consumer form success | `source_page`, `product_variety` | 500+ |
| `retailer_signup` | Retailer form success | `source_page` | 50+ |
| `nonprofit_signup` | Nonprofit form success | `source_page` | 10+ |

**Firing rules:** Events fire ONLY on confirmed API success (new subscriber). Do NOT fire for already-subscribed emails or errors. Prevent double-fire via submit button disabling.

**UTM convention:** All lowercase, underscore-delimited. `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`. Null UTMs = `direct/organic`.

### Third-Party Integration

**Form submission flow:**

```
User fills form → Client validation → POST to email platform API
                                     → Success (new): show confirmation + fire analytics event
                                     → Already subscribed: show "You're on the list" (no event)
                                     → Error: show error with retry (no event)
```

**Email platform recommendation:** Kit (ConvertKit) — public form API, no server-side proxy needed. If Mailchimp chosen instead, a single Cloudflare Worker at `/api/subscribe` acts as API proxy to protect the API key.

**Analytics:** Plausible `<script>` in `BaseLayout.astro` `<head>`. UTM tracking automatic. Custom events via `window.plausible?.("event_name", { props })`.

**Graceful degradation:** `<noscript>` blocks link to email platform's hosted form pages.

### Image Strategy

- Source renders (high-res PNG from P1-15) stored in `src/assets/images/products/`
- Astro `<Image>` component converts to WebP/AVIF at build time with responsive `srcset`
- Hero jar images: `loading="eager"` + `fetchpriority="high"` (above fold)
- All other images: `loading="lazy"`
- Alt text stored in product JSON data

### Deployment

**Platform:** Cloudflare Pages

```
git push to main    → Cloudflare build → astro build → Deploy to CDN
git push to branch  → Preview deployment at {branch}.{project}.pages.dev
```

**Environment variables (all PUBLIC_):**

```
PUBLIC_PLAUSIBLE_DOMAIN=tomatowarning.com
PUBLIC_EMAIL_FORM_ENDPOINT=<kit-endpoint>
PUBLIC_CONSUMER_LIST_ID=<id>
PUBLIC_RETAILER_LIST_ID=<id>
PUBLIC_NONPROFIT_LIST_ID=<id>
PUBLIC_NOINDEX=true  (staging only, removed for production)
```

### SEO

- Unique `<title>`, `<meta description>`, `<link rel="canonical">` per page via `SEOHead.astro`
- Open Graph + Twitter Card meta tags on all pages
- Schema.org `Product` structured data on product pages (`availability: PreOrder`)
- Schema.org `Organization` on homepage
- Auto-generated sitemap via `@astrojs/sitemap`
- `robots.txt` with sitemap reference
- Pre-launch `noindex` via env var

### Accessibility (WCAG 2.1 AA)

- Skip-to-content link on every page
- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<footer>`, proper heading hierarchy
- All form inputs have associated `<label>` elements
- Inline errors use `aria-describedby` + `aria-live="polite"`
- Focus management: error → first invalid field; success → success message
- All images have descriptive alt text; decorative images use `role="presentation"`
- EF-scale bar uses text labels (not color alone) to communicate heat level
- Color contrast meets AA minimums (4.5:1 normal text, 3:1 large text)

### Performance Budget

| Metric | Target | Strategy |
|--------|--------|----------|
| LCP | < 2.5s | Hero images `fetchpriority="high"`, responsive `srcset` |
| FID | < 100ms | Minimal JS, Preact islands `client:visible` only |
| CLS | < 0.1 | Explicit width/height on all images, `font-display: swap` |
| Total JS | < 50KB compressed | Astro zero-JS default + 3KB Preact + form logic |
| Lighthouse mobile | 85+ | All of the above combined |

---

## Constraints

- **No e-commerce.** No cart, checkout, or payment processing anywhere on the site.
- **No user accounts.** No login, registration, or authentication.
- **No traditional database.** All data is in content files, email platform, or analytics.
- **Charity partner must be named** before Mission page can publish (hard block from P1-02).
- **Product renders required** for hero and product pages (dependency on P1-15).
- **Visual identity required** for all page styling (dependency on P1-07).
- **Privacy Policy must be live** before any signup form goes live (compliance gate).
- **Email platform must be configured** before any form goes live (Stories 1-2 block Stories 6-8).

---

## Out of Scope

- E-commerce, cart, checkout, payment processing
- User accounts or authentication
- Phase 2 animated hero section
- Blog or editorial content
- Social media feed embeds
- Internationalization
- Dark mode
- CMS (file-based content is sufficient for 5 products and 2 prose pages)

---

## Project File Structure

```
tomatowarning.com/
├── astro.config.mjs
├── tailwind.config.mjs
├── package.json
├── tsconfig.json
├── public/
│   ├── robots.txt
│   ├── favicon.svg / .ico
│   ├── apple-touch-icon.png
│   └── images/
│       ├── og-default.jpg
│       └── press/ (brand-kit.zip, fact-sheet.pdf)
├── src/
│   ├── assets/images/ (products/, brand/, hero/)
│   ├── config/ (site.ts, forms.ts, analytics.ts)
│   ├── content/ (config.ts, products/*.json, pages/*.md)
│   ├── components/ (layout/, hero/, product/, forms/, common/, press/)
│   ├── layouts/ (BaseLayout, PageLayout, ProductLayout)
│   ├── pages/ (index, mission, retailers, fundraisers, press, privacy, products/)
│   └── styles/ (global.css)
└── docs/ (existing documentation)
```

---

## Story-to-Architecture Mapping

| Story | Components | Data |
|-------|-----------|------|
| S1: Email Platform | `config/forms.ts` | 3 list schemas, welcome automations |
| S2: Signup Forms | 4 Preact form islands + Footer form | Validation rules, form-to-list routing |
| S3: Analytics | `BaseLayout.astro` script, form event handlers | 4 event schemas, UTM convention |
| S5: Mission Page | `pages/mission.astro`, `content/pages/mission.md` | Mission page schema with charity partner gate |
| S6: Nonprofit CTA | `pages/fundraisers.astro`, `NonprofitSignupForm.tsx` | List 3 schema, nonprofit form validation |
| S7: Retailer CTA | `pages/retailers.astro`, `RetailerSignupForm.tsx`, `AssetDownload.astro` | List 2 schema, retailer form validation, PDF conditional display |
| S8: Product Template | `pages/products/[slug].astro`, `ProductLayout.astro`, product components | Product schema, Content Collection |
| S9: Content Population | `content/products/*.json` | 5 product JSON files with brand content |
| S10: Hero Section | `HeroSection.astro`, `EFScaleBar.astro`, `JarImage.astro` | `hero.yaml`, product data for jar renders + colors |
| S11: Press Page | `pages/press.astro`, `AssetDownload.astro`, `PressInquiryForm.tsx` | Press page schema, press inquiry form |
| S12: Privacy Policy | `pages/privacy.astro`, `content/pages/privacy.md` | Privacy page schema, `PrivacyLink.astro` in all forms |

---

## Success Criteria

1. All 11 pages render correctly at desktop (1440px), tablet (768px), and mobile (375px)
2. Lighthouse mobile score 85+ on all pages
3. WCAG 2.1 AA compliance verified via axe or similar
4. All 5 form types submit successfully to correct email lists
5. All 3 analytics conversion events fire on form success with correct properties
6. UTM parameters are captured and attributed correctly in Plausible dashboard
7. KPI dashboard shows real-time counts for all 3 signup metrics
8. Product pages with `status: "draft"` are excluded from production builds
9. Mission page build fails if `charityPartnerName` is empty
10. Privacy policy link is visible on every page with a signup form
11. `<noscript>` fallback links work for all signup forms
12. Press assets download correctly (ZIP, PDF)
13. Pre-launch `noindex` prevents search engine indexing until production launch

---

## Resolved Design Decisions

The spec skeptic identified 9 minor inconsistencies between the system design and data model. These are resolved as follows:

1. **Slug format:** Full slug (`ef-1-coastal-calm`) per system design. Used as URL path segment directly.
2. **Content file format:** JSON for products (no prose body needed). Markdown for pages with long-form content.
3. **Field naming:** camelCase in JSON files and TypeScript, matching Astro Content Collection convention.
4. **`jarImageAlt` field:** Added to product schema (was in system design, missing from data model). Required for WCAG 2.1 AA.
5. **`efColor` name:** Use `efColor` (more descriptive than `color_accent`).
6. **Already-subscribed analytics:** Do NOT fire conversion events for already-subscribed emails to avoid inflating KPI counts.
7. **Consumer `zipCode` field:** Included as optional field on consumer form per data model. System design form interface is generic and passes it as an additional field.
8. **Press inquiry form:** Simple email notification (Cloudflare Worker or mailto:), NOT via email marketing platform.
9. **Retailer PDF conditional display:** Show download link if PDF exists; show "Request spec sheet" if not. Implementation detail handled in `AssetDownload.astro`.

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Jar renders not ready | Medium | High | `status: "draft"` hides unready pages. Styled placeholders for hero. |
| Email platform API changes | Low | Medium | Abstract API calls behind submission service interface. |
| Plausible blocked by ad blockers | Medium | Low | Email platform subscriber count is source of truth for KPIs, not analytics. |
| Content not finalized | High | Medium | Draft status on all content. Incremental launch as content is approved. |
| Mobile performance below 85 | Low | Medium | Astro zero-JS default. Lighthouse CI on every preview deployment. |

---

## Open Questions for Implementation

1. **Email platform final choice:** Kit recommended. Mailchimp acceptable with CF Worker proxy. Decision is P1-12.
2. **Product index page:** Grid of all 5 varieties recommended (simple, adds discoverability).
3. **Font licensing:** Self-hosted recommended for performance (no third-party blocking request).
4. **Pre-launch staging duration:** Coordinate `PUBLIC_NOINDEX` removal with content readiness.

---

## Detailed Architecture Reference

For full implementation details, see:
- **System Design:** `docs/architecture/branding-site-system-design.md` — component hierarchy, integration details, image strategy, SEO, accessibility, performance budget, project structure
- **Data Model:** `docs/architecture/branding-site-data-model.md` — all schemas, validation rules, email list fields, analytics events, data flows, content file structure
