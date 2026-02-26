---
type: data-model
feature: "Tomato Warning Phase 1 Branding Site"
status: draft
created: "2026-02-26"
updated: "2026-02-26"
source_stories: docs/specs/branding-site/stories.md
author: data-architect
---

# Data Model: Tomato Warning Phase 1 Branding Site

## Overview

This document defines all data structures for the Phase 1 branding site. There is no traditional database. Data lives in three places:

1. **Content files** (markdown frontmatter + JSON) — source-controlled, powering static site generation
2. **Email platform lists** — three segmented lists storing subscriber data
3. **Analytics platform events** — pageviews and conversion events tracking KPIs

Design principles:
- Content as code: all content is source-controlled with draft/published states
- Validation rules map 1:1 to story acceptance criteria
- Every analytics event traces to a KPI
- Form schemas match email platform API field formats
- No e-commerce, no user accounts, no traditional database

---

## 1. Product Content Schema

Each of the five EF-level varieties is defined as a content file with structured frontmatter. This supports Story 8 (product page template) and Story 9 (per-variety population).

### Schema: Product

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | string | yes | Unique identifier, format `ef-{level}` | `ef-3` |
| `name` | string | yes | Product display name | `Squall Line` |
| `ef_level` | integer (1-5) | yes | EF scale level | `3` |
| `slug` | string | yes | URL path segment | `squall-line` |
| `scoville_min` | integer | yes | Low end of Scoville range | `5000` |
| `scoville_max` | integer | yes | High end of Scoville range | `25000` |
| `flavor_headline` | string | yes | One-line flavor description | `Habanero-forward with tropical mango counter, complex heat` |
| `heat_descriptor` | string | yes | Brand voice heat description | `The storm is here — tropical sweetness chased by real heat` |
| `key_ingredients` | string[] (2 items) | yes | Two featured ingredients | `["habanero", "mango"]` |
| `jar_render_image` | string | conditional | Path to jar mockup render | `/images/products/ef-3-squall-line.webp` |
| `color_accent` | string | yes | Hex color for EF level | `#8B2500` |
| `seo_title` | string | yes | Page title tag | `EF-3 Squall Line — Tomato Warning` |
| `seo_description` | string | yes | Meta description (max 160 chars) | `Habanero-forward with tropical mango...` |
| `status` | enum | yes | `draft` or `published` | `published` |
| `sort_order` | integer | yes | Display order (matches EF level) | `3` |

### Product Data (Five Varieties)

Source: ideas doc, product line section.

```yaml
# /content/products/ef-1-coastal-calm.md
---
id: "ef-1"
name: "Coastal Calm"
ef_level: 1
slug: "coastal-calm"
scoville_min: 500
scoville_max: 1500
flavor_headline: "Bright, fresh — FL tomatoes, poblano, cilantro, lime"
heat_descriptor: "A gentle gust — big flavor, little fire"
key_ingredients: ["poblano", "cilantro"]
jar_render_image: "/images/products/ef-1-coastal-calm.webp"
color_accent: "#D4A017"
seo_title: "EF-1 Coastal Calm — Tomato Warning"
seo_description: "EF-1 Coastal Calm: bright, fresh salsa with FL tomatoes, poblano, cilantro, and lime. Scoville rated 500-1,500 SHU. Coming soon."
status: "draft"
sort_order: 1
---
```

```yaml
# /content/products/ef-2-gulf-breeze.md
---
id: "ef-2"
name: "Gulf Breeze"
ef_level: 2
slug: "gulf-breeze"
scoville_min: 1500
scoville_max: 5000
flavor_headline: "Roasted tomato, chipotle smoke, serrano, ACV brightness"
heat_descriptor: "Building on the horizon — smoke, depth, and your first real tingle"
key_ingredients: ["chipotle", "serrano"]
jar_render_image: "/images/products/ef-2-gulf-breeze.webp"
color_accent: "#CC5500"
seo_title: "EF-2 Gulf Breeze — Tomato Warning"
seo_description: "EF-2 Gulf Breeze: roasted tomato salsa with chipotle smoke and serrano heat. Scoville rated 1,500-5,000 SHU. Coming soon."
status: "draft"
sort_order: 2
---
```

