---
type: plan-review
feature: "Tomato Warning Phase 1 Branding Site"
status: complete
created: "2026-02-26"
author: plan-skeptic
reviewed_document: docs/progress/branding-site-impl-architect.md
source_spec: docs/specs/branding-site/spec.md
source_stories: docs/specs/branding-site/stories.md
source_system_design: docs/architecture/branding-site-system-design.md
source_data_model: docs/architecture/branding-site-data-model.md
---

# PLAN REVIEW: Tomato Warning Phase 1 Branding Site

**Verdict: APPROVED** (with non-blocking issues to address)

---

## Review Summary

The implementation plan is thorough, well-structured, and closely aligned with the spec, stories, system design, and data model. All 11 active stories are accounted for with file-level traceability. The phase ordering is correct — no forward dependencies detected. Interface definitions are complete and match the spec. The test strategy covers the right areas. The 5 identified ambiguities are all reasonable and properly flagged.

This plan is ready for implementation. The non-blocking issues below should be addressed during implementation but do not warrant a rejection.

---

## Spec Coverage Analysis

### Stories (11 active): ALL COVERED

| Story | Covered? | Plan References |
|-------|----------|----------------|
| S1 (Email Platform) | Yes | P1-03, P3-01 |
| S2 (Signup Forms) | Yes | P3-04 through P3-12 |
| S3 (Analytics) | Yes | P1-04, P3-02, form event handlers |
| S5 (Mission Page) | Yes | P2-07, P2-15 |
| S6 (Nonprofit CTA) | Yes | P3-09, P5-03 |
| S7 (Retailer CTA) | Yes | P3-08, P5-02 |
| S8 (Product Template) | Yes | P1-15, P2-08 through P2-12 |
| S9 (Content Population) | Yes | P2-01 through P2-05 |
| S10 (Hero Section) | Yes | P4-01 through P4-03 |
| S11 (Press Page) | Yes | P3-11, P5-01, P5-04 |
| S12 (Privacy Policy) | Yes | P1-09, P2-06, P2-14 |

### 9 Resolved Design Decisions: ALL INCORPORATED

1. Full slug format: Zod regex `^ef-[1-5]-.+$` enforces it. Correct.
2. JSON for products: `type: "data"` collection. Correct.
3. camelCase fields: All TypeScript interfaces and JSON schemas use camelCase. Correct.
4. `jarImageAlt` required: In Zod schema as `z.string()` (required). Correct.
5. `efColor` naming: Used throughout. Correct.
6. No analytics on already-subscribed: Explicitly documented in P3-07 through P3-10. Correct.
7. Consumer `zipCode` optional: `ConsumerSignupFormProps.showZipCode` controls visibility. Correct.
8. Press inquiry via CF Worker or mailto: P3-11 documents both options. Correct.
9. Retailer PDF conditional: P5-02 documents conditional rendering logic. Correct.

### Non-Functional Requirements: ALL ADDRESSED

- Lighthouse 85+: Phase 6 (P6-02) verification + performance budget in test strategy.
- WCAG 2.1 AA: Phase 6 (P6-01) accessibility audit. SkipNav, labels, ARIA attributes, focus management all planned.
- SEO: SEOHead component, structured data on product pages, Organization on homepage, sitemap, robots.txt, canonical URLs, noindex config.
- Mobile-first: Responsive implementations documented per component. 375px explicitly called out.

---

## Interface Completeness

### Product Type: MATCHES SPEC

The Zod schema in the plan matches the spec's Product interface field-for-field:
- All 14 fields present with correct types
- `efLevel` typed as `1 | 2 | 3 | 4 | 5`
- `keyIngredients` as `z.tuple([z.string(), z.string()])`
- `metaDescription` capped at 160 chars
- `efColor` validated as hex with regex
- `status` enum with draft default

### Form Types: COMPLETE

