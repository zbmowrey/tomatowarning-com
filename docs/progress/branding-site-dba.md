---
type: progress
role: data-architect
feature: "Tomato Warning Phase 1 Branding Site"
status: complete
created: "2026-02-26"
updated: "2026-02-26"
---

# Data Architect — Progress Checkpoint

## Status: Complete

## Deliverable

`docs/architecture/branding-site-data-model.md` — Full data model with 10 sections covering all schemas for the Phase 1 branding site.

## What Was Designed

### Sections Delivered

1. **Product Content Schema** — Frontmatter schema for 5 EF-level varieties with all fields (id, name, ef_level, slug, scoville range, flavor headline, heat descriptor, key ingredients, jar render image, color accent, SEO metadata, status). Full YAML examples for all 5 products.

2. **Page Content Schema** — Frontmatter schemas for Mission, Hero (component), Press, and Privacy pages. Each includes page-specific fields (e.g., charity partner fields on Mission, noindex on Press for pre-launch staging).

3. **Email List Schemas** — Field definitions for all 3 lists:
   - Consumer "Notify Me": email, product_interests[], signup_source, zip_code (optional), UTM fields
   - Retailer "Stock the Storm": email, name, store_name, location, role (dropdown with Other), message
   - Nonprofit "Fundraise for Recovery": email, contact_name, org_name, org_type (dropdown with Other), location, campaign_size

4. **Form Validation Rules** — Per-field validation for 5 form types (Consumer, Retailer, Nonprofit, Footer Combined, Press Inquiry) with error messages. Common rules for all forms (email validation, mobile keyboard, already-subscribed handling, JS-disabled fallback, privacy link, double-submit prevention).

5. **Analytics Event Schema** — 4 event types (pageview, consumer_signup, retailer_signup, nonprofit_signup) with properties. UTM parameter schema with lowercase enforcement and naming conventions.

6. **Third-Party Data Flow** — Form submission flow (client validation -> API -> response handling -> analytics event). Footer routing logic. Analytics event flow. Press inquiry flow (separate from email platform). Ad blocker mitigation strategy. Send limit handling.

7. **Content File Structure** — Full directory layout for /content/, /data/, /static/. File naming conventions. Draft/published build behavior.

8. **Structured Data (SEO)** — schema.org Product JSON-LD template for product pages with PreOrder availability.

9. **EF Color System Reference** — Hex values for all 5 EF levels plus base brand palette.

10. **Cross-Reference Table** — Maps every story (1-12) to its relevant schema sections.

## Key Design Decisions

1. **Content as code** — All content is markdown frontmatter + YAML data files, source-controlled. No CMS dependency for Phase 1.

2. **Draft/published gate** — Every content entity has a `status` field. Draft content is excluded from production builds. Mission page has an additional hard gate: cannot publish while `charity_partner_name` is empty.

3. **Product schema is config-driven** — Product names and content can be updated by editing frontmatter without code changes (addresses Story 8 edge case about name changes).

4. **Three separate lists with cross-list allowed** — Same email can exist on multiple lists. No cross-list deduplication.

5. **Footer form routes by dropdown** — The combined footer form uses an `audience_type` dropdown to route to the correct list and fire the correct analytics event.

6. **Analytics events fire only on confirmed success** — Prevents double-counting. Session flags prevent re-fire on page refresh.

7. **Server-side event tracking recommended for conversions** — Client-side analytics may be blocked by ad blockers. Server-side fallback ensures KPI-critical conversion events are never lost.

8. **Press inquiry form is separate from email platform** — Simple email notification, not a list subscription.

9. **UTM values normalized to lowercase on capture** — Prevents case-sensitive fragmentation in analytics reporting.

10. **"Other" option on all enum dropdowns** — Retailer role and nonprofit org_type dropdowns include "Other" with free-text follow-up field, preventing data loss from uncategorized entries.

## Dependencies Identified

- Product jar render images (P1-15) must exist before product `status` can be set to `published`
- Charity partner name (P1-02) must be filled before Mission page can publish
- Email platform choice (P1-06/P1-12) determines API format for form submissions
- Analytics platform choice (P1-06/P1-16) determines event tracking implementation
- Visual identity (P1-07) confirms EF color hex values used throughout

## Open Questions for Implementation Team

- Which email marketing platform? Schema is platform-agnostic but API integration depends on the choice.
- Which analytics platform? Plausible or Fathom recommended for privacy-respecting tracking.
- Will forms use platform-provided JS snippets or custom API integration? Custom is preferred for visual consistency (Story 2 implementation notes).