```yaml
# /content/products/ef-3-squall-line.md
---
id: "ef-3"
name: "Squall Line"
ef_level: 3
slug: "squall-line"
scoville_min: 5000
scoville_max: 25000
flavor_headline: "Habanero-forward with tropical mango counter, complex heat"
heat_descriptor: "The storm is here — tropical sweetness chased by real heat"
key_ingredients: ["habanero", "mango"]
jar_render_image: "/images/products/ef-3-squall-line.webp"
color_accent: "#8B2500"
seo_title: "EF-3 Squall Line — Tomato Warning"
seo_description: "EF-3 Squall Line: habanero-forward salsa with tropical mango counter and complex heat. Scoville rated 5,000-25,000 SHU. Coming soon."
status: "draft"
sort_order: 3
---
```

```yaml
# /content/products/ef-4-supercell.md
---
id: "ef-4"
name: "Supercell"
ef_level: 4
slug: "supercell"
scoville_min: 25000
scoville_max: 100000
flavor_headline: "Ghost pepper + red fresno blend, black garlic umami depth"
heat_descriptor: "Rotation confirmed — deep, relentless, rewarding"
key_ingredients: ["ghost pepper", "black garlic"]
jar_render_image: "/images/products/ef-4-supercell.webp"
color_accent: "#5C0A0A"
seo_title: "EF-4 Supercell — Tomato Warning"
seo_description: "EF-4 Supercell: ghost pepper and red fresno blend with black garlic umami depth. Scoville rated 25,000-100,000 SHU. Coming soon."
status: "draft"
sort_order: 4
---
```

```yaml
# /content/products/ef-5-ground-zero.md
---
id: "ef-5"
name: "Ground Zero"
ef_level: 5
slug: "ground-zero"
scoville_min: 100000
scoville_max: 500000
flavor_headline: "Carolina Reaper + Trinidad Moruga Scorpion, charred tomato character"
heat_descriptor: "Total devastation — for the few who dare"
key_ingredients: ["Carolina Reaper", "Trinidad Moruga Scorpion"]
jar_render_image: "/images/products/ef-5-ground-zero.webp"
color_accent: "#1C0A0A"
seo_title: "EF-5 Ground Zero — Tomato Warning"
seo_description: "EF-5 Ground Zero: Carolina Reaper and Trinidad Moruga Scorpion with charred tomato character. Scoville rated 100,000-500,000+ SHU. Coming soon."
status: "draft"
sort_order: 5
---
```

### Status Rules (Story 9)

- A product page can only be `published` when ALL required fields are populated with brand-approved content and `jar_render_image` points to an existing asset.
- `draft` products are excluded from the build output (not rendered to public HTML).
- The `status` field is the sole gate for per-variety launch readiness.

---

## 2. Page Content Schema

Static pages use markdown with structured frontmatter. These support Stories 5 (Mission), 10 (Hero), 11 (Press), and 12 (Privacy).

### Schema: Page

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | yes | Page display title |
| `slug` | string | yes | URL path (e.g., `mission`, `press`, `privacy`) |
| `seo_title` | string | yes | HTML title tag |
| `seo_description` | string | yes | Meta description (max 160 chars) |
| `status` | enum | yes | `draft` or `published` |
| `noindex` | boolean | no | If true, add `<meta name="robots" content="noindex">` |
| `last_updated` | date | yes | Last content update date |
| `template` | string | yes | Layout template to use |

### Page-Specific Data Structures

#### Mission Page (Story 5)

Additional frontmatter fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `charity_partner_name` | string | yes (hard block) | Full legal/common name of charity |
| `giving_percentage` | string | yes | Specific % commitment (e.g., "5% of net profits") |
| `donation_total_to_date` | number | yes | Dollar amount; `0` pre-launch |
| `donation_reporting_commitment` | string | yes | Statement on annual public reporting |
| `charity_fund_usage` | string | yes | How donated funds are used |

```yaml
# /content/pages/mission.md
---
title: "Our Mission"
slug: "mission"
seo_title: "Our Mission — Tomato Warning"
seo_description: "The storm that started it all. Learn how Tomato Warning was born and how every jar funds disaster recovery."
status: "draft"
noindex: false
last_updated: "2026-02-26"
template: "mission"
charity_partner_name: "" # HARD BLOCK: must be filled before publish
giving_percentage: ""
donation_total_to_date: 0
donation_reporting_commitment: "We publish annual donation totals publicly."
charity_fund_usage: ""
---

<!-- Origin story content in markdown body -->
<!-- EF system explanation section -->
<!-- Giving structure section -->
<!-- Community impact section -->
```

