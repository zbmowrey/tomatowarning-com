---
type: implementation-plan
feature: "Tomato Warning Phase 1 Branding Site"
status: approved
created: "2026-02-26"
review_status: "approved by plan-skeptic with 5 non-blocking notes — all addressed"
author: impl-architect
source_spec: docs/specs/branding-site/spec.md
source_stories: docs/specs/branding-site/stories.md
source_system_design: docs/architecture/branding-site-system-design.md
source_data_model: docs/architecture/branding-site-data-model.md
---

# Implementation Plan: Tomato Warning Phase 1 Branding Site

## Resolved Design Decisions (Carried Forward from Spec)

These were resolved during spec review and are non-negotiable for implementation:

1. **Slug format:** Full slug (`ef-1-coastal-calm`), used as URL path segment and JSON filename
2. **Content file format:** JSON for products (not markdown); markdown for prose pages
3. **Field naming:** camelCase in JSON and TypeScript throughout
4. **`jarImageAlt`:** Required field on product schema for WCAG 2.1 AA
5. **`efColor`** (not `color_accent`)
6. **Already-subscribed:** Do NOT fire analytics events for duplicate signups
7. **Consumer `zipCode`:** Optional field on consumer form
8. **Press inquiry:** Cloudflare Worker or mailto (not email platform)
9. **Retailer PDF:** Conditional display (show download if exists, "Request spec sheet" if not)

---

## 1. Interface Definitions

All shared TypeScript types. These MUST be defined before any component work begins.

### Product Type (Content Collection)

```typescript
// src/content/config.ts — Zod schema for product collection
import { defineCollection, z, image } from "astro:content";

const products = defineCollection({
  type: "data",
  schema: z.object({
    name: z.string(),
    efLevel: z.number().int().min(1).max(5) as z.ZodType<1 | 2 | 3 | 4 | 5>,
    slug: z.string().regex(/^ef-[1-5]-.+$/),
    flavorHeadline: z.string(),
    heatDescriptor: z.string(),
    scovilleMin: z.number().int().nonnegative(),
    scovilleMax: z.number().int().nonnegative(),
    keyIngredients: z.tuple([z.string(), z.string()]),
    efColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    jarImage: image(),                          // Astro image() helper for build-time optimization
    jarImageAlt: z.string(),
    metaTitle: z.string(),
    metaDescription: z.string().max(160),
    status: z.enum(["published", "draft"]).default("draft"),
  }),
});

// Base page fields shared by all page types
const basePageFields = {
  title: z.string(),
  seoTitle: z.string(),
  seoDescription: z.string().max(160),
  status: z.enum(["published", "draft"]).default("draft"),
  lastUpdated: z.string(),
  noIndex: z.boolean().optional().default(false),
};

// Pages collection uses a discriminated union on `template` field
// to enforce page-type-specific required fields at build time.
const pages = defineCollection({
  type: "content",
  schema: z.discriminatedUnion("template", [
    // Mission page — requires charity partner fields (S5 hard block)
    z.object({
      ...basePageFields,
      template: z.literal("mission"),
      charityPartnerName: z.string(),         // empty string = draft gate
      givingPercentage: z.string(),
      donationTotalToDate: z.number().default(0),
      donationReportingCommitment: z.string(),
      charityFundUsage: z.string(),
    }),
    // Press page — requires founder/brand fields (S11)
    z.object({
      ...basePageFields,
      template: z.literal("press"),
      brandOverview: z.string(),
      founderName: z.string(),
      foundingYear: z.string(),
      founderNarrative: z.string(),
      pressContactEmail: z.string(),
      assetBundleUrl: z.string().optional(),
      factSheetPdfUrl: z.string().optional(),
    }),
    // Privacy page — requires platform name and contact email (S12)
    z.object({
      ...basePageFields,
      template: z.literal("privacy"),
      emailPlatformName: z.string(),
      privacyContactEmail: z.string(),
    }),
    // Generic page — any other page with no extra fields
    z.object({
      ...basePageFields,
      template: z.literal("generic").optional(),
    }),
  ]),
});

export const collections = { products, pages };
```

### Inferred Product TypeScript Type

```typescript
// This type is inferred from the Zod schema via Astro's CollectionEntry
// Usage: import type { CollectionEntry } from "astro:content";
// type Product = CollectionEntry<"products">["data"];

// For reference, the resolved shape is:
interface Product {
  name: string;
  efLevel: 1 | 2 | 3 | 4 | 5;
  slug: string;
  flavorHeadline: string;
  heatDescriptor: string;
  scovilleMin: number;
  scovilleMax: number;
  keyIngredients: [string, string];
  efColor: string;
  jarImage: ImageMetadata;              // Astro image() resolves to ImageMetadata at build time
  jarImageAlt: string;
  metaTitle: string;
  metaDescription: string;
  status: "published" | "draft";
}
```

### PageMeta

```typescript
// src/config/site.ts
interface PageMeta {
  title: string;
  description: string;
  canonicalPath: string;       // path segment, e.g. "/products/ef-3-squall-line"
  ogImage?: string;            // path to OG image, falls back to site default
  noIndex?: boolean;           // for pre-launch staging
  structuredData?: object;     // JSON-LD object for schema.org
}
```

### Site Config

```typescript
// src/config/site.ts
interface SiteConfig {
  name: string;                // "Tomato Warning"
  tagline: string;             // "Rated by the Storm."
  url: string;                 // "https://tomatowarning.com"
  defaultOgImage: string;      // "/images/og-default.jpg"
  brandColors: {
    stormCharcoal: string;     // "#2C2C2C"
    premiumWhite: string;      // "#F5F0EB"
    radarTeal: string;         // "#00B4D8"
  };
  efColors: Record<1 | 2 | 3 | 4 | 5, string>;
  nav: { label: string; href: string }[];
  socialLinks?: { platform: string; url: string }[];
}
```

### Form Types

```typescript
// src/config/forms.ts
type AudienceType = "consumer" | "retailer" | "nonprofit";

type AnalyticsEventName = "consumer_signup" | "retailer_signup" | "nonprofit_signup";

interface FormConfig {
  listId: string;
  endpoint: string;
  analyticsEvent: AnalyticsEventName;
  successMessage: string;
  alreadySubscribedMessage: string;
}

interface SignupFormProps {
  formConfig: FormConfig;
  sourceContext?: string;       // product slug or page name
}

// Consumer form has optional zipCode
interface ConsumerSignupFormProps extends SignupFormProps {
  showZipCode?: boolean;
}

// Field-level types for the reusable FormField component
interface FormFieldProps {
  name: string;
  label: string;
  type: "text" | "email" | "select" | "textarea";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];  // for select fields
  maxLength?: number;
  pattern?: string;
  errorMessage?: string;
  ariaDescribedBy?: string;
}
```

### Analytics Types

```typescript
// src/config/analytics.ts
interface AnalyticsConfig {
  plausibleDomain: string;
  plausibleScript: string;
}

interface ConversionEventProps {
  source_page: string;
  product_variety?: string;    // only for consumer_signup from product pages
}

// Type-safe event firing function signature
type FireConversionEvent = (
  eventName: AnalyticsEventName,
  props: ConversionEventProps
) => void;
```

### Form Submission Types

```typescript
// Shared form submission utility types
type SubmissionStatus = "idle" | "submitting" | "success" | "already_subscribed" | "error";

interface SubmissionResult {
  status: SubmissionStatus;
  message: string;
}

// Email platform API abstraction
interface EmailSubmissionPayload {
  email: string;
  listId: string;
  fields?: Record<string, string>;
  signupSource: string;
  utmParams?: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
  };
}
```

### Press Inquiry Types

