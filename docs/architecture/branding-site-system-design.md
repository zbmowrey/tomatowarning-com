---
type: system-design
feature: "Tomato Warning Phase 1 Branding Site"
status: draft
created: "2026-02-26"
updated: "2026-02-26"
authors: [architect]
source_stories: docs/specs/branding-site/stories.md
source_roadmap: docs/roadmap/_index.md
---

# System Design: Tomato Warning Phase 1 Branding Site

## 1. Tech Stack Recommendation

### Decision: Astro

**Chosen framework:** Astro (v5.x)

**Rationale (ADR format):**

**Context:** The Phase 1 branding site is a static content site with 11 pages, no user accounts, no database, no server-side rendering requirements, and no e-commerce. The primary interactive elements are email signup forms (4 form variants across pages) and analytics event firing. The site must achieve Lighthouse 85+ on mobile, meet WCAG 2.1 AA, and support image-heavy pages (5 jar renders in the hero, 5 product pages with jar mockups).

**Options considered:**

| Framework | Pros | Cons | Fit |
|-----------|------|------|-----|
| **Astro** | Zero JS by default, ships only what's needed. Built-in image optimization (`<Image>` component with WebP/AVIF). Content Collections for type-safe markdown/JSON data. Island architecture for interactive form components. Excellent Lighthouse scores out of the box. First-class sitemap and SEO support. | Smaller ecosystem than Next.js. Less corporate backing. | Best fit |
| **Next.js** | Largest ecosystem, strong community. App Router with RSC. Vercel-native deployment. | Overkill for a static site with no API routes, no auth, no database. Ships unnecessary client JS. Static export mode works but you fight the framework's SSR-first defaults. Image optimization requires a running server or Vercel-specific loader. | Overpowered |
| **Eleventy** | Minimal, fast, zero-config static output. Template-agnostic. | No built-in image optimization pipeline. No component model — templating is Nunjucks/Liquid, not component-based. Requires manual setup for everything modern (CSS bundling, image processing, etc.). | Underpowered |
| **Hugo** | Fastest build times. Single binary. | Go templating language is unfamiliar to most web developers. No component model. Image processing exists but is limited compared to Astro/Next. Poor DX for interactive islands. | Wrong paradigm |

**Decision:** Astro. It is purpose-built for content-heavy static sites with selective interactivity — exactly what this project is. Zero JS by default means Lighthouse performance is excellent without optimization effort. Content Collections provide a type-safe content model for product data. Island architecture lets us add interactive forms (using vanilla JS or a lightweight framework like Preact) without shipping a full SPA runtime. Built-in image optimization handles the jar renders and brand assets.

**Consequences:**
- Forms will use Astro islands with Preact (3KB runtime) for inline validation and submission UX
- No full SPA — page transitions are standard browser navigation
- Content is authored in markdown and JSON files (no CMS dependency)
- Build output is pure static HTML/CSS/JS — deployable anywhere

### Supporting tools

| Concern | Tool | Rationale |
|---------|------|-----------|
| **Styling** | Tailwind CSS v4 | Utility-first, purges unused CSS, mobile-first by default, accessible color contrast utilities |
| **Form interactivity** | Preact (via Astro island) | 3KB alternative to React for form validation/submission UX. Only loaded on pages with forms. |
| **Email platform** | Mailchimp or Kit (ConvertKit) | Both support embeddable forms, API-driven signup, list segmentation, and welcome automations. Kit is simpler; Mailchimp has a more generous free tier. Final choice deferred to P1-12. |
| **Analytics** | Plausible Analytics | Privacy-respecting (no cookies, GDPR-compliant without consent banner), lightweight script (< 1KB), custom event support, UTM tracking built-in. Addresses the ad-blocker edge case from Story 3. |
| **Deployment** | Cloudflare Pages | Free static hosting, global CDN, automatic HTTPS, preview deployments per branch, no vendor lock-in (pure static output). |
| **Package manager** | npm | Standard, no additional tooling decisions |
| **Linting/formatting** | ESLint + Prettier | Standard Astro configs available |