**Publish gate:** Mission page CANNOT be set to `status: published` while `charity_partner_name` is empty. Build script should enforce this.

#### Hero Section (Story 10)

The hero is a component, not a standalone page. Its content is stored as a data file.

```yaml
# /data/components/hero.yaml
headline: "Finally, a heat scale that means something."
sub_copy: "EF-1 (mild) to EF-5 (extreme) — every jar Scoville-rated, every batch consistent."
ef_definition: "Based on the Enhanced Fujita tornado wind-speed scale — EF-1 to EF-5."
cta_text: "Read our story"
cta_link: "/mission"
status: "draft"
```

The hero references product data (jar renders, EF levels, colors) from the product content files. No duplication of product data.

#### Press Page (Story 11)

Additional frontmatter fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `brand_overview` | string | yes | 2-3 sentence brand description |
| `founder_name` | string | yes | Founder's full name |
| `founding_year` | string | yes | Year founded |
| `founder_narrative` | string | yes | 150-250 word third-person bio |
| `press_contact_email` | string | yes | Monitored email for press inquiries |
| `asset_bundle_url` | string | no | URL to downloadable ZIP of high-res assets |
| `fact_sheet_pdf_url` | string | no | URL to brand fact sheet PDF |

```yaml
# /content/pages/press.md
---
title: "Storm Watch — Press"
slug: "press"
seo_title: "Press — Tomato Warning"
seo_description: "Brand overview, high-resolution product images, founder story, and press inquiry form for Tomato Warning."
status: "draft"
noindex: true  # noindex during pre-launch staging (Story 11 edge case)
last_updated: "2026-02-26"
template: "press"
brand_overview: ""
founder_name: ""
founding_year: ""
founder_narrative: ""
press_contact_email: ""
asset_bundle_url: ""
fact_sheet_pdf_url: ""
---
```

#### Privacy Policy Page (Story 12)

```yaml
# /content/pages/privacy.md
---
title: "Privacy Policy"
slug: "privacy"
seo_title: "Privacy Policy — Tomato Warning"
seo_description: "How Tomato Warning collects, uses, and protects your personal data."
status: "draft"
noindex: false
last_updated: "2026-02-26"
template: "privacy"
email_platform_name: "" # Name of email marketing platform (required by Story 12 AC2c)
privacy_contact_email: "" # Contact email for privacy inquiries (required by Story 12 AC2e)
---

<!-- Privacy policy prose in markdown body -->
```

---

## 3. Email List Schemas

Three segmented lists, each with distinct field schemas. These support Stories 1 and 2. A single email address MAY exist on multiple lists (Story 1 edge case: cross-list deduplication is not performed).

### List 1: Consumer "Notify Me"

**Purpose:** Capture consumer interest in product launch (Story 8).
**KPI:** 500+ signups.

| Field | Type | Required | Source | Notes |
|-------|------|----------|--------|-------|
| `email` | email | yes | Form input | Primary identifier |
| `product_interests` | string[] | no | Derived from signup page | Array of product IDs (e.g., `["ef-3", "ef-5"]`). Populated based on which product page the form was submitted from. If submitted from footer, empty. |
| `signup_source` | string | yes | Auto-captured | Page URL where form was submitted |
| `zip_code` | string (5 digits) | no | Form input (optional field) | Gulf Coast FL zips are a priority dimension (Story 3 notes) |
| `signup_date` | datetime | yes | Auto-captured | Timestamp of subscription |
| `utm_source` | string | no | Auto-captured from URL | UTM parameter if present |
| `utm_medium` | string | no | Auto-captured from URL | UTM parameter if present |
| `utm_campaign` | string | no | Auto-captured from URL | UTM parameter if present |
| `utm_content` | string | no | Auto-captured from URL | UTM parameter if present |

### List 2: Retailer "Stock the Storm"

**Purpose:** Capture retailer/buyer interest (Story 7).
**KPI:** 50+ signups.