```typescript
// Press form does NOT go through email platform
interface PressInquiryPayload {
  name: string;
  email: string;
  outlet?: string;
  message: string;
}
```

---

## 2. Build Phases

### Phase 0: Project Scaffolding
**Goal:** Runnable Astro project with all tooling, deployable to Cloudflare Pages as a blank site.
**Deploys:** Empty site with correct config.

### Phase 1: Foundation Layer
**Goal:** Layouts, shared components, global styles, content schemas. No pages yet, but the building blocks are ready.
**Deploys:** Site shell with header/footer on a blank index page.

### Phase 2: Content & Static Pages
**Goal:** Privacy policy, mission page, content collection with product data, product pages (template + all 5 products), product index.
**Deploys:** All static content pages live (forms not wired yet).

### Phase 3: Interactive Islands (Forms + Analytics)
**Goal:** All Preact form components, email platform integration, analytics events, press inquiry form.
**Deploys:** Fully functional site with all forms and conversion tracking.

### Phase 4: Hero & Homepage
**Goal:** Hero section with EF scale bar, homepage assembly with hero + product grid + consumer signup.
**Deploys:** Complete homepage.

### Phase 5: CTA Pages (Retailer, Nonprofit, Press)
**Goal:** Retailer CTA, nonprofit CTA, and press pages with their respective forms and asset downloads.
**Deploys:** All 11 pages live and functional.

### Phase 6: Polish & Verification
**Goal:** SEO verification, accessibility audit, performance testing, pre-launch noindex config.
**Deploys:** Production-ready site behind noindex.

---

## 3. File-by-File Plan

### Phase 0: Project Scaffolding

#### P0-01: `package.json`
- **Purpose:** Project manifest with all dependencies.
- **Story traceability:** Foundation for all stories.
- **Dependencies:** None (first file).
- **Implementation:**
  ```
  Dependencies:
    astro: ^5.x
    @astrojs/preact: latest
    @astrojs/sitemap: latest
    @astrojs/tailwind: latest (or Tailwind v4 Vite plugin — see note)
    preact: ^10.x
    tailwindcss: ^4.x

  Dev dependencies:
    typescript: ^5.x
    @types/node: latest
    prettier: latest
    prettier-plugin-astro: latest
    eslint: latest
    eslint-plugin-astro: latest

  Scripts:
    "dev": "astro dev"
    "build": "astro build"
    "preview": "astro preview"
    "lint": "eslint . && prettier --check ."
    "format": "prettier --write ."
  ```
- **Note on Tailwind v4:** Tailwind CSS v4 uses a Vite plugin (`@tailwindcss/vite`) instead of PostCSS. Check if `@astrojs/tailwind` supports v4, or use the Vite plugin directly in `astro.config.mjs`. If v4 integration is unstable, fall back to Tailwind v3 with `@astrojs/tailwind`.

#### P0-02: `astro.config.mjs`
- **Purpose:** Astro project configuration — integrations, site URL, output mode.
- **Story traceability:** Foundation (deployment to CF Pages, sitemap for SEO).
- **Dependencies:** `package.json` (P0-01).
- **Implementation:**
  ```javascript
  import { defineConfig } from "astro/config";
  import preact from "@astrojs/preact";
  import sitemap from "@astrojs/sitemap";
  import tailwindcss from "@tailwindcss/vite";  // Tailwind v4 Vite plugin

  export default defineConfig({
    site: "https://tomatowarning.com",
    output: "static",
    integrations: [
      preact(),
      sitemap(),
    ],
    vite: {
      plugins: [tailwindcss()],
    },
  });
  ```

#### P0-02a: Tailwind CSS v4 configuration
- **Purpose:** Configure Tailwind CSS v4 styling pipeline.
- **Story traceability:** Foundation (spec lists Tailwind CSS v4).
- **Dependencies:** `package.json` (P0-01), `astro.config.mjs` (P0-02).
- **Implementation:**
  - **Tailwind v4 uses CSS-based configuration** — there is no `tailwind.config.mjs` file. Theme customization (brand colors, fonts, breakpoints) is done in `src/styles/global.css` using `@theme` directives.
  - If Tailwind v4 + `@tailwindcss/vite` integration with Astro is unstable at implementation time, fall back to Tailwind v3 with `@astrojs/tailwind` integration and a `tailwind.config.mjs` file.
  - Brand color tokens, EF color scale, and font configuration are defined in `global.css` via `@theme` (v4) or `tailwind.config.mjs` (v3 fallback).

#### P0-03: `tsconfig.json`
- **Purpose:** TypeScript configuration with strict mode and Astro path aliases.
- **Story traceability:** Foundation.
- **Dependencies:** `package.json` (P0-01).
- **Implementation:**
  - Extend `astro/tsconfigs/strict`
  - Add path alias: `@/*` -> `src/*`
  - Enable `jsx: "react-jsx"` and `jsxImportSource: "preact"` for Preact islands

#### P0-04: `public/robots.txt`
- **Purpose:** Search engine crawling instructions with sitemap reference.
- **Story traceability:** SEO (spec section on SEO).
- **Dependencies:** None.
- **Implementation:**
  ```
  User-agent: *
  Allow: /
  Sitemap: https://tomatowarning.com/sitemap-index.xml
  ```

#### P0-05: `public/favicon.svg` + `public/favicon.ico` + `public/apple-touch-icon.png`
- **Purpose:** Favicon assets.
- **Story traceability:** General site UX.
- **Dependencies:** Visual identity (P1-11 logo) — placeholder until available.
- **Implementation:** Placeholder SVG favicon. Replace with real brand mark when available.

#### P0-06: `public/images/og-default.jpg`
- **Purpose:** Default Open Graph image for social sharing.
- **Story traceability:** SEO (spec section on OG tags).
- **Dependencies:** Visual identity — placeholder until available.
- **Implementation:** 1200x630 JPG with brand name. Placeholder initially.

#### P0-07: `.prettierrc` + `.eslintrc.cjs`
- **Purpose:** Code formatting and linting configuration.
- **Story traceability:** Foundation (spec lists ESLint + Prettier).
- **Dependencies:** `package.json` (P0-01).
- **Implementation:** Standard Astro Prettier plugin config. ESLint with `eslint-plugin-astro`.