---

## 2. Site Structure

### Page hierarchy and routing

```
src/
  pages/
    index.astro                          # Homepage with hero section (Story 10)
    mission.astro                        # Mission page (Story 5)
    retailers.astro                      # "Stock the Storm" retailer CTA (Story 7)
    fundraisers.astro                    # "Fundraise for Recovery" nonprofit CTA (Story 6)
    press.astro                          # "Storm Watch" press page (Story 11)
    privacy.astro                        # Privacy policy (Story 12)
    products/
      index.astro                        # Product index — redirects to homepage or shows grid
      [slug].astro                       # Dynamic route for all 5 product pages (Story 8)
```

**Generated URLs:**

```
/                                        Homepage
/mission/                                Mission page
/retailers/                              Retailer CTA
/fundraisers/                            Nonprofit CTA
/press/                                  Press page
/privacy/                                Privacy policy
/products/ef-1-coastal-calm/             EF-1 product page
/products/ef-2-gulf-breeze/              EF-2 product page
/products/ef-3-squall-line/              EF-3 product page
/products/ef-4-supercell/                EF-4 product page
/products/ef-5-ground-zero/              EF-5 product page
```

### Shared layouts

```
src/
  layouts/
    BaseLayout.astro        # HTML shell: <head>, meta, analytics script, skip-nav, <slot/>
    PageLayout.astro        # Extends Base: adds Header + Footer + main content wrapper
    ProductLayout.astro     # Extends Page: adds product-specific structured data and OG tags
```

**Layout inheritance:**

```
BaseLayout
  └─ PageLayout
       ├─ index.astro
       ├─ mission.astro
       ├─ retailers.astro
       ├─ fundraisers.astro
       ├─ press.astro
       ├─ privacy.astro
       ├─ products/index.astro
       └─ ProductLayout
            └─ products/[slug].astro
```

---

## 3. Component Architecture

### Component inventory

```
src/
  components/
    layout/
      Header.astro                # Site header: logo, nav links, mobile hamburger
      Footer.astro                # Site footer: nav, combined signup form, privacy link
      MobileNav.astro             # Mobile navigation overlay (island if JS needed)
    hero/
      HeroSection.astro           # Full hero: headline, sub-copy, EF bar, CTA
      EFScaleBar.astro            # Horizontal gradient bar with 5 jar positions
      JarImage.astro              # Single jar render with responsive image handling
    product/
      ProductCard.astro           # Used on product index or homepage grid
      ProductHero.astro           # Top section of product page: jar, name, heat info
      ProductDetails.astro        # Flavor headline, Scoville range, ingredients
      HeatIndicator.astro         # Visual EF-level indicator (color + label)
    forms/
      ConsumerSignupForm.tsx      # Preact island: "Notify Me" email-only form
      RetailerSignupForm.tsx      # Preact island: name, store, location, role, message
      NonprofitSignupForm.tsx     # Preact island: org name, contact, email, type, location, size
      FooterSignupForm.tsx        # Preact island: email + audience dropdown
      FormField.tsx               # Reusable form field with label, validation, error display
      FormSuccess.tsx             # Inline success confirmation message
      FormError.tsx               # Inline error display
    common/
      SEOHead.astro               # Meta tags, OG tags, canonical URL, structured data slot
      SkipNav.astro               # Skip-to-content link for accessibility
      CTAButton.astro             # Reusable call-to-action button/link
      PrivacyLink.astro           # Privacy policy link (used in all forms)
    press/
      AssetDownload.astro         # Download link/card for press assets
      PressInquiryForm.tsx        # Preact island: press contact form
```

### Component boundaries and props

**Static components (.astro)** — Render at build time, zero client JS. Used for layout, content display, image rendering.

**Interactive islands (.tsx / Preact)** — Hydrated on the client. Used exclusively for forms that need inline validation, async submission, and dynamic success/error states.

**Key interfaces:**