| Field | Type | Required | Source | Notes |
|-------|------|----------|--------|-------|
| `email` | email | yes | Form input | Primary identifier |
| `name` | string | yes | Form input | Contact name |
| `store_name` | string | yes | Form input | Store or chain name |
| `location` | string | yes | Form input | City/state or region. Free text, not gated by geography (Story 7 edge case). |
| `role` | enum | yes | Form dropdown | Options: `Store Owner`, `Category Manager`, `Buyer`, `Other`. "Other" includes free-text follow-up. |
| `role_other` | string | conditional | Form input | Free-text role if `role` = `Other` |
| `message` | string | no | Form input | Optional message/notes |
| `signup_source` | string | yes | Auto-captured | Page URL |
| `signup_date` | datetime | yes | Auto-captured | Timestamp |

### List 3: Nonprofit "Fundraise for Recovery"

**Purpose:** Capture nonprofit/org fundraising interest (Story 6).
**KPI:** 10+ signups.

| Field | Type | Required | Source | Notes |
|-------|------|----------|--------|-------|
| `email` | email | yes | Form input | Primary identifier |
| `contact_name` | string | yes | Form input | Person submitting |
| `org_name` | string | yes | Form input | Organization name |
| `org_type` | enum | yes | Form dropdown | Options: `Youth Sports`, `Nonprofit 501(c)(3)`, `School`, `Church/Religious`, `Community Group`, `Other`. "Other" includes free-text. |
| `org_type_other` | string | conditional | Form input | Free-text org type if `org_type` = `Other` |
| `location` | string | yes | Form input | City/state |
| `campaign_size` | string | no | Form input | Estimated campaign size. Free text — accept any input, do not validate or gate (Story 6 edge case). |
| `signup_source` | string | yes | Auto-captured | Page URL |
| `signup_date` | datetime | yes | Auto-captured | Timestamp |

### Welcome Automation

Each list has a branded welcome email automation (Story 1, AC3):

| List | Welcome Email | Trigger | SLA |
|------|--------------|---------|-----|
| Consumer | Consumer welcome — brand voice: playful | On subscribe | Within 5 minutes |
| Retailer | Retailer welcome — brand voice: professional | On subscribe | Within 5 minutes |
| Nonprofit | Nonprofit welcome — brand voice: practical/benefit-forward | On subscribe | Within 5 minutes |

All welcome emails include: Tomato Warning logo, brand colors, footer with unsubscribe link and physical address (Story 1, AC4).

---

## 4. Form Validation Rules

Validation rules map directly to story acceptance criteria. All forms validate client-side before submission (Story 2 edge cases). All forms show inline errors, never redirect on error or success.

### Common Rules (All Forms)

| Rule | Implementation | Story Reference |
|------|---------------|-----------------|
| Email format validation | Client-side regex + `type="email"` input | Story 2, edge case 1 |
| Email keyboard on mobile | `inputmode="email"` attribute | Story 2, edge case 4 |
| Already-subscribed handling | Show neutral message: "You're already on the list" | Story 2, edge case 2 |
| Inline success confirmation | Display confirmation message without page reload | Story 2, AC5 |
| JS-disabled fallback | Display fallback link to platform hosted form or enable-JS message | Story 2, edge case 3 |
| Privacy policy link | Visible link to `/privacy` within or below every form | Story 12, AC3 |
| Double-submit prevention | Disable submit button after click, re-enable on error | Story 3, edge case 2 |

### Consumer "Notify Me" Form

| Field | Validation | Error Message |
|-------|-----------|---------------|
| `email` | Required. Valid email format. | "Please enter a valid email address." |
| `zip_code` | Optional. If provided, 5 digits only. | "Please enter a 5-digit zip code." |

### Retailer "Stock the Storm" Form

| Field | Validation | Error Message |
|-------|-----------|---------------|
| `email` | Required. Valid email format. | "Please enter a valid email address." |
| `name` | Required. Min 1 character. | "Please enter your name." |
| `store_name` | Required. Min 1 character. | "Please enter your store name." |
| `location` | Required. Min 1 character. | "Please enter your location." |
| `role` | Required. Must select from dropdown. | "Please select your role." |
| `role_other` | Required if `role` = "Other". Min 1 character. | "Please describe your role." |
| `message` | Optional. Max 500 characters. | "Message must be under 500 characters." |

