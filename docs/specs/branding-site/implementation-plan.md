---
type: implementation-plan
feature: "Tomato Warning Phase 1 Branding Site"
status: approved
created: "2026-02-26"
updated: "2026-02-26"
source_spec: docs/specs/branding-site/spec.md
source_stories: docs/specs/branding-site/stories.md
source_system_design: docs/architecture/branding-site-system-design.md
source_data_model: docs/architecture/branding-site-data-model.md
authors: [impl-architect, plan-skeptic]
review_rounds: 1
---

# Implementation Plan: Tomato Warning Phase 1 Branding Site

## Summary

A file-by-file implementation plan for the Tomato Warning Phase 1 branding site — a static Astro 5.x site with Preact form islands, Tailwind CSS v4, Plausible Analytics, and Cloudflare Pages deployment. ~63 files across 6 build phases, each phase independently deployable. Covers all 11 active stories, all 9 resolved design decisions, and all non-functional requirements (Lighthouse 85+, WCAG 2.1 AA, SEO, mobile-first).

**Greenfield project** — the repo currently has only `docs/` and `README.md`.

---

## Resolved Design Decisions (Carried Forward from Spec)

Non-negotiable for implementation:

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
import { defineCollection, z } from "astro:content";

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
    jarImage: z.string(),
    jarImageAlt: z.string(),
    metaTitle: z.string(),
    metaDescription: z.string().max(160),
    status: z.enum(["published", "draft"]).default("draft"),
  }),
});

const pages = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    seoTitle: z.string(),
    seoDescription: z.string().max(160),
    status: z.enum(["published", "draft"]).default("draft"),
    lastUpdated: z.string(),
    noIndex: z.boolean().optional().default(false),
  }),
});

export const collections = { products, pages };
```

**Implementation note (from skeptic review):** Mission-specific frontmatter fields (`charityPartnerName`, `givingPercentage`, `donationTotalToDate`, `donationReportingCommitment`, `charityFundUsage`) and press-specific fields (`brandOverview`, `founderName`, `foundingYear`, `founderNarrative`, `pressContactEmail`, `assetBundleUrl`, `factSheetPdfUrl`) are not in the shared pages schema. Validate these at the page component level in `mission.astro` and `press.astro` respectively, since they are page-specific and don't apply to other content collection entries.

### Inferred Product TypeScript Type

```typescript
// Inferred from Zod schema via Astro's CollectionEntry
// Usage: import type { CollectionEntry } from "astro:content";
// type Product = CollectionEntry<"products">["data"];

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
  jarImage: string;
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
  tagline: string;             // "Chase the storm."
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

interface ConsumerSignupFormProps extends SignupFormProps {
  showZipCode?: boolean;
}