#### P0-08: `wrangler.toml` (conditional)
- **Purpose:** Cloudflare Pages/Workers configuration — only needed if using Mailchimp (CF Worker proxy).
- **Story traceability:** S1 (email platform), spec resolved decision #8 (press inquiry).
- **Dependencies:** Email platform decision.
- **Implementation:** Defer until email platform is chosen. If Kit, this file is not needed for form submission. May still be needed for press inquiry form (resolved decision #8).

---

### Phase 1: Foundation Layer

#### P1-01: `src/styles/global.css`
- **Purpose:** Tailwind CSS imports and global custom styles (font imports, CSS custom properties for brand colors).
- **Story traceability:** Foundation for all visual stories.
- **Dependencies:** P0-02 (astro.config with Tailwind).
- **Implementation:**
  ```css
  @import "tailwindcss";

  /* Brand font imports (self-hosted for performance — spec open question #3) */
  /* @font-face declarations here once font is selected */

  /* CSS custom properties for brand palette */
  :root {
    --color-storm-charcoal: #2C2C2C;
    --color-premium-white: #F5F0EB;
    --color-radar-teal: #00B4D8;
    --color-ef-1: #D4A017;
    --color-ef-2: #CC5500;
    --color-ef-3: #8B2500;
    --color-ef-4: #5C0A0A;
    --color-ef-5: #1C0A0A;
  }
  ```

#### P1-02: `src/config/site.ts`
- **Purpose:** Site-wide constants — name, URL, brand colors, navigation links.
- **Story traceability:** Used by every page (PageMeta, SEOHead, Header, Footer).
- **Dependencies:** None (pure data).
- **Implementation:** Export a `siteConfig` object matching the `SiteConfig` interface. Navigation items: Home, Products, Mission, Retailers, Fundraisers, Press. Brand palette constants.

#### P1-03: `src/config/forms.ts`
- **Purpose:** Form configuration — list IDs (from env vars), endpoints, success/error messages, form field definitions.
- **Story traceability:** S1 (email platform), S2 (signup forms).
- **Dependencies:** P1-02 (site.ts for base URL context).
- **Implementation:**
  - Read `PUBLIC_EMAIL_FORM_ENDPOINT`, `PUBLIC_CONSUMER_LIST_ID`, `PUBLIC_RETAILER_LIST_ID`, `PUBLIC_NONPROFIT_LIST_ID` from `import.meta.env`
  - Export `consumerFormConfig`, `retailerFormConfig`, `nonprofitFormConfig` objects matching `FormConfig`
  - Export role options array for retailer form dropdown
  - Export org type options array for nonprofit form dropdown
  - Export audience type options for footer form dropdown

#### P1-04: `src/config/analytics.ts`
- **Purpose:** Analytics event names and Plausible configuration.
- **Story traceability:** S3 (analytics).
- **Dependencies:** None (pure data).
- **Implementation:**
  - Export `ANALYTICS_EVENTS` constant: `{ consumerSignup: "consumer_signup", retailerSignup: "retailer_signup", nonprofitSignup: "nonprofit_signup" }`
  - Export `fireConversionEvent` utility function that calls `window.plausible?.()` with type-safe props
  - Read `PUBLIC_PLAUSIBLE_DOMAIN` from env

#### P1-05: `src/content/config.ts`
- **Purpose:** Astro Content Collection schema definitions for products and pages.
- **Story traceability:** S8 (product template), S9 (content population), S5 (mission), S12 (privacy).
- **Dependencies:** None (Astro built-in).
- **Implementation:** Exact Zod schemas as defined in the Interface Definitions section above. Product collection as `type: "data"`, pages collection as `type: "content"`.

#### P1-06: `src/components/common/SkipNav.astro`
- **Purpose:** Skip-to-content link for keyboard/screen reader accessibility.
- **Story traceability:** WCAG 2.1 AA requirement (spec accessibility section).
- **Dependencies:** P1-01 (global.css for visually-hidden styles).
- **Implementation:**
  - Render `<a href="#main-content" class="...">Skip to content</a>`
  - Visually hidden by default, visible on focus
  - Tailwind: `sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2`

#### P1-07: `src/components/common/SEOHead.astro`
- **Purpose:** Reusable `<head>` meta tags — title, description, canonical, OG, Twitter Card, optional structured data.
- **Story traceability:** SEO NFR, all pages.
- **Dependencies:** P1-02 (site.ts for site URL and default OG image).
- **Implementation:**
  - Props: `PageMeta` interface
  - Render `<title>`, `<meta name="description">`, `<link rel="canonical">`
  - Render OG + Twitter Card meta tags
  - Conditional `<meta name="robots" content="noindex, nofollow">` when `noIndex` is true OR `PUBLIC_NOINDEX` env var is set
  - Optional `<script type="application/ld+json">` slot for structured data
  - Plausible analytics `<script>` tag

#### P1-08: `src/components/common/CTAButton.astro`
- **Purpose:** Reusable call-to-action button/link component.
- **Story traceability:** S10 AC4 (hero CTA), S5 (mission page CTA), used throughout.
- **Dependencies:** P1-01 (styles).
- **Implementation:**
  - Props: `href`, `label`, `variant` ("primary" | "secondary"), `external` (boolean)
  - Render as `<a>` for links, `<button>` for form submits
  - Tailwind styling with brand colors

#### P1-09: `src/components/common/PrivacyLink.astro`
- **Purpose:** Privacy policy link used in/near all signup forms.
- **Story traceability:** S12 AC3 (privacy link visible on every form).
- **Dependencies:** None.
- **Implementation:**
  - Render `<a href="/privacy/">Privacy Policy</a>` with appropriate styling
  - Small text, muted color, below form

#### P1-10: `src/components/layout/Header.astro`
- **Purpose:** Site header — logo, navigation links, mobile hamburger trigger.
- **Story traceability:** All pages (layout structure).
- **Dependencies:** P1-02 (site.ts for nav items), P1-01 (styles).
- **Implementation:**
  - Semantic `<header>` with `<nav>` inside
  - Logo (SVG inline or `<img>`) linking to `/`
  - Desktop: horizontal nav links
  - Mobile: hamburger button that toggles `MobileNav`
  - `aria-label="Main navigation"`

#### P1-11: `src/components/layout/MobileNav.astro`
- **Purpose:** Mobile navigation overlay.
- **Story traceability:** Mobile-first NFR (375px usability).
- **Dependencies:** P1-02 (site.ts for nav items), P1-10 (Header triggers it).
- **Implementation:**
  - Hidden by default, toggled via CSS + minimal JS (no Preact needed — CSS `[data-open]` attribute toggle)
  - Full-screen overlay with nav links
  - Close button, focus trap for accessibility
  - `aria-hidden` toggled with visibility

#### P1-12: `src/components/layout/Footer.astro`
- **Purpose:** Site footer — nav links, footer signup form island, privacy link, copyright.
- **Story traceability:** S2 AC4 (footer combined form), S12 AC3 (privacy link).
- **Dependencies:** P1-02 (site.ts), P1-09 (PrivacyLink).
- **Implementation:**
  - Semantic `<footer>`
  - Secondary nav links
  - Slot for `FooterSignupForm` Preact island (wired in Phase 3)
  - `<noscript>` fallback link to hosted form
  - Privacy policy link
  - Copyright notice

#### P1-13: `src/layouts/BaseLayout.astro`
- **Purpose:** HTML shell — `<!DOCTYPE html>`, `<html>`, `<head>` with SEOHead, `<body>` with SkipNav, `<slot/>`.
- **Story traceability:** Foundation for all pages (spec layout inheritance chain).
- **Dependencies:** P1-06 (SkipNav), P1-07 (SEOHead).
- **Implementation:**
  - Props: `PageMeta`
  - `<html lang="en">`
  - `<head>`: charset, viewport, SEOHead component, Plausible script
  - `<body>`: SkipNav, `<slot/>` (page content)
  - No header/footer (that's PageLayout's job)

#### P1-14: `src/layouts/PageLayout.astro`
- **Purpose:** Extends BaseLayout — adds Header + Footer + `<main id="main-content">` wrapper.
- **Story traceability:** All non-product pages.
- **Dependencies:** P1-13 (BaseLayout), P1-10 (Header), P1-12 (Footer).
- **Implementation:**
  - Props: `PageMeta` (passed through to BaseLayout)
  - Render: `<BaseLayout>` > Header > `<main id="main-content">` > `<slot/>` > Footer

#### P1-15: `src/layouts/ProductLayout.astro`
- **Purpose:** Extends PageLayout — adds product-specific structured data (schema.org Product) and OG tags.
- **Story traceability:** S8 (product pages), SEO NFR (structured data).
- **Dependencies:** P1-14 (PageLayout), P1-05 (content config for Product type).
- **Implementation:**
  - Props: `PageMeta` + product data (for structured data)
  - Generate `schema.org/Product` JSON-LD with name, description, brand, availability: PreOrder
  - Pass structured data to SEOHead via PageMeta

---

### Phase 2: Content & Static Pages

#### P2-01: `src/content/products/ef-1-coastal-calm.json`
- **Purpose:** Product data for EF-1 Coastal Calm.
- **Story traceability:** S9 AC1 (per-variety content population).
- **Dependencies:** P1-05 (content config schema), P6-05 (placeholder images in `src/assets/images/products/`).
- **Implementation:** JSON file with all fields per product schema. `status: "draft"` initially. Use data from data model doc (Scoville 500-1500, ingredients: poblano/cilantro, efColor: #D4A017).
- **Image path note:** The `jarImage` field uses a relative path from the content file to the source image in `src/assets/`: `"jarImage": "../../assets/images/products/ef-1-coastal-calm.png"`. Astro's `image()` schema helper resolves this at build time to an optimized `ImageMetadata` object with WebP/AVIF generation and responsive srcset. This is the correct pattern for Astro Content Collections — do NOT use `/public/` paths for jar renders.

#### P2-02: `src/content/products/ef-2-gulf-breeze.json`
- **Purpose:** Product data for EF-2 Gulf Breeze.
- **Story traceability:** S9 AC1.
- **Dependencies:** P1-05, P6-05 (placeholder images).
- **Implementation:** Same structure as P2-01. Scoville 1500-5000, chipotle/serrano, #CC5500. `jarImage` uses relative path to `src/assets/`.

#### P2-03: `src/content/products/ef-3-squall-line.json`
- **Purpose:** Product data for EF-3 Squall Line (canonical test instance per S8 AC5).
- **Story traceability:** S8 AC5 (reference page), S9 AC1.
- **Dependencies:** P1-05, P6-05 (placeholder images).
- **Implementation:** Same structure as P2-01. Scoville 5000-25000, habanero/mango, #8B2500. `jarImage` uses relative path to `src/assets/`.

#### P2-04: `src/content/products/ef-4-supercell.json`
- **Purpose:** Product data for EF-4 Supercell.
- **Story traceability:** S9 AC1.
- **Dependencies:** P1-05, P6-05 (placeholder images).
- **Implementation:** Same structure as P2-01. Scoville 25000-100000, ghost pepper/black garlic, #5C0A0A. `jarImage` uses relative path to `src/assets/`.

#### P2-05: `src/content/products/ef-5-ground-zero.json`
- **Purpose:** Product data for EF-5 Ground Zero.
- **Story traceability:** S9 AC1.
- **Dependencies:** P1-05, P6-05 (placeholder images).
- **Implementation:** Same structure as P2-01. Scoville 100000-500000, Carolina Reaper/Trinidad Moruga Scorpion, #1C0A0A. `jarImage` uses relative path to `src/assets/`.

#### P2-06: `src/content/pages/privacy.md`
- **Purpose:** Privacy policy content (markdown with frontmatter).
- **Story traceability:** S12 AC1 (stable URL), S12 AC2 (required content sections).
- **Dependencies:** P1-05 (content config).
- **Implementation:**
  - Frontmatter: title, seoTitle, seoDescription, status, lastUpdated, `template: "privacy"`, `emailPlatformName`, `privacyContactEmail`
  - Body sections: what data is collected, how it's used, email platform name, how to unsubscribe/delete, contact email
  - "Last updated" date per S12 implementation notes
  - Status: `"published"` (this is a compliance gate — must be live before any forms)

#### P2-07: `src/content/pages/mission.md`
- **Purpose:** Mission page content — origin story, giving structure, EF system explanation.
- **Story traceability:** S5 AC1-AC4.
- **Dependencies:** P1-05 (content config).
- **Implementation:**
  - Frontmatter: title, seoTitle, seoDescription, status, lastUpdated, `template: "mission"`, plus mission-specific fields (charityPartnerName, givingPercentage, donationTotalToDate, donationReportingCommitment, charityFundUsage)
  - `charityPartnerName: ""` initially — hard block per S5 edge case. Build-time validation in `mission.astro` must check this field is non-empty when status is "published"
  - Status: `"draft"` until charity partner is named
  - Body: origin story markdown, EF system explanation, giving structure, community impact

#### P2-08: `src/components/product/HeatIndicator.astro`
- **Purpose:** Visual EF-level indicator — color swatch + text label (not color alone per WCAG).
- **Story traceability:** S8 AC1 (EF level designation), accessibility NFR.
- **Dependencies:** P1-01 (styles).
- **Implementation:**
  - Props: `efLevel: number`, `efColor: string`, `name: string`
  - Render colored badge/pill with "EF-{level}" text label
  - Text contrast must meet AA against badge background color

#### P2-09: `src/components/product/ProductHero.astro`
- **Purpose:** Top section of product page — jar image, product name, EF level, heat info.
- **Story traceability:** S8 AC1 (all required content zones).
- **Dependencies:** P2-08 (HeatIndicator), P1-01 (styles).
- **Implementation:**
  - Props: full product data object
  - Layout: jar image (left on desktop, top on mobile) + product info (right/below)
  - Jar image via Astro `<Image>` component with `jarImageAlt` for alt text
  - Product name as `<h1>`
  - EF level via HeatIndicator
  - Scoville range display: "X - Y SHU"

#### P2-10: `src/components/product/ProductDetails.astro`
- **Purpose:** Flavor headline, heat descriptor, key ingredients section.
- **Story traceability:** S8 AC1 (flavor headline, heat descriptor, Scoville range, key ingredients).
- **Dependencies:** P1-01 (styles).
- **Implementation:**
  - Props: `flavorHeadline`, `heatDescriptor`, `keyIngredients`
  - Styled sections for each content zone
  - `<h2>` level headings for each section

#### P2-11: `src/components/product/ProductCard.astro`
- **Purpose:** Product card for grid displays (product index, homepage).
- **Story traceability:** S8 (product discoverability), spec open question #2 (product index grid).
- **Dependencies:** P2-08 (HeatIndicator), P1-08 (CTAButton).
- **Implementation:**
  - Props: product data (subset: slug, name, efLevel, efColor, jarImage, jarImageAlt, flavorHeadline)
  - Card layout: jar image, product name, EF level indicator, flavor headline
  - Linked to `/products/{slug}/`

#### P2-12: `src/pages/products/[slug].astro`
- **Purpose:** Dynamic product page route — generates 5 pages from content collection.
- **Story traceability:** S8 AC1-AC6 (product page template).
- **Dependencies:** P1-15 (ProductLayout), P2-09 (ProductHero), P2-10 (ProductDetails), P1-05 (content config).
- **Implementation:**
  - `getStaticPaths()`: query products collection, filter by `status: "published"`, return slug params
  - Fetch product data by slug
  - Render ProductLayout > ProductHero > ProductDetails
  - Slot for consumer signup form (wired in Phase 3)
  - `<noscript>` fallback for form
  - Page metadata from product `metaTitle` / `metaDescription`

#### P2-13: `src/pages/products/index.astro`
- **Purpose:** Product index/grid page showing all published products.
- **Story traceability:** Spec open question #2 (recommended: grid page with all 5 product cards).
- **Dependencies:** P1-14 (PageLayout), P2-11 (ProductCard), P1-05 (content config).
- **Implementation:**
  - Query all published products, sorted by efLevel
  - Render grid of ProductCard components
  - Responsive: 1 col mobile, 2 col tablet, 3-5 col desktop

#### P2-14: `src/pages/privacy.astro`
- **Purpose:** Privacy policy page.
- **Story traceability:** S12 AC1 (stable URL at `/privacy`), S12 AC4 (mobile readable).
- **Dependencies:** P1-14 (PageLayout), P2-06 (privacy.md content).
- **Implementation:**
  - Fetch privacy page content from collection
  - Render in PageLayout with prose styling
  - "Last updated" date displayed at top of page

#### P2-15: `src/pages/mission.astro`
- **Purpose:** Mission page — origin story, giving structure, EF system explanation.
- **Story traceability:** S5 AC1-AC5.
- **Dependencies:** P1-14 (PageLayout), P2-07 (mission.md content).
- **Implementation:**
  - Fetch mission page content from collection
  - **Build-time validation:** If `status: "published"` and `charityPartnerName` is empty, throw build error
  - Render sections: origin story, giving structure (percentage, partner name, fund usage, reporting commitment), EF system explanation, community impact ($0 pre-launch)
  - Bottom CTA linking to product pages
  - Mobile-responsive at 375px per S5 AC5

---

### Phase 3: Interactive Islands (Forms + Analytics)

#### P3-01: `src/lib/submit.ts`
- **Purpose:** Email platform submission utility — abstracts API call, handles success/already-subscribed/error responses.
- **Story traceability:** S2 (all forms submit to email platform), S1 (list routing).
- **Dependencies:** P1-03 (forms.ts for endpoint config).
- **Implementation:**
  - Export `submitToEmailPlatform(payload: EmailSubmissionPayload): Promise<SubmissionResult>`
  - POST to email platform endpoint
  - Parse response: new subscriber -> "success", existing -> "already_subscribed", error -> "error"
  - Auto-capture `signupSource` from `window.location.href`
  - Auto-capture UTM params from URL query string
  - This is the ONLY file that knows about the email platform API format — swap here if platform changes

#### P3-02: `src/lib/analytics.ts`
- **Purpose:** Analytics event utility — wraps Plausible custom event API.
- **Story traceability:** S3 AC2-AC4 (conversion events fire on success).
- **Dependencies:** P1-04 (analytics.ts config).
- **Implementation:**
  - Export `fireConversionEvent(eventName: AnalyticsEventName, props: ConversionEventProps): void`
  - Calls `window.plausible?.(eventName, { props })` — graceful no-op if blocked
  - Type-safe: only accepts known event names

#### P3-03: `src/lib/validation.ts`
- **Purpose:** Client-side form validation utilities — email format, required field, zip code, max length.
- **Story traceability:** S2 edge case 1 (email validation), S6/S7 form validation rules from data model.
- **Dependencies:** None (pure functions).
- **Implementation:**
  - `validateEmail(value: string): string | null` — returns error message or null
  - `validateRequired(value: string, fieldName: string): string | null`
  - `validateZipCode(value: string): string | null` — 5 digits, optional field
  - `validateMaxLength(value: string, max: number): string | null`
  - `validateForm(fields: Record<string, string>, rules: ValidationRule[]): Record<string, string>` — returns field->error map

#### P3-04: `src/components/forms/FormField.tsx`
- **Purpose:** Reusable Preact form field — label, input/select/textarea, error display with ARIA.
- **Story traceability:** S2 (all forms), WCAG accessibility NFR (labels, aria-describedby, aria-live).
- **Dependencies:** P3-03 (validation utilities).
- **Implementation:**
  - Props: `FormFieldProps` interface
  - `<label>` element associated with input via `htmlFor`/`id`
  - Error message container with `aria-describedby` linking to input, `aria-live="polite"`
  - Input type `email` with `inputmode="email"` for mobile keyboards
  - Select fields render `<select>` with options
  - Textarea for message fields

#### P3-05: `src/components/forms/FormSuccess.tsx`
- **Purpose:** Inline success confirmation message component.
- **Story traceability:** S2 AC5 (inline confirmation), S6 AC4, S7 AC3, S8 AC3.
- **Dependencies:** None.
- **Implementation:**
  - Props: `message: string`
  - Render success message with checkmark icon
  - `role="status"`, `aria-live="polite"` for screen reader announcement
  - Green/positive styling
  - Receives focus on mount (accessibility: focus management on success)

#### P3-06: `src/components/forms/FormError.tsx`
- **Purpose:** Inline error display component (form-level errors, not field-level).
- **Story traceability:** S2 edge cases (error handling).
- **Dependencies:** None.
- **Implementation:**
  - Props: `message: string`, `onRetry?: () => void`
  - Render error message with retry button
  - `role="alert"`, `aria-live="assertive"`
  - Red/error styling

#### P3-07: `src/components/forms/ConsumerSignupForm.tsx`
- **Purpose:** Preact island — "Notify Me" email form for product pages and hero.
- **Story traceability:** S2 AC1 (consumer form), S8 AC2-AC4 (product page notify form).
- **Dependencies:** P3-01 (submit), P3-02 (analytics), P3-03 (validation), P3-04 (FormField), P3-05 (FormSuccess), P3-06 (FormError), P1-03 (forms.ts).
- **Implementation:**
  - Props: `ConsumerSignupFormProps` (formConfig + sourceContext + showZipCode)
  - Fields: email (required), zipCode (optional, shown if `showZipCode`)
  - On submit: validate -> submit to API -> on success: show FormSuccess + fire `consumer_signup` event with `product_variety` prop -> on already subscribed: show "You're on the list" (NO event) -> on error: show FormError with retry
  - Submit button disabled during submission (double-fire prevention)
  - `<noscript>` handled at page level, not in this component

#### P3-08: `src/components/forms/RetailerSignupForm.tsx`
- **Purpose:** Preact island — retailer interest form.
- **Story traceability:** S2 AC2 (retailer form), S7 AC2-AC4 (retailer page form).
- **Dependencies:** P3-01, P3-02, P3-03, P3-04, P3-05, P3-06, P1-03.
- **Implementation:**
  - Fields: email, name, storeName, location, role (dropdown: Store Owner, Category Manager, Buyer, Other), roleOther (conditional on role=Other), message (optional, max 500)
  - On submit: validate all required fields -> submit to API -> fire `retailer_signup` on success (not on already_subscribed)
  - Role "Other" shows free-text field dynamically

#### P3-09: `src/components/forms/NonprofitSignupForm.tsx`
- **Purpose:** Preact island — nonprofit interest form.
- **Story traceability:** S2 AC3 (nonprofit form), S6 AC3-AC5 (fundraiser page form).
- **Dependencies:** P3-01, P3-02, P3-03, P3-04, P3-05, P3-06, P1-03.
- **Implementation:**
  - Fields: email, contactName, orgName, orgType (dropdown: Youth Sports, Nonprofit 501(c)(3), School, Church/Religious, Community Group, Other), orgTypeOther (conditional), location, campaignSize (optional, no validation)
  - Same submit/analytics pattern as other forms

#### P3-10: `src/components/forms/FooterSignupForm.tsx`
- **Purpose:** Preact island — footer combined signup form with audience dropdown.
- **Story traceability:** S2 AC4 (footer combined form, routes to correct list by dropdown).
- **Dependencies:** P3-01, P3-02, P3-03, P3-04, P3-05, P3-06, P1-03.
- **Implementation:**
  - Fields: email, audienceType (dropdown: Consumer, Retailer, Nonprofit/Organization)
  - On submit: determine target list from audienceType selection, determine matching analytics event name, submit + fire correct event
  - Compact layout suitable for footer

#### P3-11: `src/components/forms/PressInquiryForm.tsx`
- **Purpose:** Preact island — press contact form (NOT via email platform).
- **Story traceability:** S11 AC5 (press inquiry form), resolved decision #8 (CF Worker or mailto).
- **Dependencies:** P3-03 (validation), P3-04 (FormField), P3-05 (FormSuccess), P3-06 (FormError), P3-11a (CF Worker).
- **Implementation:**
  - Fields: name (required), email (required), outlet (optional), message (required, min 10 chars, max 2000)
  - On submit: POST to CF Worker endpoint at `/api/press-inquiry`
  - Does NOT use `submitToEmailPlatform` — separate submission path
  - No analytics conversion event (no KPI target for press)

#### P3-11a: `functions/api/press-inquiry.ts` (Cloudflare Pages Function)
- **Purpose:** Server-side handler for press inquiry form — receives POST, sends email notification to press contact.
- **Story traceability:** S11 AC5 (press inquiry delivery), resolved decision #8 (CF Worker).
- **Dependencies:** P0-08 (wrangler.toml, if needed — CF Pages Functions may not require it).
- **Implementation:**
  - Cloudflare Pages Functions convention: file at `functions/api/press-inquiry.ts` auto-routes to `/api/press-inquiry`
  - Validate incoming JSON payload (name, email, outlet, message)
  - Send email via Cloudflare's `MailChannels` integration or `fetch()` to a transactional email API (e.g., Resend, Mailgun)
  - Worker environment variable: `PRESS_CONTACT_EMAIL` (secret, not PUBLIC_)
  - Return `{ success: true }` or `{ error: "message" }`
  - Rate limiting: basic duplicate detection (same email + message hash within 60s) to prevent spam

#### P3-12: Wire forms into pages
- **Purpose:** Add `client:visible` form islands to existing pages from Phase 2.
- **Story traceability:** S2 (all forms embedded), S8 AC2 (notify form on product pages).
- **Dependencies:** All P3-01 through P3-11, P2-12 (product page), P1-12 (Footer).
- **Implementation:**
  - `products/[slug].astro`: Add `<ConsumerSignupForm client:visible ... />` with product slug as sourceContext
  - `Footer.astro`: Add `<FooterSignupForm client:visible ... />`
  - Each form gets a `<noscript>` sibling with link to hosted form page
  - PrivacyLink component rendered below each form

---

### Phase 4: Hero & Homepage

#### P4-01: `src/components/hero/JarImage.astro`
- **Purpose:** Single jar render with responsive Astro `<Image>` handling.
- **Story traceability:** S10 AC2 (jar image at each level), S8 AC1 (jar mockup on product pages).
- **Dependencies:** P1-01 (styles).
- **Implementation:**
  - Props: `src: string`, `alt: string`, `eager?: boolean`, `size?: "sm" | "md" | "lg"`
  - Use Astro `<Image>` component for WebP/AVIF generation and responsive srcset
  - `loading="eager"` + `fetchpriority="high"` when `eager` is true (hero usage)
  - `loading="lazy"` otherwise
  - Explicit width/height to prevent CLS

#### P4-02: `src/components/hero/EFScaleBar.astro`
- **Purpose:** Horizontal gradient bar with 5 jar positions progressing amber to near-black.
- **Story traceability:** S10 AC2 (EF-scale bar), S10 AC5 (mobile responsive), S10 edge case 4 (text labels, not color alone).
- **Dependencies:** P4-01 (JarImage), P1-05 (content config, product data for jar images and colors).
- **Implementation:**
  - Query all published products sorted by efLevel
  - Render horizontal bar with gradient background (CSS gradient from #D4A017 to #1C0A0A)
  - 5 jar image positions using JarImage component (all `eager` loading)
  - Text labels: "EF-1" through "EF-5" below/above each jar (NOT color alone)
  - Responsive: desktop horizontal, tablet scaled, mobile either horizontal scroll or stacked
  - If any jar render is missing: show styled placeholder with EF label (S10 edge case 1)
  - `aria-label="EF heat scale from EF-1 mild to EF-5 extreme"`

#### P4-03: `src/components/hero/HeroSection.astro`
- **Purpose:** Full hero section — headline, sub-copy, EF scale bar, CTA link to mission.
- **Story traceability:** S10 AC1-AC6 (all hero ACs).
- **Dependencies:** P4-02 (EFScaleBar), P1-08 (CTAButton).
- **Implementation:**
  - Headline: "Finally, a heat scale that means something." as `<h1>`
  - Sub-copy: states Scoville rating per jar + batch consistency (S10 AC3)
  - EF definition: "Based on the Enhanced Fujita tornado wind-speed scale" (S10 edge case 2)
  - EFScaleBar component
  - CTA: "Read our story" linking to `/mission/` per S10 AC4
  - Fully static, no JS — comprehensible without animation (S10 AC6)
  - Mobile responsive at 375px (S10 AC5)

#### P4-04: `src/pages/index.astro`
- **Purpose:** Homepage — hero section, product grid preview, consumer signup form.
- **Story traceability:** S10 (hero), S8 (product discovery from homepage).
- **Dependencies:** P1-14 (PageLayout), P4-03 (HeroSection), P2-11 (ProductCard), P3-07 (ConsumerSignupForm).
- **Implementation:**
  - PageLayout with homepage metadata
  - HeroSection as first content block
  - Product grid section: all published products as ProductCards
  - Consumer signup CTA section with `<ConsumerSignupForm client:visible />`
  - Schema.org Organization structured data in JSON-LD
  - Title: "Tomato Warning — Rated by the Storm"

---

### Phase 5: CTA Pages (Retailer, Nonprofit, Press)

#### P5-01: `src/components/press/AssetDownload.astro`
- **Purpose:** Download link/card for press assets and retailer PDF.
- **Story traceability:** S11 AC2-AC4 (press downloads), S7 AC5a/5b (retailer PDF conditional).
- **Dependencies:** P1-01 (styles).
- **Implementation:**
  - Props: `href: string`, `label: string`, `description?: string`, `fileType?: string`
  - Render download card with file icon, label, description
  - Link opens in new tab or triggers download
  - Conditional rendering controlled by parent page (if `href` is empty/null, parent renders "Request spec sheet" instead)

#### P5-02: `src/pages/retailers.astro`
- **Purpose:** "Stock the Storm" retailer CTA page.
- **Story traceability:** S7 AC1-AC6 (all retailer page ACs).
- **Dependencies:** P1-14 (PageLayout), P3-08 (RetailerSignupForm), P5-01 (AssetDownload), P1-09 (PrivacyLink).
- **Implementation:**
  - Headline: "Stock the Storm." above the fold (S7 AC1)
  - Retailer form via `<RetailerSignupForm client:visible />`
  - PDF download: conditional — if PDF exists at `/downloads/retailer-one-pager.pdf`, show AssetDownload; else show "Request spec sheet" text/CTA (resolved decision #9)
  - Professional tone, B2B layout (S7 AC6)
  - `<noscript>` fallback for form
  - PrivacyLink below form

#### P5-03: `src/pages/fundraisers.astro`
- **Purpose:** "Fundraise for Recovery" nonprofit CTA page.
- **Story traceability:** S6 AC1-AC6 (all nonprofit page ACs).
- **Dependencies:** P1-14 (PageLayout), P3-09 (NonprofitSignupForm), P1-09 (PrivacyLink).
- **Implementation:**
  - Headline: "Your next fundraiser." above the fold (S6 AC1)
  - Three key bullets: 45-50% margin, no upfront cost, custom label option (S6 AC2)
  - Nonprofit form via `<NonprofitSignupForm client:visible />`
  - Practical, benefit-forward copy (not emotional/mission-heavy)
  - Mobile responsive with large tap targets (S6 AC6)
  - `<noscript>` fallback
  - PrivacyLink below form

#### P5-04: `src/pages/press.astro`
- **Purpose:** "Storm Watch" press page.
- **Story traceability:** S11 AC1-AC6 (all press page ACs).
- **Dependencies:** P1-14 (PageLayout), P3-11 (PressInquiryForm), P5-01 (AssetDownload).
- **Implementation:**
  - Brand overview paragraph (S11 AC1)
  - Downloadable high-res product renders via AssetDownload (S11 AC2) — link to brand-kit.zip in `/public/images/press/`
  - Founder narrative section: 150-250 words, third person (S11 AC3)
  - Brand fact sheet PDF via AssetDownload (S11 AC4) — link to fact-sheet.pdf in `/public/images/press/`
  - Press inquiry form via `<PressInquiryForm client:visible />`
  - Factual, professional tone (S11 AC6)

---

### Phase 6: Polish & Verification

#### P6-01: Accessibility audit
- **Story traceability:** WCAG 2.1 AA NFR.
- **Implementation:**
  - Run axe-core on all 11 pages
  - Verify skip-nav works
  - Verify all forms have labels, aria-describedby, focus management
  - Verify color contrast (especially EF-5 near-black text)
  - Verify EF scale bar uses text labels (not color alone)
  - Keyboard-navigate all forms
  - Screen reader test (VoiceOver) on homepage + 1 product page + 1 form page

#### P6-02: Performance verification
- **Story traceability:** Performance budget (Lighthouse 85+ mobile).
- **Implementation:**
  - Run Lighthouse CI on all pages
  - Verify LCP < 2.5s, FID < 100ms, CLS < 0.1
  - Verify total JS < 50KB compressed
  - Verify hero images use `fetchpriority="high"`

#### P6-03: SEO verification
- **Story traceability:** SEO NFR.
- **Implementation:**
  - Verify unique title + meta description on each of 11 pages
  - Verify canonical URLs
  - Verify OG + Twitter Card tags
  - Verify Product structured data on product pages
  - Verify Organization structured data on homepage
  - Verify sitemap generates correctly
  - Verify robots.txt references sitemap
  - Verify `noindex` renders when `PUBLIC_NOINDEX=true`

#### P6-04: Form end-to-end verification
- **Story traceability:** S2 (all forms), S3 (analytics events).
- **Implementation:**
  - Submit each of 5 form types with valid data — verify email platform receives contact
  - Submit with invalid data — verify inline errors
  - Submit with already-subscribed email — verify "already on the list" message, NO analytics event
  - Verify analytics events fire in Plausible for each successful new signup
  - Verify `<noscript>` fallback links work
  - Verify press inquiry form delivers email

#### P6-05: `src/assets/images/products/` — placeholder images
- **Purpose:** Placeholder jar render images until P1-15 delivers real renders.
- **Story traceability:** S10 edge case 1 (missing renders), risk register.
- **Dependencies:** None.
- **Implementation:** Simple colored rectangles or silhouettes at correct aspect ratios. Replace with real renders when P1-15 delivers.

---

## 4. Dependency Graph

```
Phase 0 (Scaffolding)
  P0-01 package.json
    └── P0-02 astro.config.mjs
    └── P0-02a Tailwind v4 config (CSS-based, no separate config file)
    └── P0-03 tsconfig.json
    └── P0-07 prettier/eslint config
  P0-04 robots.txt (independent)
  P0-05 favicons (independent)
  P0-06 og-default.jpg (independent)

Phase 1 (Foundation) — depends on Phase 0
  P1-01 global.css ← P0-02
  P1-02 config/site.ts (independent)
  P1-03 config/forms.ts ← P1-02
  P1-04 config/analytics.ts (independent)
  P1-05 content/config.ts (independent)
  P1-06 SkipNav.astro ← P1-01
  P1-07 SEOHead.astro ← P1-02
  P1-08 CTAButton.astro ← P1-01
  P1-09 PrivacyLink.astro (independent)
  P1-10 Header.astro ← P1-02, P1-01
  P1-11 MobileNav.astro ← P1-02, P1-10
  P1-12 Footer.astro ← P1-02, P1-09
  P1-13 BaseLayout.astro ← P1-06, P1-07
  P1-14 PageLayout.astro ← P1-13, P1-10, P1-12
  P1-15 ProductLayout.astro ← P1-14, P1-05

Phase 2 (Content & Static Pages) — depends on Phase 1
  P2-01..P2-05 product JSON files ← P1-05
  P2-06 privacy.md ← P1-05
  P2-07 mission.md ← P1-05
  P2-08 HeatIndicator.astro ← P1-01
  P2-09 ProductHero.astro ← P2-08
  P2-10 ProductDetails.astro ← P1-01
  P2-11 ProductCard.astro ← P2-08, P1-08
  P2-12 products/[slug].astro ← P1-15, P2-09, P2-10, P2-01..05
  P2-13 products/index.astro ← P1-14, P2-11, P2-01..05
  P2-14 privacy.astro ← P1-14, P2-06
  P2-15 mission.astro ← P1-14, P2-07

Phase 3 (Forms + Analytics) — depends on Phases 1-2
  P3-01 lib/submit.ts ← P1-03
  P3-02 lib/analytics.ts ← P1-04
  P3-03 lib/validation.ts (independent)
  P3-04 FormField.tsx ← P3-03
  P3-05 FormSuccess.tsx (independent)
  P3-06 FormError.tsx (independent)
  P3-07 ConsumerSignupForm.tsx ← P3-01, P3-02, P3-03, P3-04, P3-05, P3-06
  P3-08 RetailerSignupForm.tsx ← P3-01, P3-02, P3-03, P3-04, P3-05, P3-06
  P3-09 NonprofitSignupForm.tsx ← P3-01, P3-02, P3-03, P3-04, P3-05, P3-06
  P3-10 FooterSignupForm.tsx ← P3-01, P3-02, P3-03, P3-04, P3-05, P3-06
  P3-11 PressInquiryForm.tsx ← P3-03, P3-04, P3-05, P3-06, P3-11a
  P3-11a functions/api/press-inquiry.ts (CF Pages Function, independent)
  P3-12 Wire forms into pages ← P3-07..P3-11, P2-12, P1-12

Phase 4 (Hero & Homepage) — depends on Phases 2-3
  P4-01 JarImage.astro ← P1-01
  P4-02 EFScaleBar.astro ← P4-01, P2-01..05
  P4-03 HeroSection.astro ← P4-02, P1-08
  P4-04 index.astro ← P1-14, P4-03, P2-11, P3-07

Phase 5 (CTA Pages) — depends on Phases 3
  P5-01 AssetDownload.astro ← P1-01
  P5-02 retailers.astro ← P1-14, P3-08, P5-01
  P5-03 fundraisers.astro ← P1-14, P3-09
  P5-04 press.astro ← P1-14, P3-11, P5-01

Phase 6 (Polish) — depends on all above
  P6-01..P6-05 verification and placeholder tasks
```

---

## 5. Test Strategy

### Unit Tests

**Tool:** Vitest (Astro's recommended test runner, compatible with Vite)

**What to test:**

1. **Form validation logic** (`src/lib/validation.ts`)
   - Email format: valid emails pass, invalid fail
   - Required field: empty fails, non-empty passes
   - Zip code: 5 digits pass, other formats fail, empty passes (optional)
   - Max length: under limit passes, over fails
   - Story traceability: S2 edge case 1 (email validation), data model Section 4

2. **Analytics event firing** (`src/lib/analytics.ts`)
   - `fireConversionEvent` calls `window.plausible` with correct args
   - Graceful no-op when Plausible is blocked (`window.plausible` undefined)
   - Story traceability: S3 AC2-AC4

3. **Form submission utility** (`src/lib/submit.ts`)
   - Success response mapped to "success" status
   - Already-subscribed response mapped to "already_subscribed" status
   - Error/network failure mapped to "error" status
   - UTM params extracted from URL correctly
   - Story traceability: S2 edge cases 2-3

4. **Content schema validation** (`src/content/config.ts`)
   - Valid product JSON passes schema
   - Missing required fields fail
   - Invalid efLevel (0, 6) fails
   - metaDescription over 160 chars fails
   - Invalid efColor hex fails
   - Story traceability: S9 (content correctness)

### Integration Tests

**Tool:** Vitest + @testing-library/preact (for Preact component tests)

**What to test:**

1. **Form submission flow** (each form component)
   - Render form, fill fields, submit -> verify API called with correct payload
   - Verify success message displayed on success
   - Verify "already on the list" message on duplicate (no event fired)
   - Verify error message displayed on API error
   - Verify submit button disabled during submission
   - Story traceability: S2 AC1-AC5, S6 AC4, S7 AC3, S8 AC3

2. **Conditional field rendering**
   - Retailer form: select "Other" role -> verify roleOther field appears
   - Nonprofit form: select "Other" org type -> verify orgTypeOther field appears
   - Story traceability: S7 edge case 2, S6 edge case 1

3. **Footer form routing**
   - Select "Consumer" -> verify consumer list ID used in submission
   - Select "Retailer" -> verify retailer list ID used
   - Select "Nonprofit/Organization" -> verify nonprofit list ID used
   - Verify correct analytics event name matches selection
   - Story traceability: S2 AC4

### Accessibility Testing

**Tools:** axe-core (automated), manual keyboard/screen reader testing

1. **Automated (axe-core in Vitest):** Run axe on rendered HTML of all 11 pages
2. **Manual checklist:**
   - Skip-nav link visible on focus, navigates to main content
   - All form inputs have associated labels
   - Form errors announced by screen readers (aria-live)
   - Focus moves to first error field on validation failure
   - Focus moves to success message on form success
   - EF scale bar has text labels (not color alone)
   - All images have alt text
   - Color contrast meets AA (4.5:1 normal, 3:1 large)
   - Keyboard navigation through all interactive elements

### Performance Testing

**Tool:** Lighthouse CI (automated in CI/CD pipeline)

1. Run Lighthouse on all 11 page URLs in CI
2. Assert: Performance >= 85, Accessibility >= 90, Best Practices >= 90, SEO >= 90
3. Assert specific metrics: LCP < 2.5s, FID < 100ms, CLS < 0.1
4. Run on mobile emulation (default Lighthouse config)
5. Story traceability: Performance budget (spec section), NFR

### E2E Tests

**Tool:** Playwright (if budget allows; optional for Phase 1)

**Scope (if implemented):**

1. Homepage load -> click product card -> product page renders -> submit notify form -> success message
2. Navigate to retailers -> fill form -> submit -> success message
3. Navigate to fundraisers -> fill form -> submit -> success message
4. Footer form -> select audience -> submit -> success message
5. All navigation links work
6. Mobile viewport (375px) tests for homepage + 1 product page + 1 form page

**Note:** E2E tests require a running email platform test environment or mock. May be deferred to post-launch if email platform sandbox is unavailable.

---

## 6. File Count Summary

| Phase | Files | Description |
|-------|-------|-------------|
| Phase 0 | 9 | Scaffolding: package.json, astro.config, Tailwind v4 config, tsconfig, robots.txt, favicons, og image, linting config |
| Phase 1 | 15 | Foundation: styles, 3 configs, content config, 5 common components, 3 layout components, 3 layouts |
| Phase 2 | 15 | Content: 5 product JSONs, 2 markdown files, 4 product components, 4 pages |
| Phase 3 | 13 | Forms: 3 lib utilities, 3 form primitives, 5 form islands, 1 CF Pages Function (press inquiry), 1 wiring task |
| Phase 4 | 4 | Hero: JarImage, EFScaleBar, HeroSection, homepage |
| Phase 5 | 4 | CTA pages: AssetDownload, retailers, fundraisers, press |
| Phase 6 | 5 | Verification tasks + placeholders |
| **Total** | **~65** | Files to create/modify |

---

## 7. Ambiguities Identified

1. **Tailwind v4 + Astro integration:** Tailwind CSS v4 changed its integration model (Vite plugin instead of PostCSS). Need to verify `@astrojs/tailwind` supports v4 or use `@tailwindcss/vite` directly. Fallback: Tailwind v3. **RESOLVED:** Added P0-02a clarifying that v4 uses CSS-based config (`@theme` in global.css, no `tailwind.config.mjs`), with v3 fallback plan.
2. **Press inquiry delivery mechanism:** Spec says "CF Worker or mailto." **RESOLVED:** Chose CF Worker path. Added P3-11a (`functions/api/press-inquiry.ts`) as a Cloudflare Pages Function for server-side email delivery.
3. **Mission page frontmatter vs. markdown approach:** The data model defines mission-specific fields (charityPartnerName, givingPercentage, etc.) as frontmatter. **RESOLVED:** Updated `content/config.ts` to use a discriminated union on `template` field — mission, press, and privacy pages each have type-specific Zod schemas validated at build time.
4. **Hero data source:** The data model defines `data/components/hero.yaml` as a separate data file. The spec and system design do not mention this file. **RESOLVED:** Hardcode hero content in `HeroSection.astro` or `src/config/site.ts`. No separate data file needed.
5. **Font selection:** Spec lists this as an open question. Implementation should proceed with system fonts initially, then swap in the licensed brand font when P1-07 (visual identity) delivers.

---

## 7a. Plan Skeptic Review Resolution

The plan was reviewed by plan-skeptic and **APPROVED**. Five non-blocking issues were raised; all have been addressed:

| # | Issue | Resolution |
|---|-------|------------|
| 1 | Mission/press page schema gap — page-specific fields not in Zod schema | **Fixed.** Updated `content/config.ts` to use `z.discriminatedUnion("template", [...])` with mission, press, privacy, and generic page schemas. All page-type-specific fields are now schema-validated at build time. |
| 2 | Image path vs. Astro Image import — `jarImage` as string path won't trigger build optimization | **Fixed.** Changed `jarImage` field to use Astro's `image()` schema helper. Product JSON files use relative paths to `src/assets/images/products/`. Astro resolves these to `ImageMetadata` at build time for WebP/AVIF generation. |
| 3 | `tailwind.config.mjs` missing from Phase 0 | **Fixed.** Added P0-02a clarifying Tailwind v4's CSS-based configuration model (`@theme` directives in `global.css`). No `tailwind.config.mjs` needed for v4; fallback plan for v3 documented. |
| 4 | CF Worker for press inquiry not scoped into file plan | **Fixed.** Added P3-11a (`functions/api/press-inquiry.ts`) — a Cloudflare Pages Function that receives POST, validates payload, and sends email notification to press contact. |
| 5 | Image import path reconciliation between JSON and `src/assets/` | **Fixed.** Clarified in P2-01 that product JSON `jarImage` uses relative paths from content file to `src/assets/` (e.g., `"../../assets/images/products/ef-1-coastal-calm.png"`), which Astro's `image()` helper resolves at build time. Added explicit note: do NOT use `/public/` paths for jar renders. |

---

## 8. Story Traceability Matrix

| Story | Key Files | Phase |
|-------|-----------|-------|
| S1 (Email Platform) | config/forms.ts, lib/submit.ts | P1, P3 |
| S2 (Signup Forms) | All form components (P3-04 through P3-12) | P3 |
| S3 (Analytics) | config/analytics.ts, lib/analytics.ts, form event handlers | P1, P3 |
| S5 (Mission Page) | content/pages/mission.md, pages/mission.astro | P2 |
| S6 (Nonprofit CTA) | pages/fundraisers.astro, NonprofitSignupForm.tsx | P3, P5 |
| S7 (Retailer CTA) | pages/retailers.astro, RetailerSignupForm.tsx, AssetDownload.astro | P3, P5 |
| S8 (Product Template) | pages/products/[slug].astro, ProductLayout.astro, product components | P1, P2 |
| S9 (Content Population) | content/products/*.json (5 files) | P2 |
| S10 (Hero Section) | HeroSection.astro, EFScaleBar.astro, JarImage.astro | P4 |
| S11 (Press Page) | pages/press.astro, PressInquiryForm.tsx, AssetDownload.astro | P3, P5 |
| S12 (Privacy Policy) | content/pages/privacy.md, pages/privacy.astro, PrivacyLink.astro | P1, P2 |