```typescript
// Product data shape (from Content Collection)
interface Product {
  slug: string;                    // "ef-1-coastal-calm"
  name: string;                    // "Coastal Calm"
  efLevel: 1 | 2 | 3 | 4 | 5;
  flavorHeadline: string;          // "Bright, fresh — FL tomatoes, poblano, cilantro, lime"
  heatDescriptor: string;          // "A gentle gust — big flavor, little fire"
  scovilleMin: number;             // 500
  scovilleMax: number;             // 1500
  keyIngredients: [string, string]; // ["Florida tomatoes", "poblano peppers"]
  efColor: string;                 // "#D4A017"
  jarImage: string;                // Path to jar render asset
  jarImageAlt: string;             // Descriptive alt text
  metaTitle: string;
  metaDescription: string;
  status: "published" | "draft";   // Controls visibility (Story 9 edge case)
}

// Signup form props
interface SignupFormProps {
  listId: string;                  // Email platform list identifier
  analyticsEvent: string;          // "consumer_signup" | "retailer_signup" | "nonprofit_signup"
  successMessage: string;
  sourceContext?: string;          // Product slug or page name for analytics property
}

// Page metadata
interface PageMeta {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage?: string;
  noIndex?: boolean;               // For pre-launch staging (Story 11 edge case)
}
```

### Island hydration strategy

All form components use `client:visible` directive — they hydrate only when the form scrolls into the viewport. This avoids loading Preact on initial page load if the user hasn't scrolled to a form yet.

```astro
<!-- Example: Product page notify form -->
<ConsumerSignupForm
  client:visible
  listId={CONSUMER_LIST_ID}
  analyticsEvent="consumer_signup"
  sourceContext={product.slug}
  successMessage="You're on the list. We'll let you know when we launch."
/>
```

---

## 4. Third-Party Integration Design

### Email platform integration

**Submission flow:**

```
User fills form → Client-side validation (Preact) → POST to email platform API
                                                    → Success: show inline confirmation
                                                    → Error: show inline error with retry
                                                    → Fire analytics conversion event
```

**Implementation approach: API-based submission (not iframes/embeds)**

Rather than embedding platform-provided forms (which are hard to style and break visual consistency), the forms are custom-built Preact components that submit directly to the email platform's public subscriber API.

- **Mailchimp:** POST to `/lists/{list_id}/members` via their Marketing API (requires a lightweight serverless proxy to protect the API key — see Deployment section)
- **Kit (ConvertKit):** POST to their public Form endpoint (no API key needed for public forms, CORS-friendly)

**Recommendation:** Kit (ConvertKit) is preferred because its public form API does not require a server-side proxy, reducing architectural complexity. If Mailchimp is chosen, a single Cloudflare Worker acts as an API proxy.

**Form-to-list routing:**

| Form | Location | Target List | Analytics Event |
|------|----------|-------------|-----------------|
| Consumer "Notify Me" | Product pages, hero | "Notify Me" (Consumer) | `consumer_signup` |
| Retailer interest | `/retailers/` | "Stock the Storm" (Retailer) | `retailer_signup` |
| Nonprofit interest | `/fundraisers/` | "Fundraise for Recovery" (Nonprofit) | `nonprofit_signup` |
| Footer combined | All pages (footer) | Routed by dropdown selection | Event matches selected list |

**Duplicate email handling:** The email platform handles deduplication per-list natively. Cross-list duplicates are allowed per Story 1 AC (a retailer can also be a consumer subscriber). The form shows a neutral "You're on the list" message for already-subscribed emails rather than an error.

**Graceful degradation (JS disabled):** Each form includes a `<noscript>` block with a direct link to the email platform's hosted signup page for that list.

### Analytics integration

**Platform: Plausible Analytics**

**Installation:** Single `<script>` tag in `BaseLayout.astro` `<head>`. Plausible's script is < 1KB and does not use cookies, so no consent banner is needed (GDPR-compliant by design).