interface FormFieldProps {
  name: string;
  label: string;
  type: "text" | "email" | "select" | "textarea";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
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

type FireConversionEvent = (
  eventName: AnalyticsEventName,
  props: ConversionEventProps
) => void;
```

### Submission Types

```typescript
type SubmissionStatus = "idle" | "submitting" | "success" | "already_subscribed" | "error";

interface SubmissionResult {
  status: SubmissionStatus;
  message: string;
}

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

interface PressInquiryPayload {
  name: string;
  email: string;
  outlet?: string;
  message: string;
}
```

---

## 2. Build Phases

### Phase 0: Project Scaffolding (8 files)
**Goal:** Runnable Astro project with all tooling, deployable to Cloudflare Pages as a blank site.

### Phase 1: Foundation Layer (15 files)
**Goal:** Layouts, shared components, global styles, content schemas. Site shell with header/footer on a blank index page.

### Phase 2: Content & Static Pages (15 files)
**Goal:** Privacy policy, mission page, content collection with product data, product pages (template + all 5 products), product index. All static content pages live (forms not wired yet).

### Phase 3: Interactive Islands — Forms + Analytics (12 files)
**Goal:** All Preact form components, email platform integration, analytics events, press inquiry form. Fully functional site with all forms and conversion tracking.

### Phase 4: Hero & Homepage (4 files)
**Goal:** Hero section with EF scale bar, homepage assembly with hero + product grid + consumer signup.

### Phase 5: CTA Pages (4 files)
**Goal:** Retailer CTA, nonprofit CTA, and press pages with their respective forms and asset downloads. All 11 pages live and functional.

### Phase 6: Polish & Verification (5 tasks)
**Goal:** SEO verification, accessibility audit, performance testing, pre-launch noindex config. Production-ready site behind noindex.

---

## 3. File-by-File Plan

### Phase 0: Project Scaffolding

| ID | File | Purpose | Story | Dependencies |
|----|------|---------|-------|-------------|
| P0-01 | `package.json` | Project manifest — astro, @astrojs/preact, @astrojs/sitemap, preact, tailwindcss v4, vitest, typescript, prettier, eslint | Foundation | None |
| P0-02 | `astro.config.mjs` | Astro config — site URL, static output, Preact + Sitemap integrations, Tailwind v4 Vite plugin | Foundation | P0-01 |
| P0-03 | `tsconfig.json` | TypeScript strict mode, path alias `@/*` → `src/*`, Preact JSX | Foundation | P0-01 |
| P0-04 | `public/robots.txt` | Crawl rules + sitemap reference | SEO | None |
| P0-05 | `public/favicon.svg` + `.ico` + `apple-touch-icon.png` | Favicon assets (placeholder until P1-11 logo) | UX | None |
| P0-06 | `public/images/og-default.jpg` | Default OG image 1200x630 (placeholder until visual identity) | SEO | None |
| P0-07 | `.prettierrc` + `.eslintrc.cjs` | Code formatting and linting | Foundation | P0-01 |
| P0-08 | `wrangler.toml` (conditional) | CF Pages/Workers config — needed if CF Worker used for press inquiry or Mailchimp proxy | S1, S11 | Email platform decision |

**Implementation note (from skeptic review):** Clarify during Phase 0 whether Tailwind v4's CSS-based config replaces `tailwind.config.mjs` or if a JS config file is still needed. The system design references `tailwind.config.mjs` for brand colors/fonts/breakpoints. If Tailwind v4 eliminates it, use CSS custom properties in `global.css` instead. If v4 integration is unstable, fall back to Tailwind v3 with `@astrojs/tailwind`.

### Phase 1: Foundation Layer

| ID | File | Purpose | Story | Dependencies |
|----|------|---------|-------|-------------|
| P1-01 | `src/styles/global.css` | Tailwind imports, brand CSS custom properties (EF colors, brand palette), font-face declarations | All | P0-02 |
| P1-02 | `src/config/site.ts` | SiteConfig: name, URL, brand colors, efColors map, nav items | All | None |
| P1-03 | `src/config/forms.ts` | FormConfig objects for all 3 lists (IDs from env vars), dropdown options (role, orgType, audienceType), success/already-subscribed messages | S1, S2 | P1-02 |
| P1-04 | `src/config/analytics.ts` | Event names constant, Plausible config, `fireConversionEvent` utility | S3 | None |
| P1-05 | `src/content/config.ts` | Zod schemas for products (data) and pages (content) collections | S8, S9, S5, S12 | None |
| P1-06 | `src/components/common/SkipNav.astro` | Skip-to-content link, visually hidden until focused | WCAG | P1-01 |
| P1-07 | `src/components/common/SEOHead.astro` | `<head>` meta tags: title, description, canonical, OG, Twitter Card, structured data slot, Plausible script, conditional noindex | SEO | P1-02 |
| P1-08 | `src/components/common/CTAButton.astro` | Reusable CTA button/link, primary/secondary variants | S10, S5 | P1-01 |
| P1-09 | `src/components/common/PrivacyLink.astro` | Privacy policy link for all forms | S12 AC3 | None |
| P1-10 | `src/components/layout/Header.astro` | Site header: logo, nav, mobile hamburger | All | P1-02, P1-01 |
| P1-11 | `src/components/layout/MobileNav.astro` | Mobile nav overlay (CSS toggle, no Preact), focus trap | Mobile NFR | P1-02, P1-10 |
| P1-12 | `src/components/layout/Footer.astro` | Footer: nav, slot for FooterSignupForm island, privacy link, copyright, noscript fallback | S2 AC4, S12 AC3 | P1-02, P1-09 |
| P1-13 | `src/layouts/BaseLayout.astro` | HTML shell: `<html lang="en">`, `<head>` with SEOHead, `<body>` with SkipNav + slot | Foundation | P1-06, P1-07 |
| P1-14 | `src/layouts/PageLayout.astro` | Extends BaseLayout: Header + `<main id="main-content">` + Footer | All pages | P1-13, P1-10, P1-12 |
| P1-15 | `src/layouts/ProductLayout.astro` | Extends PageLayout: Product JSON-LD structured data, product OG tags | S8, SEO | P1-14, P1-05 |

### Phase 2: Content & Static Pages

| ID | File | Purpose | Story | Dependencies |
|----|------|---------|-------|-------------|
| P2-01 | `src/content/products/ef-1-coastal-calm.json` | EF-1 product data (500-1500 SHU, poblano/cilantro, #D4A017) | S9 | P1-05 |
| P2-02 | `src/content/products/ef-2-gulf-breeze.json` | EF-2 product data (1500-5000 SHU, chipotle/serrano, #CC5500) | S9 | P1-05 |
| P2-03 | `src/content/products/ef-3-squall-line.json` | EF-3 product data — canonical test instance (5000-25000 SHU, habanero/mango, #8B2500) | S8 AC5, S9 | P1-05 |
| P2-04 | `src/content/products/ef-4-supercell.json` | EF-4 product data (25000-100000 SHU, ghost pepper/black garlic, #5C0A0A) | S9 | P1-05 |
| P2-05 | `src/content/products/ef-5-ground-zero.json` | EF-5 product data (100000-500000 SHU, Carolina Reaper/Trinidad Moruga Scorpion, #1C0A0A) | S9 | P1-05 |
| P2-06 | `src/content/pages/privacy.md` | Privacy policy: data collected, usage, platform name, unsubscribe, contact email. Status: `"published"` (compliance gate) | S12 AC1-AC2 | P1-05 |
| P2-07 | `src/content/pages/mission.md` | Mission page: origin story, giving structure, EF explanation. Mission-specific frontmatter validated at page level. `charityPartnerName: ""` — hard block. Status: `"draft"` | S5 AC1-AC4 | P1-05 |
| P2-08 | `src/components/product/HeatIndicator.astro` | Visual EF indicator: color swatch + "EF-{n}" text label (WCAG: not color alone) | S8 AC1, WCAG | P1-01 |
| P2-09 | `src/components/product/ProductHero.astro` | Product page top: jar image (Astro `<Image>`), name as `<h1>`, EF level, Scoville range | S8 AC1 | P2-08 |
| P2-10 | `src/components/product/ProductDetails.astro` | Flavor headline, heat descriptor, key ingredients sections | S8 AC1 | P1-01 |
| P2-11 | `src/components/product/ProductCard.astro` | Product card for grid: jar image, name, EF level, flavor headline, linked to `/products/{slug}/` | S8 | P2-08, P1-08 |
| P2-12 | `src/pages/products/[slug].astro` | Dynamic product page: `getStaticPaths()` filtering by status, renders ProductLayout > ProductHero > ProductDetails + form slot | S8 AC1-AC6 | P1-15, P2-09, P2-10 |
| P2-13 | `src/pages/products/index.astro` | Product grid: all published products sorted by efLevel, responsive grid | Spec Q#2 | P1-14, P2-11 |
| P2-14 | `src/pages/privacy.astro` | Privacy policy page at `/privacy/`, "Last updated" date, prose styling | S12 AC1, AC4 | P1-14, P2-06 |
| P2-15 | `src/pages/mission.astro` | Mission page: build-time validation (fail if published with empty charityPartnerName), section layout, bottom CTA | S5 AC1-AC5 | P1-14, P2-07 |

**Implementation note (from skeptic review):** Product JSON stores `jarImage` as a string path. For Astro's build-time image optimization, use Astro's Content Collection `image()` helper in the Zod schema, or resolve image imports in page/component code. A raw string path pointing to `/public/` bypasses Astro's optimization pipeline.

### Phase 3: Interactive Islands — Forms + Analytics

| ID | File | Purpose | Story | Dependencies |
|----|------|---------|-------|-------------|
| P3-01 | `src/lib/submit.ts` | Email platform submission: `submitToEmailPlatform(payload): Promise<SubmissionResult>`. Only file aware of platform API format. Auto-captures signupSource + UTM params. | S1, S2 | P1-03 |
| P3-02 | `src/lib/analytics.ts` | `fireConversionEvent(eventName, props)` — wraps `window.plausible?.()`, type-safe, graceful no-op if blocked | S3 AC2-AC4 | P1-04 |
| P3-03 | `src/lib/validation.ts` | Pure validation functions: `validateEmail`, `validateRequired`, `validateZipCode`, `validateMaxLength`, `validateForm` | S2 edge cases | None |
| P3-04 | `src/components/forms/FormField.tsx` | Reusable Preact field: label, input/select/textarea, error with `aria-describedby` + `aria-live="polite"`, `inputmode="email"` | S2, WCAG | P3-03 |
| P3-05 | `src/components/forms/FormSuccess.tsx` | Success message: `role="status"`, `aria-live="polite"`, receives focus on mount | S2 AC5 | None |
| P3-06 | `src/components/forms/FormError.tsx` | Error message with retry: `role="alert"`, `aria-live="assertive"` | S2 | None |
| P3-07 | `src/components/forms/ConsumerSignupForm.tsx` | "Notify Me" form: email + optional zipCode. On success: fire `consumer_signup` with `product_variety`. On already-subscribed: NO event. Submit disabled during submission. | S2 AC1, S8 AC2-AC4 | P3-01 thru P3-06, P1-03 |
| P3-08 | `src/components/forms/RetailerSignupForm.tsx` | Retailer form: email, name, storeName, location, role dropdown (Other shows free-text), message (max 500). Fire `retailer_signup` on success only. | S2 AC2, S7 AC2-AC4 | P3-01 thru P3-06, P1-03 |
| P3-09 | `src/components/forms/NonprofitSignupForm.tsx` | Nonprofit form: email, contactName, orgName, orgType dropdown (Other shows free-text), location, campaignSize (optional, no validation). Fire `nonprofit_signup` on success only. | S2 AC3, S6 AC3-AC5 | P3-01 thru P3-06, P1-03 |
| P3-10 | `src/components/forms/FooterSignupForm.tsx` | Footer combined: email + audienceType dropdown. Routes to correct list, fires matching event. Compact layout. | S2 AC4 | P3-01 thru P3-06, P1-03 |
| P3-11 | `src/components/forms/PressInquiryForm.tsx` | Press form: name, email, outlet (optional), message (min 10, max 2000). POST to CF Worker at `/api/press-inquiry` OR mailto. Does NOT use email platform. No analytics event. | S11 AC5 | P3-03, P3-04, P3-05, P3-06 |
| P3-12 | Wire forms into pages | Add `client:visible` islands to `products/[slug].astro` (ConsumerSignupForm), `Footer.astro` (FooterSignupForm). Add `<noscript>` fallbacks + PrivacyLink below each form. | S2 | P3-07 thru P3-11, P2-12, P1-12 |

**Implementation note (from skeptic review):** If CF Worker approach is chosen for press inquiry (resolved decision #8), create a Worker function file (e.g., `functions/api/press-inquiry.ts` for CF Pages Functions) in this phase alongside P3-11.

### Phase 4: Hero & Homepage

| ID | File | Purpose | Story | Dependencies |
|----|------|---------|-------|-------------|
| P4-01 | `src/components/hero/JarImage.astro` | Single jar render: Astro `<Image>`, responsive srcset, `eager`/`fetchpriority="high"` option for hero, explicit width/height | S10 AC2, S8 AC1 | P1-01 |
| P4-02 | `src/components/hero/EFScaleBar.astro` | Horizontal bar: CSS gradient #D4A017→#1C0A0A, 5 JarImage positions (all eager), "EF-1"…"EF-5" text labels, styled placeholder if render missing, `aria-label` | S10 AC2, AC5, edge cases | P4-01, P2-01..05 |
| P4-03 | `src/components/hero/HeroSection.astro` | Full hero: `<h1>` headline, sub-copy (Scoville + batch consistency), EF definition, EFScaleBar, CTA to `/mission/`. Static, no JS. | S10 AC1-AC6 | P4-02, P1-08 |
| P4-04 | `src/pages/index.astro` | Homepage: HeroSection, product grid (ProductCards), ConsumerSignupForm island, Organization JSON-LD. Title: "Tomato Warning — Premium Salsa | Chase the Storm" | S10, S8 | P1-14, P4-03, P2-11, P3-07 |

**Design decision:** Hero content (headline, sub-copy, CTA) hardcoded in `HeroSection.astro` or `src/config/site.ts` rather than a separate `hero.yaml` data file. The data model's `hero.yaml` is unnecessary for content that only changes with code deployments.

### Phase 5: CTA Pages

| ID | File | Purpose | Story | Dependencies |
|----|------|---------|-------|-------------|
| P5-01 | `src/components/press/AssetDownload.astro` | Download card: file icon, label, description. Conditional rendering controlled by parent (empty href → parent renders "Request spec sheet" instead) | S11 AC2-AC4, S7 AC5a/5b | P1-01 |
| P5-02 | `src/pages/retailers.astro` | "Stock the Storm": headline above fold, RetailerSignupForm island, conditional PDF download (AssetDownload if PDF exists, "Request spec sheet" if not), professional B2B tone, noscript fallback, PrivacyLink | S7 AC1-AC6 | P1-14, P3-08, P5-01, P1-09 |
| P5-03 | `src/pages/fundraisers.astro` | "Your next fundraiser.": headline, 3 bullets (45-50% margin, no upfront cost, custom label), NonprofitSignupForm island, practical tone, large tap targets, noscript, PrivacyLink | S6 AC1-AC6 | P1-14, P3-09, P1-09 |
| P5-04 | `src/pages/press.astro` | "Storm Watch": brand overview, high-res downloads (brand-kit.zip via AssetDownload), founder narrative (150-250 words, 3rd person), fact sheet PDF, PressInquiryForm island, factual tone | S11 AC1-AC6 | P1-14, P3-11, P5-01 |

### Phase 6: Polish & Verification

| ID | Task | Story | Details |
|----|------|-------|---------|
| P6-01 | Accessibility audit | WCAG 2.1 AA | axe-core on all 11 pages. Verify: skip-nav, form labels, aria-describedby, focus management, EF scale text labels, color contrast (4.5:1 normal, 3:1 large), keyboard navigation, VoiceOver test. |
| P6-02 | Performance verification | Lighthouse 85+ | Lighthouse CI on all pages. Assert: Performance ≥ 85, LCP < 2.5s, FID < 100ms, CLS < 0.1. Verify hero images use `fetchpriority="high"`, total JS < 50KB. |
| P6-03 | SEO verification | SEO NFR | Verify: unique title + meta desc per page, canonical URLs, OG + Twitter tags, Product structured data on product pages, Organization on homepage, sitemap, robots.txt, noindex when `PUBLIC_NOINDEX=true`. |
| P6-04 | Form E2E verification | S2, S3 | Submit all 5 form types with valid/invalid/duplicate data. Verify: correct list receives contact, inline errors, "already on the list" message (no event), analytics events fire on new signups, noscript fallbacks work, press inquiry delivers email. |
| P6-05 | Placeholder images | Risk register | Colored rectangles at correct aspect ratios for `src/assets/images/products/`. Replace with real renders when P1-15 delivers. |

---

## 4. Dependency Graph

```
Phase 0 (Scaffolding)
  P0-01 package.json
    ├── P0-02 astro.config.mjs
    ├── P0-03 tsconfig.json
    └── P0-07 prettier/eslint config
  P0-04 robots.txt (independent)
  P0-05 favicons (independent)
  P0-06 og-default.jpg (independent)

Phase 1 (Foundation) ← Phase 0
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

Phase 2 (Content & Pages) ← Phase 1
  P2-01..05 product JSONs ← P1-05
  P2-06 privacy.md ← P1-05
  P2-07 mission.md ← P1-05
  P2-08 HeatIndicator.astro ← P1-01
  P2-09 ProductHero.astro ← P2-08
  P2-10 ProductDetails.astro ← P1-01
  P2-11 ProductCard.astro ← P2-08, P1-08
  P2-12 products/[slug].astro ← P1-15, P2-09, P2-10
  P2-13 products/index.astro ← P1-14, P2-11
  P2-14 privacy.astro ← P1-14, P2-06
  P2-15 mission.astro ← P1-14, P2-07

Phase 3 (Forms + Analytics) ← Phase 1
  P3-01 lib/submit.ts ← P1-03
  P3-02 lib/analytics.ts ← P1-04
  P3-03 lib/validation.ts (independent)
  P3-04 FormField.tsx ← P3-03
  P3-05 FormSuccess.tsx (independent)
  P3-06 FormError.tsx (independent)
  P3-07 ConsumerSignupForm.tsx ← P3-01..06
  P3-08 RetailerSignupForm.tsx ← P3-01..06
  P3-09 NonprofitSignupForm.tsx ← P3-01..06
  P3-10 FooterSignupForm.tsx ← P3-01..06
  P3-11 PressInquiryForm.tsx ← P3-03..06
  P3-12 Wire forms ← P3-07..11, P2-12, P1-12

Phase 4 (Hero & Homepage) ← Phases 2, 3
  P4-01 JarImage.astro ← P1-01
  P4-02 EFScaleBar.astro ← P4-01, P2-01..05
  P4-03 HeroSection.astro ← P4-02, P1-08
  P4-04 index.astro ← P1-14, P4-03, P2-11, P3-07

Phase 5 (CTA Pages) ← Phase 3
  P5-01 AssetDownload.astro ← P1-01
  P5-02 retailers.astro ← P1-14, P3-08, P5-01
  P5-03 fundraisers.astro ← P1-14, P3-09
  P5-04 press.astro ← P1-14, P3-11, P5-01

Phase 6 (Polish) ← All above
  P6-01..05 verification tasks
```

---

## 5. Test Strategy

### Unit Tests (Vitest)

| Test Area | File Under Test | What to Verify | Story |
|-----------|----------------|----------------|-------|
| Email validation | `lib/validation.ts` | Valid emails pass, invalid fail | S2 edge case 1 |
| Required field | `lib/validation.ts` | Empty fails, non-empty passes | S2 |
| Zip code | `lib/validation.ts` | 5 digits pass, other formats fail, empty passes (optional) | S3 notes |
| Max length | `lib/validation.ts` | Under limit passes, over fails | S7 (message 500), S11 (message 2000) |
| Analytics firing | `lib/analytics.ts` | Calls `window.plausible` with correct args; no-op when blocked | S3 AC2-AC4 |
| Submit success | `lib/submit.ts` | Maps platform "new subscriber" response → `"success"` | S2 |
| Submit duplicate | `lib/submit.ts` | Maps platform "already subscribed" response → `"already_subscribed"` | S2 edge case 2 |
| Submit error | `lib/submit.ts` | Maps network/API error → `"error"` | S2 |
| UTM extraction | `lib/submit.ts` | Parses UTM params from URL correctly | S3 AC5 |
| Content schema | `content/config.ts` | Valid product JSON passes, missing/invalid fields fail | S9 |

### Integration Tests (Vitest + @testing-library/preact)

| Test Area | Component | What to Verify | Story |
|-----------|-----------|----------------|-------|
| Consumer form flow | ConsumerSignupForm | Fill + submit → API called → success message → event fires | S2 AC1, S8 AC3 |
| Already-subscribed | ConsumerSignupForm | Submit duplicate → "on the list" message, NO event | S2 edge case 2, resolved decision #6 |
| API error | ConsumerSignupForm | Submit → error → error message with retry | S2 |
| Submit disabled | ConsumerSignupForm | Button disabled during submission | S3 edge case 2 |
| Retailer form | RetailerSignupForm | All fields + role "Other" → conditional field appears → API called | S7 AC2-AC4, edge case 2 |
| Nonprofit form | NonprofitSignupForm | All fields + orgType "Other" → conditional field → API called | S6 AC3-AC5, edge case 1 |
| Footer routing | FooterSignupForm | Select audience → correct listId + correct event name | S2 AC4 |

### Accessibility Testing

- **Automated:** axe-core via Vitest on all 11 pages
- **Manual checklist:** skip-nav, form labels, aria-describedby, focus management (error→first invalid field, success→success message), EF scale text labels, color contrast, keyboard navigation
- **Screen reader:** VoiceOver on homepage + 1 product page + 1 form page

### Performance Testing

- **Tool:** Lighthouse CI in CI/CD pipeline
- **Assertions:** Performance ≥ 85, Accessibility ≥ 90, Best Practices ≥ 90, SEO ≥ 90
- **Metrics:** LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Mobile emulation** (default Lighthouse config)

### E2E Tests (Optional — Playwright)

If budget allows: homepage → product page → notify form → success; retailer form flow; nonprofit form flow; footer form routing; mobile 375px viewport tests. Requires email platform test environment or mock.

---

## 6. File Count Summary

| Phase | Files | Description |
|-------|-------|-------------|
| Phase 0 | 8 | Scaffolding: package.json, astro.config, tsconfig, robots.txt, favicons, og image, linting config |
| Phase 1 | 15 | Foundation: styles, 3 configs, content config, 5 common components, 3 layout components, 3 layouts |
| Phase 2 | 15 | Content: 5 product JSONs, 2 markdown files, 4 product components, 4 pages |
| Phase 3 | 12 | Forms: 3 lib utilities, 3 form primitives, 5 form islands, 1 wiring task |
| Phase 4 | 4 | Hero: JarImage, EFScaleBar, HeroSection, homepage |
| Phase 5 | 4 | CTA pages: AssetDownload, retailers, fundraisers, press |
| Phase 6 | 5 | Verification tasks + placeholder images |
| **Total** | **~63** | |

---

## 7. Ambiguities to Resolve During Implementation

1. **Tailwind v4 + Astro integration:** Verify `@tailwindcss/vite` works with Astro 5.x. Fallback: Tailwind v3 with `@astrojs/tailwind`.
2. **Press inquiry delivery:** CF Worker recommended for better UX than mailto. If CF Worker, create `functions/api/press-inquiry.ts` in Phase 3.
3. **Mission/Press page schemas:** Mission-specific and press-specific frontmatter fields validated at page component level, not in shared content schema.
4. **Hero data source:** Hardcode in component or config — no separate `hero.yaml` file.
5. **Font selection:** System fonts initially. Swap to brand font when P1-07 visual identity delivers. Self-hosted for performance.
6. **Image imports:** Use Astro's `image()` helper or resolve imports in components rather than raw string paths to enable build-time optimization.

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