- `FormConfig` covers list routing, endpoints, success/already-subscribed messages.
- `SignupFormProps` includes `sourceContext` for analytics.
- `ConsumerSignupFormProps` extends with `showZipCode`.
- `FormFieldProps` covers all field types (text, email, select, textarea) with ARIA support.
- `EmailSubmissionPayload` includes UTM params and signup source.
- `PressInquiryPayload` is separate (correct per resolved decision #8).

### Analytics Types: COMPLETE

- `AnalyticsEventName` union covers all 3 events.
- `ConversionEventProps` includes `source_page` (required) and `product_variety` (optional).
- `FireConversionEvent` function signature is type-safe.

### Submission Types: COMPLETE

- `SubmissionStatus` covers all states: idle, submitting, success, already_subscribed, error.
- `SubmissionResult` provides status + message.

---

## Dependency Correctness

### Phase ordering: CORRECT

- Phase 0 (scaffolding) has no dependencies.
- Phase 1 (foundation) depends only on Phase 0.
- Phase 2 (content/pages) depends on Phase 1 (layouts, content config).
- Phase 3 (forms) depends on Phase 1 configs. Does NOT depend on Phase 2 pages being built first — forms are wired in P3-12 which depends on both P2 and P3 components. Correct.
- Phase 4 (hero/homepage) depends on Phase 2 (product data for EF scale bar) and Phase 3 (consumer form for homepage). Correct.
- Phase 5 (CTA pages) depends on Phase 3 (forms). Correct.
- Phase 6 (polish) depends on all above. Correct.

### No backward dependencies detected.

Each phase is deployable as stated in the plan. The dependency graph in section 4 is internally consistent.

---

## Test Strategy Adequacy

### Form validation: ADEQUATE
- Email, required, zip code, max length all covered in unit tests.
- Integration tests cover full submission flow per form type.
- Conditional field rendering tested (role "Other", orgType "Other").
- Footer form routing tested per audience type.

### Analytics: ADEQUATE
- `fireConversionEvent` unit tested for correct args and graceful no-op.
- Integration tests verify events fire on success and do NOT fire on already-subscribed.

### Already-subscribed: EXPLICITLY TESTED
- Integration test section confirms: "Verify 'already on the list' message on duplicate (no event fired)."

### Accessibility: ADEQUATE
- Automated axe-core on all 11 pages.
- Manual checklist covers skip-nav, labels, ARIA, focus management, color contrast, keyboard navigation.
- Screen reader testing specified (VoiceOver).

### Performance: ADEQUATE
- Lighthouse CI on all 11 pages.
- Specific metric assertions: LCP < 2.5s, FID < 100ms, CLS < 0.1.
- Mobile emulation specified.

---

## Scope Creep Analysis

### Unnecessary additions: NONE DETECTED

The plan includes exactly the files needed. No extra abstractions, no unnecessary utilities, no over-engineering. The `lib/` directory has 3 focused utility files (submit, analytics, validation) — each justified by reuse across multiple form components.

The `ProductCard` component and `products/index.astro` page are not explicitly required by any story, but the spec's open question #2 recommends a product grid page, and the system design includes it. This is acceptable scope.

---

## Ambiguities Assessment

### Architect's 5 ambiguities: ALL REASONABLE

1. **Tailwind v4 + Astro:** Valid concern. The fallback to v3 is sensible. Does not block implementation — the implementer can resolve this during P0-01/P0-02.

2. **Press inquiry delivery:** Valid. The plan correctly defers this decision while documenting both paths. Does not block until Phase 3 (P3-11).

3. **Mission page frontmatter approach:** Valid. The plan's approach (validate mission-specific fields in the page component at build time) is correct for Astro content collections with `type: "content"`.

4. **Hero data source:** Valid. The plan's recommendation (hardcode in component or config rather than adding `hero.yaml`) is a good simplification. The data model's `hero.yaml` is unnecessary complexity for content that changes with code.

5. **Font selection:** Valid. System fonts first, brand font swap later. Standard approach.

### Additional ambiguities the architect missed: NONE BLOCKING

The architect covered the key ones. One minor observation: the plan does not specify which Astro image import strategy to use — Astro 5.x supports both `import`-based (from `src/assets/`) and path-based (from `public/`) images. The plan references both `src/assets/images/` for build-time processing and paths like `/images/products/` in JSON data. The implementer will need to reconcile this (likely by importing images in components and using the `jarImage` field as a key rather than a direct path). This is a standard Astro implementation detail, not a blocking ambiguity.

---

## Non-Blocking Issues

### 1. Mission page schema could be more explicit in content/config.ts

The plan's `pages` collection schema in `content/config.ts` only defines base fields (title, seoTitle, seoDescription, status, lastUpdated, noIndex). The mission-specific fields (charityPartnerName, givingPercentage, donationTotalToDate, donationReportingCommitment, charityFundUsage) from the data model are mentioned in P2-07 but not shown in the Zod schema.

**Suggestion:** Either add these as optional fields to the pages schema (with a discriminated union or loose typing) or document that mission-specific fields are validated in `mission.astro` at build time rather than at the schema level. The plan mentions this in ambiguity #3 but the implementer needs clear guidance on which approach to take.

### 2. Press page content model approach not fully specified

Similar to the mission page, the press page has additional frontmatter fields (brandOverview, founderName, foundingYear, founderNarrative, pressContactEmail, assetBundleUrl, factSheetPdfUrl) from the data model. These are not shown in the pages collection schema.

**Suggestion:** Same resolution as issue #1 — either extend the schema or document the page-level validation approach.

### 3. Image path in product JSON vs. Astro Image import

Product JSON files reference `jarImage` as a string path (e.g., `"/images/products/ef-3-squall-line.webp"`). However, Astro's `<Image>` component works best with imported image references (from `src/assets/`) for build-time optimization. A string path pointing to `public/` would bypass Astro's image pipeline.

**Suggestion:** During implementation, use Astro's Content Collection `image()` helper in the Zod schema for `jarImage`, or resolve the import in the page component. The implementer should be aware that the current string-based approach may not trigger Astro's image optimization.

### 4. `tailwind.config.mjs` listed in system design but not in implementation plan

The spec and system design reference a `tailwind.config.mjs` file for brand colors, fonts, and breakpoints. The implementation plan does not include this file explicitly (it's implied by P0-02 and P1-01). Tailwind v4 uses CSS-based configuration instead of a JS config file, which may eliminate the need for it.

**Suggestion:** Clarify during Phase 0 whether Tailwind v4's CSS-based config fully replaces `tailwind.config.mjs` or if a config file is still needed.

### 5. No explicit `wrangler.toml` or CF Worker file for press inquiry

The plan defers `wrangler.toml` (P0-08) as conditional on email platform choice, but resolved decision #8 says press inquiry uses "Cloudflare Worker or mailto" regardless of email platform choice. If a CF Worker is used for press inquiry, `wrangler.toml` and a Worker function file are needed.

**Suggestion:** Add a note to P3-11 that if the CF Worker approach is chosen for press inquiry, a Worker file (e.g., `functions/api/press-inquiry.ts` for CF Pages Functions) should be created in Phase 3.

---

## Notes

- The plan is well-organized with clear phase boundaries that allow incremental deployment.
- Story traceability is excellent — the traceability matrix in section 8 maps every story to specific files and phases.
- The 63-file count is reasonable for this scope. No bloat detected.
- The dependency graph is detailed and correct. Cross-phase dependencies all point forward.
- The test strategy distinguishes appropriately between unit, integration, accessibility, performance, and E2E testing with sensible tool choices.
- The separation of `lib/submit.ts` as the only email-platform-aware file is a good abstraction boundary that supports the spec's requirement to abstract API calls for potential platform swaps.
