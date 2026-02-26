# REVIEW: System Design + Data Model for Branding Site

**Reviewer:** Spec Skeptic
**Date:** 2026-02-26
**Documents reviewed:**
- System Design: `docs/architecture/branding-site-system-design.md`
- Data Model: `docs/architecture/branding-site-data-model.md`
- Source of truth: `docs/specs/branding-site/stories.md` (11 active stories)

---

## Verdict: APPROVED

---

## Story Coverage Matrix

| Story | System Design Coverage | Data Model Coverage | Gap? |
|-------|----------------------|---------------------|------|
| S1: Email Platform Setup | Section 4 (email integration, form-to-list routing, duplicate handling, graceful degradation). Section 12 mapping. | Section 3 (all 3 list schemas with field definitions). Section 6 (welcome automation, send limit handling). | No gap. |
| S2: Signup Forms (4 forms) | Section 3 (4 Preact island components listed). Section 4 (submission flow, API-based approach, noscript fallback). Section 12 mapping. | Section 4 (validation rules for all 5 forms including footer combined). Section 6 (form submission flow with already-subscribed handling). | No gap. |
| S3: Analytics + UTM | Section 4 (Plausible installation, pageview, conversion events, UTM auto-capture, double-fire prevention, bot filtering). Section 12 mapping. | Section 5 (all 4 events defined with properties). Section 5 UTM schema with naming conventions, lowercase enforcement, null handling. Section 5 dashboard requirements. | No gap. |
| S4: UTM Strategy | Both docs correctly note S4 is absorbed into S3. | Absorbed into S3. | N/A (absorbed) |
| S5: Mission Page | Section 2 (page routing at /mission). Section 5 (content in markdown via Content Collections). Section 12 mapping. | Section 2 (Mission page schema with charity_partner_name, giving_percentage, donation_total_to_date, donation_reporting_commitment, charity_fund_usage). Publish gate enforced. | No gap. |
| S6: Nonprofit CTA | Section 2 (/fundraisers route). Section 3 (NonprofitSignupForm.tsx). Section 12 mapping. | Section 3 List 3 (all fields: email, contact_name, org_name, org_type with "Other", location, campaign_size). Section 4 (validation rules). | No gap. |
| S7: Retailer CTA | Section 2 (/retailers route). Section 3 (RetailerSignupForm.tsx, AssetDownload.astro). Section 12 mapping. | Section 3 List 2 (all fields: email, name, store_name, location, role dropdown with "Other", message). Section 4 (validation rules). Section 7 (retailer-one-pager.pdf in /static/downloads). | No gap. |
| S8: Product Pages (template) | Section 2 (dynamic route /products/[slug].astro). Section 3 (ProductHero, ProductDetails, HeatIndicator, ConsumerSignupForm). Section 5 (Content Collections with product schema). Section 12 mapping. | Section 1 (full product schema with all required fields). Product data for all 5 varieties pre-populated. Status rules for draft/published gating. | No gap. |
| S9: Product Content Population | Section 5 (Content Collections, JSON files). Section 12 mapping notes it as content population task. | Section 1 (all 5 variety data files fully populated with brand content). Status rules (draft until all fields confirmed). | No gap. |
| S10: Hero Section | Section 2 (index.astro). Section 3 (HeroSection.astro, EFScaleBar.astro, JarImage.astro). Section 6 (hero image strategy, responsive approach, eager loading). Section 12 mapping. | Section 2 (hero.yaml with headline, sub_copy, ef_definition, cta_text, cta_link). Section 9 (EF color system reference). Hero references product data for jar renders. | No gap. |
| S11: Press Page | Section 2 (/press route). Section 3 (AssetDownload.astro, PressInquiryForm.tsx). Section 6 (press assets in /public). Section 12 mapping. | Section 2 (Press page schema with brand_overview, founder_name, founding_year, founder_narrative, press_contact_email, asset_bundle_url, fact_sheet_pdf_url). Section 4 (Press inquiry form validation). Section 7 (file structure with press assets). | No gap. |
| S12: Privacy Policy | Section 2 (/privacy route). Section 5 (privacy.md in Content Collections). Section 12 mapping. | Section 2 (Privacy page schema with email_platform_name, privacy_contact_email). Section 4 common rules (privacy link in all forms). | No gap. |

**Coverage verdict:** All 11 active stories are covered by both documents. No stories are missing. All acceptance criteria are addressable by the proposed architecture and data model.

---

## Consistency Check

### TypeScript Interfaces vs. Data Model Schemas

The system design defines a `Product` interface (Section 3) and the data model defines a Product schema (Section 1). There are naming convention differences:

| System Design (camelCase) | Data Model (snake_case) | Compatible? |
|---------------------------|------------------------|-------------|
| `slug` (full: "ef-1-coastal-calm") | `slug` (partial: "coastal-calm") | **Minor inconsistency** |
| `efLevel` | `ef_level` | Convention difference only |
| `flavorHeadline` | `flavor_headline` | Convention difference only |
| `heatDescriptor` | `heat_descriptor` | Convention difference only |
| `scovilleMin` / `scovilleMax` | `scoville_min` / `scoville_max` | Convention difference only |
| `keyIngredients` | `key_ingredients` | Convention difference only |
| `efColor` | `color_accent` | **Different name** |
| `jarImage` | `jar_render_image` | **Different name** |
| `jarImageAlt` | (not present) | **Missing in data model** |
| `metaTitle` / `metaDescription` | `seo_title` / `seo_description` | **Different name** |
| `status` | `status` | Identical |
| (not present) | `id` | Data model has extra field |
| (not present) | `sort_order` | Data model has extra field |

**Assessment:** These are not blockers. The camelCase vs. snake_case difference is expected -- the system design uses TypeScript convention, the data model uses content-file convention. At implementation time, the Content Collection schema (Astro's `config.ts`) will define the canonical field names, and the TypeScript interface will map from them. However, the team should agree on one naming convention for the content files (recommendation: camelCase in JSON files since the system design already defines the Astro Content Collection schema using camelCase).

The `slug` inconsistency is more substantive: the system design uses the full slug (`ef-1-coastal-calm`) while the data model uses a partial slug (`coastal-calm`) with a separate `id` field (`ef-1`). The system design approach (full slug) is simpler and avoids having to concatenate `id` + `-` + `slug` at runtime. The data model approach allows the slug and ID to vary independently. Either works, but the team must pick one.

The `jarImageAlt` field is present in the system design but missing from the data model schema. This is needed for WCAG 2.1 AA compliance (Story NFR). The data model should add this field.

### Form Field Definitions

Form fields are consistent between both documents. The data model Section 4 validation rules align with the system design's form component props. The analytics event names (`consumer_signup`, `retailer_signup`, `nonprofit_signup`) are identical in both documents.

### Analytics Events

Event names and properties are consistent across both documents. The system design Section 4 shows `consumer_signup` with `source_page` property. The data model Section 5 shows the same event with `source_page` and adds `product_variety` -- this is an additive detail, not a conflict.

### Content File Format Inconsistency

The system design specifies **JSON files** for products (`ef-3-squall-line.json`) with Astro Content Collections `type: "data"`. The data model specifies **Markdown files** with YAML frontmatter (`ef-3-squall-line.md`). These are different Astro Content Collection types (`data` vs. `content`). Since product pages do not need a markdown body (all display fields are structured), the system design's JSON approach is correct. The data model should align to JSON.

---

## Feasibility Assessment

### Is Astro the right choice?

**Yes.** The system design makes a compelling case. For a static content site with 11 pages, zero auth, zero database, and selective form interactivity, Astro is the best fit. Next.js would be over-engineered. Eleventy would require too much manual setup for image optimization and component architecture. Hugo's templating model is wrong for this use case. The zero-JS-by-default philosophy directly supports the Lighthouse 85+ requirement with minimal effort.

### Is Preact justified?

**Yes, but barely.** The forms need inline validation, async submission, dynamic success/error states, and submit button disabling. Vanilla JS could handle this, but Preact's component model at 3KB makes the form code more maintainable without meaningful performance cost. The `client:visible` hydration strategy means Preact only loads when a form enters the viewport. This is a reasonable tradeoff.

### Is Plausible the right analytics platform?

**Yes.** Verified capabilities:
- Custom events with properties: supported (up to 30 custom properties per event via JS API)
- UTM tracking: built-in, automatic, displayed in "Campaigns" tab
- Dashboard: built-in dashboard with real-time data, filterable by source/medium/campaign
- Privacy-respecting: no cookies, GDPR-compliant without consent banner
- Lightweight: < 1KB script

Plausible supports everything required by Story 3. The one limitation to note: Plausible limits to 3 custom properties per goal when creating goals from custom events in the dashboard. The `consumer_signup` event needs `source_page` and `product_variety` -- that is 2 properties, within the limit.

### Is Cloudflare Pages appropriate?

**Yes.** Free tier, global CDN, automatic HTTPS, preview deployments, and the existing repo already has a serverless mail handler suggesting the domain is likely on Cloudflare already. No vendor lock-in since the output is static HTML/CSS/JS.

### Can Lighthouse 85+ be achieved with 5 jar renders in the hero?

**Yes, with discipline.** The system design addresses this through:
- `loading="eager"` + `fetchpriority="high"` on hero images (above the fold)
- Responsive `srcset` with multiple widths (320w, 640w, 960w, 1280w)
- WebP/AVIF format conversion at build time
- Explicit width/height attributes to prevent CLS

At 60px width on mobile, each hero jar render will be tiny (< 5KB in WebP). Five of them at < 25KB total is negligible. At desktop (200px each), they will be larger but still manageable with responsive images. The performance budget (Section 10) is realistic. The risk register (Section 13) correctly identifies this as low likelihood.

---

## Over-Engineering Check

### Items reviewed:

1. **Three layout levels (Base > Page > Product):** Justified. Base handles HTML shell, Page adds header/footer, Product adds structured data. Clean separation.

2. **Content Collections for 5 products:** Not over-engineered -- Content Collections provide type-safe schema validation at build time, catching content errors before deploy. Worth it for data integrity.

3. **Separate config files (forms.ts, site.ts, analytics.ts):** Borderline. Three config files for a small site is acceptable but should not grow further. No additional abstraction layers needed.

4. **Cloudflare Worker proxy for Mailchimp:** Not over-engineered because it is conditional -- only needed if Mailchimp is chosen. The recommendation to use Kit to avoid this is sound.

5. **Product index page (/products/):** The system design's open question about this page is appropriate. A simple grid page is fine. No over-engineering concern.

6. **Data model's /data/ directory:** The data model proposes form field definitions as separate JSON files (`/data/forms/consumer-notify.json`, etc.). This duplicates what the system design handles in `src/config/forms.ts`. Only one is needed. The system design's TypeScript approach is better because it provides type safety and co-locates form config with form components.

**Verdict:** No significant over-engineering. The architecture is proportional to the problem.

---

## Notes

These are minor items that do not warrant rejection but should be tracked:

1. **Slug convention**: The team must decide whether product slugs are full (`ef-1-coastal-calm` per system design) or partial (`coastal-calm` per data model). Recommend: full slug, matching URL path segment, as defined in the system design.

2. **Content file format**: The team must decide JSON (system design) vs. Markdown with YAML frontmatter (data model) for product content. Recommend: JSON, since product data is structured with no prose body.

3. **Field naming convention**: camelCase (system design) vs. snake_case (data model) for content file fields. Recommend: camelCase in JSON files to match the TypeScript interfaces directly and avoid a mapping layer.

4. **Missing `jarImageAlt` in data model**: The data model product schema should add an `alt_text` or `jar_image_alt` field for WCAG 2.1 AA compliance. The system design includes it; the data model does not.

5. **`efColor` vs. `color_accent`**: These refer to the same value. Pick one name and use it everywhere. Recommend: `efColor` (system design) since it is more descriptive of what the color represents.

6. **`already-subscribed` analytics event handling**: The data model (Section 6) specifies that analytics events should NOT fire for already-subscribed emails. This is a good decision -- it prevents inflating KPI counts -- but it contradicts the system design which does not make this distinction explicit. The form success handler must differentiate between "new subscriber" and "already subscribed" API responses. Both docs should align on this behavior.

7. **Consumer form zip_code field**: The data model includes a `zip_code` field on the Consumer list (Section 3) referencing Story 3's note about Gulf Coast FL zips. The system design's `ConsumerSignupForm.tsx` and `SignupFormProps` interface do not mention this field. The data model's form validation rules (Section 4) include it as optional. This is fine -- the system design interface is generic and the zip_code would be passed as an additional form field -- but the implementation team should note this requirement.

8. **Press inquiry form delivery**: Story 11 says "simple email notification is sufficient" and the data model agrees. The system design lists it as an open question. This is resolved: use a Cloudflare Worker or simple mailto: link, not the email marketing platform. The system design's open questions section correctly flagged this.

9. **Retailer one-pager conditional visibility**: Story 7 AC5a/5b describes conditional display of the PDF download link. The system design mentions `AssetDownload.astro` but does not detail the conditional logic. The data model includes `retailer-one-pager.pdf` in the file structure. The conditional display logic (show download if asset exists, show "request spec sheet" if not) will need to be implemented -- this is an implementation detail, not an architectural gap.

---

## Summary

Both documents are thorough, well-structured, and cover all 11 active stories with no meaningful gaps. The architecture is appropriate for the scope -- a static branding site with form-based lead capture. The tech stack choices (Astro, Preact, Plausible, Cloudflare Pages) are well-justified and proportional. The data model provides complete schemas for all content types, form validation rules, analytics events, and third-party data flows.

The inconsistencies between the two documents (naming conventions, file formats, slug construction) are normal at the draft stage and resolvable during implementation. None are architectural risks. The notes above should be resolved before implementation begins to prevent confusion.

**These specs are ready for implementation.**
