---
agent: frontend-eng
feature: branding-site
updated: "2026-02-26"
---

# Frontend Engineer Progress: Branding Site Phase 1

## Task #4 — Define Island Props Contract [COMPLETE]

- Wrote `docs/specs/branding-site/island-props-contract.md`
- Proposed props for all 5 form islands: ConsumerSignupForm, RetailerSignupForm, NonprofitSignupForm, FooterSignupForm, PressInquiryForm
- Defined lib utility interfaces: submit.ts, analytics.ts, validation.ts
- Defined FormField, FormSuccess, FormError internal component props
- Included usage examples for Astro page authors (backend-eng)
- Received and incorporated backend-eng review (flat props, noscriptFallbackUrl, CF Worker, forms.ts shape)
- Received quality-skeptic REJECTION with 6 blocking + 5 non-blocking issues; fixed all in revision 3
- Contract approved by quality-skeptic (revision 3)

## Task #5 — Phase 3: Interactive Islands [COMPLETE]

All lib utilities and form islands implemented with full TDD. 125/125 tests passing.

### Lib Utilities

| File | Tests | Status |
|---|---|---|
| `src/lib/validation.ts` | 32 | PASS |
| `src/lib/analytics.ts` | 11 | PASS |
| `src/lib/submit.ts` | 10 | PASS |

### Form Infrastructure

| File | Tests | Status |
|---|---|---|
| `src/components/forms/FormField.tsx` | 15 | PASS |
| `src/components/forms/FormSuccess.tsx` | 4 | PASS |
| `src/components/forms/FormError.tsx` | 5 | PASS |

### Form Islands

| File | Tests | Status |
|---|---|---|
| `src/components/forms/ConsumerSignupForm.tsx` | 14 | PASS |
| `src/components/forms/RetailerSignupForm.tsx` | 10 | PASS |
| `src/components/forms/NonprofitSignupForm.tsx` | 8 | PASS |
| `src/components/forms/FooterSignupForm.tsx` | 8 | PASS |
| `src/components/forms/PressInquiryForm.tsx` | 8 | PASS |

**Total: 125 tests across 11 test files, all passing.**

### Implementation Notes

- Analytics event names: actual event names are `consumer_signup`, `retailer_signup`, `nonprofit_signup` (matching `analytics.ts` ANALYTICS_EVENTS constants). Test files were written with wrong `form_submit_*` names and corrected.
- Analytics event names use string literals directly in components — importing `ANALYTICS_EVENTS` from config caused `undefined` in jsdom test env due to `import.meta.env` in that file.
- Form endpoint read from `import.meta.env.PUBLIC_EMAILFAN_ENDPOINT` in `submit.ts`
- `formConfigs` used as record access (`formConfigs['consumer']`) not named exports
- `product_variety` omitted entirely (not `undefined`) from analytics props for non-product-page signups
- `fireConversionEvent` called only on `'success'` status, never on `'already_subscribed'` or `'error'`
- FormField ARIA: `aria-invalid` + `aria-describedby="${name}-error"` when error present; `aria-required="true"` when required
- PressInquiryForm renders mailto fallback link (not a form) when `submitEndpoint` is omitted

## Task #6 — Wire Forms into Pages + Phase 4 Hero + Phase 5 CTA Pages [COMPLETE]

All pages wired with `client:visible` islands and `FooterSignupForm` in footer slot.

| Page | Consumer Form | Footer Form |
|---|---|---|
| `src/pages/index.astro` | yes (homepage signup section) | yes |
| `src/pages/products/[slug].astro` | yes (with `sourceContext=product.slug`) | yes |
| `src/pages/retailers.astro` | — | yes |
| `src/pages/fundraisers.astro` | — | yes |
| `src/pages/press.astro` | — | yes |

CTA page forms (also `client:visible`):
- `retailers.astro` — `RetailerSignupForm` with `sourceContext="retailers"`
- `fundraisers.astro` — `NonprofitSignupForm` with `sourceContext="fundraisers"`
- `press.astro` — `PressInquiryForm` with `pressWorkerEndpoint || undefined` (mailto fallback)

Hero section and CTA pages were built by backend-eng. Frontend-eng added `FooterSignupForm` to all pages.

Note: race condition with backend-eng concurrent file writes observed. Multiple write attempts required to ensure `FooterSignupForm` additions persisted.

## Key Decisions Locked

1. Flat props on all form islands (not FormConfig wrapper)
2. `noscriptFallbackUrl: string` required on all 4 email signup islands
3. PressInquiryForm: `submitEndpoint?: string` + `fallbackMailto: string` (two explicit UX paths)
4. Single FORM_ENDPOINT for all lists; listId differentiates them
5. already_subscribed: HTTP 200 + response body field (configurable parser in submit.ts)
6. `product_variety` omitted entirely (not undefined/empty) for non-product-page consumer signups
7. FormField ARIA: `aria-invalid` + `aria-describedby` when error; `aria-required` when required; ID convention `${name}-error`
