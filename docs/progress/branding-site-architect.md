---
type: progress-checkpoint
role: architect
feature: "Tomato Warning Phase 1 Branding Site"
status: complete
created: "2026-02-26"
updated: "2026-02-26"
---

# Progress: Branding Site Architect

## Status: Complete

## Deliverable

**docs/architecture/branding-site-system-design.md** — Full system design covering all 8 design areas.

## Key Decisions

### Tech Stack: Astro + Tailwind + Preact islands
- Astro chosen over Next.js (overkill), Eleventy (underpowered), Hugo (wrong paradigm)
- Zero JS by default makes Lighthouse 85+ achievable without effort
- Content Collections provide type-safe product data model
- Preact islands (~3KB) used only for interactive forms
- Tailwind CSS for utility-first, mobile-first styling

### Email Integration: API-based, not embedded iframes
- Custom-styled forms submit directly to email platform API
- Kit (ConvertKit) recommended over Mailchimp — no server proxy needed
- Mailchimp option requires a single Cloudflare Worker as API proxy
- Footer combined form uses dropdown to route to correct list

### Analytics: Plausible
- Privacy-respecting (no cookies, no consent banner needed)
- < 1KB script, custom events for conversion tracking
- UTM tracking built-in
- Addresses ad-blocker edge case from Story 3

### Content Model: File-based (JSON + Markdown)
- 5 product JSON files with schema validation via Content Collections
- Mission and privacy pages as markdown
- No CMS — version-controlled content in git
- `status: "draft"` field supports incremental content readiness

### Deployment: Cloudflare Pages
- Free tier, global CDN, preview deployments
- No vendor lock-in (pure static output)
- Workers available if Mailchimp API proxy is needed

### Image Strategy: Build-time optimization
- Astro `<Image>` component generates WebP/AVIF at build
- Responsive srcset for jar renders (320w-1280w)
- Hero images eager-loaded, below-fold images lazy-loaded
- Press assets served directly from /public (not processed)

## Architecture Highlights

- 11 pages, 3 layouts (Base → Page → Product), ~20 components
- 4 form variants as Preact islands with `client:visible` hydration
- Product pages generated from a single `[slug].astro` dynamic route
- Schema.org Product structured data on product pages
- Performance budget: < 50KB JS, < 30KB CSS, < 500KB page weight (excluding images)
- WCAG 2.1 AA: skip nav, semantic HTML, form labels, aria attributes, color + text for EF levels

## Story Coverage

All 11 active stories (S1-S3, S5-S12) mapped to specific architecture components. Every acceptance criterion is addressable by the design.

## Open Questions (for implementation team)

1. Kit vs. Mailchimp — final email platform choice (P1-12 decision)
2. Press inquiry form — email platform or simple notification?
3. Product index page — grid or redirect to homepage?
4. Font licensing and hosting strategy
5. Pre-launch staging timeline and noindex duration