```html
<script defer data-domain="tomatowarning.com"
  src="https://plausible.io/js/script.tagged-events.js"></script>
```

**Pageview tracking:** Automatic — Plausible fires a pageview on every page load with URL and title.

**Conversion events:** Fired from the form submission success handler in each Preact form component:

```typescript
// In form onSubmit success handler
window.plausible?.("consumer_signup", {
  props: { source_page: sourceContext }
});
```

**UTM tracking:** Plausible captures UTM parameters automatically from the URL and associates them with pageviews and subsequent conversions within the same session. No custom code needed.

**Double-fire prevention:** The form success handler sets a local state flag and disables the submit button after successful submission, preventing duplicate event firing on re-click. The form does not re-render on page refresh (no URL-based confirmation state).

**Bot filtering:** Plausible filters known bots/crawlers by default.

---

## 5. Content Model

### Astro Content Collections

Product data and page content are managed through Astro's Content Collections — type-safe, file-based content with schema validation at build time.

```
src/
  content/
    config.ts                    # Schema definitions for all collections
    products/
      ef-1-coastal-calm.json
      ef-2-gulf-breeze.json
      ef-3-squall-line.json
      ef-4-supercell.json
      ef-5-ground-zero.json
    pages/
      mission.md                 # Mission page long-form content
      privacy.md                 # Privacy policy content
```

**Product collection schema (`config.ts`):**

```typescript
import { defineCollection, z } from "astro:content";

const products = defineCollection({
  type: "data",
  schema: z.object({
    name: z.string(),
    efLevel: z.number().int().min(1).max(5),
    slug: z.string(),
    flavorHeadline: z.string(),
    heatDescriptor: z.string(),
    scovilleMin: z.number(),
    scovilleMax: z.number(),
    keyIngredients: z.tuple([z.string(), z.string()]),
    efColor: z.string(),
    jarImage: z.string(),
    jarImageAlt: z.string(),
    metaTitle: z.string(),
    metaDescription: z.string(),
    status: z.enum(["published", "draft"]).default("draft"),
  }),
});

export const collections = { products };
```

**Example product data file (`ef-3-squall-line.json`):**

```json
{
  "name": "Squall Line",
  "efLevel": 3,
  "slug": "ef-3-squall-line",
  "flavorHeadline": "Habanero-forward with tropical mango counter, complex heat",
  "heatDescriptor": "The storm is here — tropical sweetness chased by real heat",
  "scovilleMin": 5000,
  "scovilleMax": 25000,
  "keyIngredients": ["habanero peppers", "tropical mango"],
  "efColor": "#8B2500",
  "jarImage": "/images/products/ef-3-squall-line.webp",
  "jarImageAlt": "Tomato Warning EF-3 Squall Line salsa jar — medium-hot habanero mango salsa",
  "metaTitle": "EF-3 Squall Line | Tomato Warning",
  "metaDescription": "Habanero-forward with tropical mango. 5,000-25,000 SHU. The storm is here.",
  "status": "draft"
}
```

**Why file-based content, not a CMS:**

- The site has 5 product entries and 2 long-form pages. A CMS adds infrastructure complexity for minimal content management benefit.
- Content changes are version-controlled in git — every change is tracked, reviewable, and reversible.
- Story 9 edge case (variety names change before launch) is handled by editing JSON files and redeploying. A code change is acceptable for 5 items.
- If content management needs grow in Phase 2 (blog, editorial, frequent updates), a headless CMS (Keystatic, which integrates natively with Astro) can be added without architectural changes.

### Form configuration

Form configurations (list IDs, field definitions) are stored in a central config file rather than hardcoded in components:

```
src/
  config/
    forms.ts                     # List IDs, field schemas, success messages
    site.ts                      # Site-wide config: domain, brand colors, social links
    analytics.ts                 # Event names, Plausible config
```

---

## 6. Image / Asset Strategy

### Product jar renders

**Source format:** High-resolution PNG renders from the design team (P1-15 dependency).

**Optimization pipeline:** Astro's built-in `<Image>` component handles:

1. **Format conversion:** Generates WebP (primary) and AVIF (progressive enhancement) at build time, with original format as fallback
2. **Responsive sizing:** Generates multiple widths (320w, 640w, 960w, 1280w) for `srcset`
3. **Lazy loading:** `loading="lazy"` on all images below the fold; `loading="eager"` on hero jar renders (above the fold)
4. **Aspect ratio reservation:** Width and height attributes set to prevent layout shift (CLS optimization)

**Directory structure:**

```
src/
  assets/
    images/
      products/
        ef-1-coastal-calm.png       # Source renders (high-res)
        ef-2-gulf-breeze.png
        ef-3-squall-line.png
        ef-4-supercell.png
        ef-5-ground-zero.png
      brand/
        logo.svg                     # Vector logo (SVG for crisp rendering at any size)
        logo-dark.svg                # Logo variant for dark backgrounds
        vortex-mark.svg              # Standalone vortex icon
      hero/
        ef-scale-bar-bg.svg          # Background gradient for EF scale bar (vector)
      press/
        brand-kit.zip                # Downloadable press asset bundle
        fact-sheet.pdf               # Brand fact sheet
public/
  images/
    og-default.jpg                   # Default Open Graph image (1200x630)
    favicon.svg                      # SVG favicon
    favicon.ico                      # ICO fallback
    apple-touch-icon.png             # iOS home screen icon
```

**Key decisions:**

- **Logo as SVG:** Crisp at any size, tiny file weight, accessible (supports `<title>` for screen readers).
- **Jar renders processed at build time:** No runtime image processing. All optimization happens during `astro build`. This means zero server-side compute requirements.
- **Press assets as static files in `/public`:** Large files (ZIP, PDF) are served directly without Astro processing. They are not image-optimized — they are download-only assets.
- **Alt text per jar render:** Stored in the product JSON data (Story 8 AC, WCAG 2.1 AA requirement). Alt text includes product name and heat level.

### Hero section images

The hero EF-scale bar (Story 10) requires all 5 jar renders visible simultaneously. On mobile (375px), this is the most constrained layout.

**Approach:**
- Desktop: 5 jars at ~200px width each, horizontal bar
- Tablet (768px): 5 jars at ~120px, may stack or scroll
- Mobile (375px): 5 jars at ~60px with horizontal scroll within a contained area, or vertically stacked. Final decision is a design call, but the architecture supports both via responsive `srcset` and CSS.

All 5 hero jar images use `loading="eager"` and `fetchpriority="high"` since they are above the fold.

---

## 7. Deployment Strategy

### Platform: Cloudflare Pages

**Rationale:**
- Free tier is generous (unlimited sites, unlimited bandwidth, 500 builds/month)
- Global CDN with edge caching — fast for Gulf Coast FL target audience and everywhere else
- Automatic HTTPS with custom domain
- Preview deployments per git branch — enables stakeholder review before merge
- No vendor lock-in — Astro builds to static HTML/CSS/JS that works on any static host
- If Mailchimp is chosen over Kit, Cloudflare Workers (same platform) can serve as the API proxy for form submissions

**Build configuration:**

```
Build command:    astro build
Build output:     dist/
Node version:     20.x
```

**Deployment flow:**

```
git push to main → Cloudflare Pages build trigger → astro build → Deploy to CDN
git push to branch → Preview deployment at {branch}.{project}.pages.dev
```

**Custom domain:** `tomatowarning.com` — DNS pointed to Cloudflare (likely already on Cloudflare given the existing serverless mail handler in the repo).

**Environment variables:**

```
PUBLIC_PLAUSIBLE_DOMAIN=tomatowarning.com
PUBLIC_EMAIL_FORM_ENDPOINT=<kit-or-mailchimp-endpoint>
PUBLIC_CONSUMER_LIST_ID=<list-id>
PUBLIC_RETAILER_LIST_ID=<list-id>
PUBLIC_NONPROFIT_LIST_ID=<list-id>
```