### Nonprofit "Fundraise for Recovery" Form

| Field | Validation | Error Message |
|-------|-----------|---------------|
| `email` | Required. Valid email format. | "Please enter a valid email address." |
| `contact_name` | Required. Min 1 character. | "Please enter your name." |
| `org_name` | Required. Min 1 character. | "Please enter your organization name." |
| `org_type` | Required. Must select from dropdown. | "Please select your organization type." |
| `org_type_other` | Required if `org_type` = "Other". Min 1 character. | "Please describe your organization type." |
| `location` | Required. Min 1 character. | "Please enter your location." |
| `campaign_size` | Optional. No validation constraint. | N/A |

### Footer Combined Form (Story 2, AC4)

| Field | Validation | Error Message |
|-------|-----------|---------------|
| `email` | Required. Valid email format. | "Please enter a valid email address." |
| `audience_type` | Required. Dropdown: `Consumer`, `Retailer`, `Nonprofit/Organization`. | "Please select how you'd like to hear from us." |

The `audience_type` selection determines which email list the contact is routed to. No additional fields beyond email and audience type.

### Press Inquiry Form (Story 11, AC5)

This form does NOT integrate with the email marketing platform. It sends an email notification to the press contact address.

| Field | Validation | Error Message |
|-------|-----------|---------------|
| `name` | Required. Min 1 character. | "Please enter your name." |
| `email` | Required. Valid email format. | "Please enter a valid email address." |
| `outlet` | Optional. Free text. | N/A |
| `message` | Required. Min 10 characters. Max 2000 characters. | "Please enter your message (at least 10 characters)." |

---

## 5. Analytics Event Schema

All events support Story 3 (analytics configuration and conversion tracking). Every conversion event maps to a KPI.

### Event Definitions

#### `pageview`

Fires on every page load (Story 3, AC1).

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `page_url` | string | yes | Full page URL path |
| `page_title` | string | yes | HTML document title |

#### `consumer_signup`

Fires on successful Consumer "Notify Me" form submission (Story 3, AC2). **KPI: 500+ total.**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `source_page` | string | yes | Page URL where form was submitted |
| `product_variety` | string | no | Product ID if submitted from a product page (e.g., `ef-3`). Null if from footer or non-product page. |

#### `retailer_signup`

Fires on successful Retailer interest form submission (Story 3, AC3). **KPI: 50+ total.**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `source_page` | string | yes | Page URL where form was submitted |

#### `nonprofit_signup`

Fires on successful Nonprofit interest form submission (Story 3, AC4). **KPI: 10+ total.**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `source_page` | string | yes | Page URL where form was submitted |

### Event Firing Rules

- Events fire ONLY on confirmed successful form submission (after API response confirms contact was added or already existed). This prevents double-counting from failed submissions.
- Events must NOT fire on page refresh after a successful submission (Story 3, edge case 2). Implementation: use a session flag or one-time event trigger.
- Bot filtering must be enabled in the analytics platform (Story 3, edge case 3).

### UTM Parameter Schema

Captured on page load when present in URL query string (Story 3, AC5-AC6).

| Parameter | Type | Format Rule | Description |
|-----------|------|-------------|-------------|
| `utm_source` | string | lowercase only | Traffic source (e.g., `instagram`, `facebook`, `google`) |
| `utm_medium` | string | lowercase only | Marketing medium (e.g., `social`, `email`, `cpc`, `referral`) |
| `utm_campaign` | string | lowercase only | Campaign name (e.g., `prelaunch_feb2026`, `ef5_teaser`) |
| `utm_content` | string | lowercase only | Content variant (e.g., `hero_cta`, `footer_form`, `product_ef3`) |

**Naming convention rules:**
- All values lowercase (Story 3, AC6 and edge case 5). Enforce via normalization on capture — `Instagram` becomes `instagram`.
- Use underscores for multi-word values (e.g., `prelaunch_feb2026`), not hyphens or spaces.
- Null/missing UTMs are categorized as `direct/organic` in reporting, not as errors (Story 3, edge case 4).

UTM values are stored in session and associated with any subsequent conversion events in that session (Story 3, AC5).

### Analytics Dashboard Requirements

A basic dashboard showing real-time counts for:

| Metric | Source Event | KPI Target |
|--------|-------------|------------|
| Consumer signups | `consumer_signup` count | 500+ |
| Retailer signups | `retailer_signup` count | 50+ |
| Nonprofit signups | `nonprofit_signup` count | 10+ |
| Signups by source/medium | All signup events grouped by UTM | N/A |
| Consumer signups by product variety | `consumer_signup` grouped by `product_variety` | N/A |

---

## 6. Third-Party Data Flow

### Form Submission Flow

```
User fills form on site
    |
    v
Client-side validation (all rules in Section 4)
    |
    v  (pass)
Submit to email platform API
    |
    +-- Request payload matches list schema (Section 3)
    +-- Include: form fields + auto-captured fields (signup_source, UTMs, timestamp)
    |
    v
Email platform API response
    |
    +-- Success (new subscriber) --> Show inline confirmation + fire analytics event
    +-- Already subscribed --------> Show neutral message ("You're already on the list") + do NOT fire analytics event
    +-- Error ---------------------> Show inline error message + do NOT fire analytics event
    |
    v
Welcome automation triggers (within 5 minutes, Story 1 AC3)
```

### Footer Combined Form Routing

```
User selects audience type + enters email
    |
    v
audience_type determines target list:
    "Consumer"              --> Consumer "Notify Me" list
    "Retailer"              --> Retailer "Stock the Storm" list
    "Nonprofit/Organization" --> Nonprofit "Fundraise for Recovery" list
    |
    v
Submit to correct list via email platform API
    |
    v
Fire corresponding analytics event:
    Consumer  --> consumer_signup
    Retailer  --> retailer_signup
    Nonprofit --> nonprofit_signup
```

### Analytics Event Flow

```
Page loads
    |
    v
Capture UTM params from URL (if present), store in session
    |
    v
Fire `pageview` event with page_url + page_title
    |
    v  (on form submission success)
Fire conversion event (consumer_signup / retailer_signup / nonprofit_signup)
    +-- Include: source_page, product_variety (if applicable)
    +-- Session UTM params automatically associated by analytics platform
```

### Press Inquiry Flow (Separate)

```
User fills press inquiry form
    |
    v
Client-side validation
    |
    v
Send email notification to press_contact_email
    (NOT via email marketing platform -- simple email delivery)
    |
    v
Show inline confirmation to user
```

### Ad Blocker Consideration (Story 3 edge case 1)

- Primary approach: use a privacy-respecting analytics platform (e.g., Plausible, Fathom) that is less likely to be blocked.
- Fallback: for critical conversion events (`consumer_signup`, `retailer_signup`, `nonprofit_signup`), consider server-side event tracking — send the event from the backend when the email platform API confirms successful subscription. This ensures KPI-critical conversions are never lost to client-side blocking.
- Document expected data loss percentage for pageview events (estimated 15-30% with ad blockers).

### Platform Send Limit Handling (Story 1 edge case 2)

- Monitor email platform send quota.
- If welcome automation fails due to send limit: log the failure, alert the Site Administrator.
- Fallback: manual export of new subscribers and batch-send welcome emails.

---

## 7. Content File Structure

Proposed directory layout for all content and data files.

```
/content/
    /products/
        ef-1-coastal-calm.md      # Product content (frontmatter + body)
        ef-2-gulf-breeze.md
        ef-3-squall-line.md
        ef-4-supercell.md
        ef-5-ground-zero.md
    /pages/
        mission.md                # Mission/origin story (Story 5)
        press.md                  # Press page (Story 11)
        privacy.md                # Privacy policy (Story 12)
        retailer.md               # Retailer CTA page (Story 7)
        nonprofit.md              # Nonprofit CTA page (Story 6)

/data/
    /components/
        hero.yaml                 # Hero section content (Story 10)
        footer.yaml               # Footer component config (shared signup form)
    /forms/
        consumer-notify.json      # Consumer form field definitions
        retailer-interest.json    # Retailer form field definitions
        nonprofit-interest.json   # Nonprofit form field definitions
        footer-combined.json      # Footer combined form definition
        press-inquiry.json        # Press inquiry form definition
    /seo/
        structured-data.json      # schema.org Product structured data templates

/static/
    /images/
        /products/                # Jar render images (WebP + JPEG fallback)
            ef-1-coastal-calm.webp
            ef-1-coastal-calm.jpg
            ef-2-gulf-breeze.webp
            ef-2-gulf-breeze.jpg
            ef-3-squall-line.webp
            ef-3-squall-line.jpg
            ef-4-supercell.webp
            ef-4-supercell.jpg
            ef-5-ground-zero.webp
            ef-5-ground-zero.jpg
        /press/                   # High-res assets for press download
            asset-bundle.zip      # ZIP of all press images
        /brand/                   # Logo, brand marks
            logo.svg
            vortex-mark.svg
    /downloads/
        retailer-one-pager.pdf    # Retailer spec sheet (Story 7, AC5a)
        brand-fact-sheet.pdf      # Press fact sheet (Story 11, AC4)
```