All variables are `PUBLIC_` prefixed (Astro convention for client-accessible env vars). No secrets are needed on the client — if Mailchimp requires an API key, the Cloudflare Worker proxy holds it as a Worker secret.

### Optional: Cloudflare Worker for form proxy

Only needed if the email platform requires a server-side API key (Mailchimp). Not needed for Kit.

```
Worker route: /api/subscribe
Method: POST
Body: { email, listId, fields, sourceContext }
Response: { success: true } or { error: "message" }
```

The worker validates the request, forwards to the email platform API with the secret key, and returns the result. This is a single, simple function — not a full backend.

---

## 8. SEO Strategy

### Meta tags (per page)

Every page gets unique meta tags via the `SEOHead.astro` component:

```html
<title>{pageTitle} | Tomato Warning</title>
<meta name="description" content="{pageDescription}" />
<link rel="canonical" href="https://tomatowarning.com{path}" />

<!-- Open Graph -->
<meta property="og:title" content="{pageTitle}" />
<meta property="og:description" content="{pageDescription}" />
<meta property="og:image" content="{ogImage}" />
<meta property="og:url" content="https://tomatowarning.com{path}" />
<meta property="og:type" content="website" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{pageTitle}" />
<meta name="twitter:description" content="{pageDescription}" />
<meta name="twitter:image" content="{ogImage}" />
```

### Structured data

**Product pages:** Schema.org `Product` type (Story NFR: "Product pages must include structured data"):

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Tomato Warning EF-3 Squall Line",
  "description": "Habanero-forward with tropical mango counter. 5,000-25,000 SHU.",
  "brand": {
    "@type": "Brand",
    "name": "Tomato Warning"
  },
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/PreOrder"
  }
}
```

**Organization (site-wide):** Schema.org `Organization` in the homepage:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Tomato Warning",
  "url": "https://tomatowarning.com",
  "logo": "https://tomatowarning.com/images/logo.svg",
  "description": "Premium salsa rated on the EF scale. From the storm that named us."
}
```

### Sitemap and robots.txt

**Sitemap:** Generated automatically by `@astrojs/sitemap` integration. Outputs `sitemap-index.xml` at build time.

**robots.txt:**

```
User-agent: *
Allow: /
Sitemap: https://tomatowarning.com/sitemap-index.xml
```

**Pre-launch noindex:** During staging, `BaseLayout.astro` conditionally renders `<meta name="robots" content="noindex, nofollow">` based on an environment variable (`PUBLIC_NOINDEX=true`). This is removed for production launch.

### Page-specific SEO notes

| Page | Title Pattern | Structured Data |
|------|---------------|-----------------|
| Homepage | "Tomato Warning — Premium Salsa \| Chase the Storm" | Organization |
| Product pages | "EF-{n} {Name} \| Tomato Warning" | Product |
| Mission | "Our Mission \| Tomato Warning" | — |
| Retailers | "Stock the Storm \| Tomato Warning" | — |
| Fundraisers | "Fundraise for Recovery \| Tomato Warning" | — |
| Press | "Press \| Tomato Warning" | — |
| Privacy | "Privacy Policy \| Tomato Warning" | — |

---

## 9. Accessibility Strategy (WCAG 2.1 AA)

### Structural

- **Skip navigation link:** `SkipNav.astro` renders a visually-hidden-until-focused link to `#main-content` at the top of every page.
- **Semantic HTML:** `<header>`, `<nav>`, `<main>`, `<article>`, `<footer>` elements used throughout. No `<div>` soup.
- **Heading hierarchy:** Enforced per page — one `<h1>`, followed by `<h2>`, `<h3>` in order. No skipped levels.
- **Landmark regions:** All major sections are identifiable by assistive technology.

### Forms

- **Labels:** Every form input has an associated `<label>` element (not just placeholder text).
- **Error messages:** Inline errors use `aria-describedby` linking the error text to the input field. Errors are announced by screen readers via `aria-live="polite"`.
- **Focus management:** On form submission error, focus moves to the first field with an error. On success, focus moves to the success message.
- **Keyboard navigation:** All form fields and buttons are keyboard-accessible. Tab order follows visual order.