### File Naming Conventions

- Product files: `ef-{level}-{slug}.md` (e.g., `ef-3-squall-line.md`)
- Page files: `{slug}.md` (e.g., `mission.md`)
- Image files: `ef-{level}-{slug}.{ext}` with both `.webp` and `.jpg` versions
- Data files: kebab-case (e.g., `consumer-notify.json`)

### Draft/Published Build Behavior

- Content with `status: "draft"` is excluded from production builds.
- Content with `status: "published"` is included in production builds.
- The build system should provide a preview/staging mode that renders draft content for internal review.

---

## 8. Structured Data (SEO)

Product pages include schema.org Product structured data per Story NFR (SEO requirement).

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Tomato Warning EF-3 Squall Line",
  "description": "Habanero-forward with tropical mango counter, complex heat. Scoville rated 5,000-25,000 SHU.",
  "brand": {
    "@type": "Brand",
    "name": "Tomato Warning"
  },
  "image": "/images/products/ef-3-squall-line.webp",
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/PreOrder",
    "priceCurrency": "USD"
  }
}
```

Note: No `price` field is included because there is no e-commerce in Phase 1. The `availability` is set to `PreOrder` to signal "coming soon" to search engines.

---

## 9. EF Color System Reference

The EF gradient is a shared data dependency used by the hero section, product pages, and any EF-referencing component.

| EF Level | Name | Color Accent | Hex |
|----------|------|-------------|-----|
| EF-1 | Coastal Calm | Warm amber | `#D4A017` |
| EF-2 | Gulf Breeze | Deep orange | `#CC5500` |
| EF-3 | Squall Line | Rust red | `#8B2500` |
| EF-4 | Supercell | Dark crimson | `#5C0A0A` |
| EF-5 | Ground Zero | Near-black | `#1C0A0A` |

Base brand palette: Storm charcoal `#2C2C2C`, Premium white `#F5F0EB`, Radar teal accent `#00B4D8`.

---

## 10. Cross-Reference: Schemas to Stories

| Story | Schema Sections Used |
|-------|---------------------|
| Story 1 (Email Platform) | Section 3 (Email Lists), Section 6 (Data Flow — welcome automation, send limits) |
| Story 2 (Signup Forms) | Section 3 (Email Lists), Section 4 (Form Validation), Section 6 (Data Flow — form submission) |
| Story 3 (Analytics) | Section 5 (Analytics Events), Section 6 (Data Flow — analytics, ad blockers) |
| Story 5 (Mission Page) | Section 2 (Page Content — Mission), Section 7 (File Structure) |
| Story 6 (Nonprofit CTA) | Section 3 (List 3), Section 4 (Nonprofit Form), Section 5 (`nonprofit_signup`) |
| Story 7 (Retailer CTA) | Section 3 (List 2), Section 4 (Retailer Form), Section 5 (`retailer_signup`) |
| Story 8 (Product Pages) | Section 1 (Product Schema), Section 3 (List 1), Section 4 (Consumer Form), Section 5 (`consumer_signup`) |
| Story 9 (Per-Variety Population) | Section 1 (Product Data — all 5 varieties), Section 8 (Structured Data) |
| Story 10 (Hero Section) | Section 2 (Hero component data), Section 1 (Product Schema — jar renders, colors), Section 9 (EF Colors) |
| Story 11 (Press Page) | Section 2 (Page Content — Press), Section 4 (Press Inquiry Form), Section 7 (File Structure — press assets) |
| Story 12 (Privacy Policy) | Section 2 (Page Content — Privacy), Section 4 (Common Rules — privacy link) |