### Visual

- **Color contrast:** All text meets WCAG AA minimum contrast ratios (4.5:1 for normal text, 3:1 for large text). The EF gradient colors are checked against the background they appear on.
- **EF-scale bar:** Color is not the only differentiator — each level has a text label ("EF-1", "EF-2", etc.) per Story 10 AC.
- **Focus indicators:** All interactive elements have visible focus outlines (not removed via `outline: none`).

### Images

- **Alt text:** All images have descriptive alt text. Jar renders include the product name and heat level in the alt text (stored in product data JSON).
- **Decorative images:** Background textures (radar, isobar patterns) use `role="presentation"` or empty `alt=""`.

---

## 10. Performance Budget

Target: Lighthouse 85+ on mobile (Story NFR).

| Metric | Budget | Strategy |
|--------|--------|----------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Hero jar images use `fetchpriority="high"` and `loading="eager"`. Preconnect to image CDN. |
| **FID** (First Input Delay) | < 100ms | Minimal JS — only Preact islands for forms, hydrated on `client:visible`. |
| **CLS** (Cumulative Layout Shift) | < 0.1 | All images have explicit width/height. No layout-shifting font loads (use `font-display: swap`). |
| **Total JS** | < 50KB (compressed) | Astro ships zero JS by default. Preact island adds ~3KB. Form logic adds ~10-15KB per form. Only the forms on the current page are loaded. |
| **Total CSS** | < 30KB (compressed) | Tailwind purges unused CSS at build time. |
| **Total page weight** | < 500KB (excluding jar renders) | Jar renders served as responsive WebP with aggressive sizing. |

---

## 11. Project Structure Summary

```
tomatowarning.com/
├── astro.config.mjs             # Astro config: integrations, site URL, image settings
├── tailwind.config.mjs          # Tailwind theme: brand colors, fonts, breakpoints
├── package.json
├── tsconfig.json
├── public/
│   ├── robots.txt
│   ├── favicon.svg
│   ├── favicon.ico
│   ├── apple-touch-icon.png
│   └── images/
│       ├── og-default.jpg
│       └── press/
│           ├── brand-kit.zip
│           └── fact-sheet.pdf
├── src/
│   ├── assets/
│   │   └── images/
│   │       ├── products/          # Source jar renders (processed at build)
│   │       ├── brand/             # Logo, vortex mark (SVG)
│   │       └── hero/              # Hero section assets
│   ├── config/
│   │   ├── site.ts                # Site-wide constants
│   │   ├── forms.ts               # Form configurations (list IDs, fields)
│   │   └── analytics.ts           # Analytics event names
│   ├── content/
│   │   ├── config.ts              # Content Collection schemas
│   │   ├── products/              # 5 product JSON files
│   │   └── pages/                 # Markdown content for mission, privacy
│   ├── components/
│   │   ├── layout/                # Header, Footer, MobileNav
│   │   ├── hero/                  # HeroSection, EFScaleBar, JarImage
│   │   ├── product/               # ProductCard, ProductHero, ProductDetails
│   │   ├── forms/                 # All form components (Preact islands)
│   │   ├── common/                # SEOHead, SkipNav, CTAButton, PrivacyLink
│   │   └── press/                 # AssetDownload, PressInquiryForm
│   ├── layouts/
│   │   ├── BaseLayout.astro       # HTML shell
│   │   ├── PageLayout.astro       # Header + Footer wrapper
│   │   └── ProductLayout.astro    # Product page wrapper
│   ├── pages/
│   │   ├── index.astro
│   │   ├── mission.astro
│   │   ├── retailers.astro
│   │   ├── fundraisers.astro
│   │   ├── press.astro
│   │   ├── privacy.astro
│   │   └── products/
│   │       ├── index.astro
│   │       └── [slug].astro
│   └── styles/
│       └── global.css             # Tailwind imports + any global custom styles
└── docs/                          # Existing docs directory (not part of site build)
```

---

## 12. Story-to-Architecture Mapping

| Story | Architecture Components | Notes |
|-------|------------------------|-------|
| **S1: Email Platform** | `config/forms.ts`, email platform account setup | Infrastructure setup, not a code deliverable within the site build |
| **S2: Signup Forms** | `forms/ConsumerSignupForm.tsx`, `RetailerSignupForm.tsx`, `NonprofitSignupForm.tsx`, `FooterSignupForm.tsx` | 4 Preact island components. Footer form is in `Footer.astro`. |
| **S3: Analytics** | `BaseLayout.astro` (script tag), analytics event calls in all form components | Plausible script loads site-wide. Events fire from form success handlers. |
| **S5: Mission Page** | `pages/mission.astro`, `content/pages/mission.md` | Content in markdown. Blocked by charity partner (P1-02). |
| **S6: Nonprofit CTA** | `pages/fundraisers.astro`, `forms/NonprofitSignupForm.tsx` | Form has 5+ fields. Requires email platform (S1). |
| **S7: Retailer CTA** | `pages/retailers.astro`, `forms/RetailerSignupForm.tsx`, `press/AssetDownload.astro` | PDF download conditionally visible (AC 5a/5b). |
| **S8: Product Template** | `pages/products/[slug].astro`, `ProductLayout.astro`, `product/*` components | Dynamic route generates 5 pages from Content Collection. |
| **S9: Product Content** | `content/products/*.json` | Populate 5 JSON files with brand-approved content. |
| **S10: Hero Section** | `hero/*` components, `pages/index.astro` | EF-scale bar is the most visually complex component. |
| **S11: Press Page** | `pages/press.astro`, `press/*` components | Simplest page. Asset downloads from `/public/images/press/`. |
| **S12: Privacy Policy** | `pages/privacy.astro`, `content/pages/privacy.md` | Content in markdown. Must be live before any form goes live. |

---

## 13. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Jar renders (P1-15) not ready at build time | Medium | High — blocks hero and product pages | Build with placeholder system (clearly labeled, not broken images). Use `status: "draft"` in product JSON to hide unready pages. |
| Email platform API changes or rate limits | Low | Medium — forms stop working | Abstract platform-specific API calls behind a submission service interface. Easy to swap implementations. |
| Plausible blocked by ad blockers | Medium | Low — expected data loss ~15-25% | Document expected data loss. For critical signup tracking, the email platform's own subscriber count serves as the source of truth (not analytics). |
| Content not finalized (names, copy, charity partner) | High | Medium — delays launch | Architecture supports `draft` status on all content. Site can launch incrementally as content is approved. Privacy page and at least one product page can launch first. |
| Mobile performance below 85 Lighthouse | Low | Medium | Astro + zero JS by default makes this unlikely. Image optimization is built-in. Run Lighthouse CI on every preview deployment to catch regressions early. |

---

## 14. Open Questions for Implementation

1. **Email platform final choice:** Kit (ConvertKit) vs. Mailchimp. Recommendation: Kit for simpler integration (no server proxy needed). This is a P1-12 decision.
2. **Press inquiry form routing:** Does the press form submit to the email platform, or send a simple email notification? Story 11 notes say "simple email notification is sufficient." If so, a Cloudflare Worker or a mailto: link may suffice.
3. **Product index page behavior:** Does `/products/` show a grid of all 5 varieties, or redirect to the homepage hero section? Recommendation: grid page with all 5 product cards, linking to individual pages.
4. **Font licensing:** Display typography (bold condensed sans or slab per visual identity ideas) needs to be web-licensed. Google Fonts, Adobe Fonts, or self-hosted? Recommendation: self-hosted for performance (no third-party blocking request).
5. **Pre-launch staging strategy:** How long is the site in a `noindex` staging state before public launch? Coordinate with content readiness.
