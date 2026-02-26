---
type: user-stories
feature: "Tomato Warning Phase 1 Branding Site"
status: draft
created: "2026-02-26"
updated: "2026-02-26T18:00:00Z"
source_roadmap: [P1-12, P1-16, P1-17, P1-18, P1-19, P1-20, P1-21, P1-22]
authors: [story-writer]
---

# User Stories: Tomato Warning Phase 1 Branding Site

## Overview

These stories cover 8 roadmap items required to launch the Tomato Warning Phase 1 branding site. The site is a pre-launch marketing destination with no e-commerce. Its primary goals are to capture consumer, retailer, and nonprofit interest signups, communicate the brand's EF heat-scale differentiator, and establish trust through the origin story and giving structure. Items covered: email platform setup (P1-12), analytics configuration (P1-16), mission page (P1-17), nonprofit CTA page (P1-18), retailer CTA page (P1-19), product pages (P1-20), hero section (P1-21), and press page (P1-22).

## Personas

- **Marcus the Flavor Chaser** — Late 20s-30s male, specialty grocer shopper, buys 6-12 hot sauces/salsas per year, cares about heat accuracy and consistency, follows food brands on social.
- **Jennifer the Conscious Buyer** — 30s-40s female, Whole Foods/Sprouts shopper, reads ingredient lists, researches brands before buying, values authentic mission and transparent giving.
- **Coach Dave the Fundraiser Organizer** — 40s-50s male, runs youth sports teams and community organizations, needs simple profitable fundraising options, values ease of setup.
- **Retail Buyer** — Specialty grocery or natural foods store buyer or category manager evaluating new products for shelf placement.
- **Press/Media Contact** — Journalist, blogger, or food writer looking for brand materials and a story angle.
- **Site Administrator** — Internal team member configuring platforms, monitoring KPIs, and managing list health.

---

## Stories

---

### Story 1: Set Up Three-List Email Platform

**Priority:** must-have

> As a Site Administrator,
> I want to configure an email marketing platform with three segmented lists (Consumer, Retailer, Nonprofit),
> So that we can capture and communicate with each audience independently and measure signup KPIs per segment.

**Acceptance Criteria:**

1. **Given** the email platform account is created, **When** I view the audience/list settings, **Then** three distinct lists exist: "Notify Me" (Consumer), "Stock the Storm" (Retailer), and "Fundraise for Recovery" (Nonprofit).
2. **Given** a new subscriber submits any signup form, **When** the form is submitted, **Then** the contact is added to the correct list based on the form's context, with no cross-contamination between lists.
3. **Given** a new contact is added to any of the three lists, **When** the welcome automation triggers, **Then** the contact receives a branded welcome email within 5 minutes whose body copy matches the approved welcome email copy for that specific list (Consumer, Retailer, or Nonprofit) as signed off by the brand team.
4. **Given** a branded email template exists in the platform, **When** I preview the template, **Then** it displays the Tomato Warning logo, brand colors, and footer with unsubscribe and physical address.

**Edge Cases:**

- **Duplicate email across lists**: A person may legitimately be on multiple lists (e.g., a retailer who also wants consumer updates). The platform must allow the same email address on multiple lists without deduplication across lists.
- **Platform send limits on free tier**: If the platform has a free-tier send limit, ensure the welcome automations do not silently fail when limits are reached — log or alert the admin.
- **Automation fails to trigger**: Define a fallback process (manual export/send) if welcome automation fails for any contact.

**Implementation Notes:**

- Platform choice is left to the implementation team. Common options: Mailchimp, Kit (formerly ConvertKit), Klaviyo. Choose based on embeddable form support and segmentation capability.
- Welcome automation content must be reviewed against brand voice guidelines (playful with product, earnest with mission).
- This story is a hard blocker for Stories covering signup forms on P1-18, P1-19, and P1-20.

---

### Story 2: Build Embeddable Signup Forms for All Three Lists

**Priority:** must-have

> As a Site Administrator,
> I want embeddable signup forms for each of the three audience lists,
> So that site pages can capture leads without redirecting users to a third-party platform.

**Independence note:** Each of the four forms below (Consumer, Retailer, Nonprofit, Footer Combined) can be developed, tested, and deployed independently. A blocker on one form does not hold the others. The ACs are grouped here for brevity but represent four separable deliverables.

**Acceptance Criteria:**

1. **Given** a Consumer "Notify Me" form is embedded on a product page, **When** a user submits their email address, **Then** the contact is added to the "Notify Me" list and a success message is displayed inline without a page reload. (Independently testable: deploy and test on a single product page.)
2. **Given** a Retailer signup form is embedded on the retailer CTA page, **When** a buyer submits the short form, **Then** the contact is added to the "Stock the Storm" list and an inline confirmation is shown. (Independently testable: deploy and test on the retailer CTA page alone.)
3. **Given** a Nonprofit signup form is embedded on the nonprofit CTA page, **When** Coach Dave submits the interest form, **Then** the contact is added to the "Fundraise for Recovery" list and an inline confirmation is shown. (Independently testable: deploy and test on the nonprofit CTA page alone.)
4. **Given** the footer combined signup form exists with a segmentation dropdown, **When** a user selects their audience type and submits, **Then** the contact is routed to the correct list based on the dropdown selection and an inline confirmation is shown. (Independently testable: deploy the footer component and test all three dropdown paths.)
5. **Given** any of the four forms is submitted, **When** the submission is complete, **Then** a confirmation message is displayed inline (no redirect) acknowledging the signup.

**Edge Cases:**

- **Invalid email format**: Form must validate email format client-side before submission and show an inline error.
- **Already subscribed email**: If the email already exists on the list, show a neutral confirmation message ("You're already on the list") rather than an error.
- **JavaScript disabled**: Forms should degrade gracefully — either display a fallback link to the platform's hosted form, or display a message asking the user to enable JavaScript.
- **Mobile keyboard behavior**: Ensure form inputs trigger the correct keyboard type (email input) on mobile devices.

**Implementation Notes:**

- Forms should be embeddable via iframe or platform-provided JS snippet. Custom-styled forms are preferred for visual consistency.
- The footer combined form with segmentation dropdown is a shared component used across all pages.

---

### Story 3: Configure Analytics Platform and Conversion Tracking

**Priority:** must-have

> As a Site Administrator,
> I want an analytics platform configured with conversion events for all three signup types,
> So that I can track progress toward Phase 1 KPIs and identify which traffic sources drive signups.

**Acceptance Criteria:**

1. **Given** the analytics platform is installed on the site, **When** any page is loaded, **Then** a pageview event is fired with the correct page URL and title.
2. **Given** a Consumer "Notify Me" form is submitted successfully, **When** the conversion fires, **Then** an analytics event named `consumer_signup` (or equivalent) is recorded with the source page as a property.
3. **Given** a Retailer interest form is submitted, **When** the conversion fires, **Then** an analytics event named `retailer_signup` is recorded.
4. **Given** a Nonprofit interest form is submitted, **When** the conversion fires, **Then** an analytics event named `nonprofit_signup` is recorded.
5. **Given** UTM parameters are present in the URL (e.g., from a social post or email), **When** a user lands on any page, **Then** the UTM parameters are captured and associated with any subsequent conversion events in the same session.
6. **Given** the analytics platform is configured, **When** a team member needs to create a campaign link, **Then** a documented UTM naming convention exists covering `utm_source`, `utm_medium`, `utm_campaign`, and `utm_content` with lowercase-only values, and the analytics dashboard correctly groups traffic by source/medium/campaign using those conventions.

**Edge Cases:**

- **Ad blockers**: A significant portion of the target audience (specialty food enthusiasts) may use ad blockers. The implementation should use a privacy-respecting analytics platform (e.g., Plausible, Fathom, or self-hosted) or document expected data loss and use server-side event tracking for critical conversions.
- **Double-fire on form resubmit**: Ensure conversion events do not fire twice if a user refreshes the confirmation page.
- **Bot traffic inflating counts**: Configure bot/spider filtering in the analytics platform to avoid inflating KPI counts.
- **Missing UTMs on organic traffic**: Direct and organic traffic will naturally have no UTMs — ensure the dashboard treats null-UTM traffic as "direct/organic" rather than as an error.
- **UTM case sensitivity**: The naming convention must enforce lowercase-only values to prevent `Instagram` and `instagram` appearing as separate sources in reporting.

**Implementation Notes:**

- KPI targets: 500+ consumer signups, 50+ retailer signups, 10+ nonprofit signups.
- Gulf Coast FL zip codes are a priority dimension for consumer signups — capture zip code on signup where possible, or use geo data from analytics.
- A basic dashboard must be created showing real-time counts for all three KPI metrics.
- UTM naming convention is a lightweight deliverable (a shared doc or spreadsheet), not a technical build. Can be delivered in parallel with platform setup.

---

### Story 4: ~~Define UTM Tracking Strategy~~ [ABSORBED INTO STORY 3]

> **Note:** This story has been absorbed into Story 3 (AC6 and edge cases). UTM tracking strategy is a chore/task deliverable, not a user story — it has no end-user persona and delivers value only as a supporting artefact for Story 3. The UTM naming convention requirement now lives as AC6 of Story 3.

---

### Story 5: Build Mission Page — Origin Story and Giving Structure

**Priority:** must-have

> As Jennifer the Conscious Buyer,
> I want to read the honest origin story behind Tomato Warning and understand exactly how the brand gives back,
> So that I can decide whether this is a brand worth supporting with my purchase.

**Acceptance Criteria:**

1. **Given** I navigate to the Mission page, **When** the page loads, **Then** I see the origin story beginning with Max and the tornado warning moment, written in plain first-person language with no marketing voice.
2. **Given** I scroll through the Mission page, **When** I reach the giving structure section, **Then** I see ALL of the following: (a) a specific percentage of sales committed to charity stated as a number (e.g., "X% of every sale"), (b) the named charity partner by its full legal or commonly known name, (c) a description of how donated funds are used by that charity, and (d) an explicit statement committing to annual public reporting of donation totals.
3. **Given** I scroll through the Mission page, **When** I reach the EF system section, **Then** I see a clear explanation of how the Enhanced Fujita scale maps to heat levels in plain language (not a technical meteorological definition).
4. **Given** I view the community impact section and the brand has not yet donated (pre-launch state), **When** the page loads, **Then** the section displays $0 donated to date alongside a forward-looking statement that explains the giving structure as a commitment, with no historical donation amounts claimed. **Given** I view the community impact section and the brand has an active donation history (post-launch state), **When** the page loads, **Then** the section displays a specific, verifiable dollar amount donated to date alongside the receiving charity's name — no rounded estimates or placeholder figures.
5. **Given** I view the page on mobile, **When** the page renders, **Then** all sections are readable and no content is clipped or overflowed at 375px viewport width.

**Edge Cases:**

- **Charity partner not yet named (hard block)**: The page MUST NOT launch without the named charity partner. If the partner is not finalized, the page should be held from publication — a placeholder partner name is not acceptable per roadmap constraint.
- **Brand voice drift**: Review copy against brand voice guidelines — this page must use earnest, grounded tone. Any marketing language that creeps in must be edited out.

**Implementation Notes:**

- Tone guidance: earnest, grounded, specific. No marketing voice. Plain language, real numbers.
- This page is the primary trust-building page for Jennifer persona. Do not add CTAs unrelated to mission/trust.
- A single CTA linking back to product pages or the hero section is acceptable at the bottom of the page.
- Hard dependency: Charity partner (P1-02) must be finalized before this page can launch.

---

### Story 6: Build Nonprofit CTA Page — "Fundraise for Recovery"

**Priority:** must-have

> As Coach Dave the Fundraiser Organizer,
> I want to quickly understand Tomato Warning's fundraising program terms and submit my organization's interest,
> So that I can evaluate whether this is a viable fundraiser for my team without wasting time on a phone call.

**Acceptance Criteria:**

1. **Given** I land on the Nonprofit CTA page, **When** the page loads, **Then** I see the headline "Your next fundraiser." prominently above the fold.
2. **Given** I scan the page, **When** I read the three key bullets, **Then** I see: 45-50% margin, no upfront cost, and custom label option — each stated plainly without jargon.
3. **Given** I decide to register interest, **When** I fill out and submit the interest form, **Then** the form captures: organization name, contact name and email, organization type, location, and estimated campaign size.
4. **Given** I submit the form, **When** submission succeeds, **Then** I am added to the "Fundraise for Recovery" email list and see an inline confirmation message.
5. **Given** I submit the form, **When** submission succeeds, **Then** a conversion event `nonprofit_signup` fires in the analytics platform.
6. **Given** I view the page on a mobile device, **When** the page renders, **Then** the form is fully usable with large tap targets and readable labels on a 375px viewport.

**Edge Cases:**

- **Organization type not in dropdown**: If the form uses a dropdown for org type (youth sports, nonprofit 501c3, school, etc.) and a user's org type is not listed, provide an "Other" option with a free-text field.
- **Estimated campaign size is zero or very small**: Accept any numeric input — do not validate or gate based on size. A small first campaign is still a signup worth capturing.
- **Form submitted with mistyped email**: Email field must validate format. Consider adding a "confirm email" field or visible email display before final submit.
- **Duplicate submission**: If the same organization submits multiple times, handle gracefully (don't error out) and flag for admin review rather than blocking the submission.

**Implementation Notes:**

- KPI: 10+ nonprofit/org signups.
- This page targets Coach Dave — keep copy practical and benefit-forward. Avoid emotional or mission-heavy language on this page; save that for the Mission page.
- Email list opt-in should be explicit (checkbox or stated consent), not assumed.
- This page requires the email platform (P1-12/Story 1) to be complete before the form can go live.

---

### Story 7: Build Retailer CTA Page — "Stock the Storm"

**Priority:** must-have

> As a Retail Buyer,
> I want to quickly assess whether Tomato Warning is a viable product for my store's shelves and download spec materials,
> So that I can share the product details with my category manager without scheduling a sales call.

**Acceptance Criteria:**

1. **Given** I land on the Retailer CTA page, **When** the page loads, **Then** I see the headline "Stock the Storm." prominently above the fold.
2. **Given** I scroll the page, **When** I view the short form, **Then** I see fields for: name, store name, location, role, and optional message.
3. **Given** I submit the retailer interest form, **When** submission succeeds, **Then** I am added to the "Stock the Storm" email list and see an inline confirmation message.
4. **Given** I submit the form, **When** submission succeeds, **Then** a conversion event `retailer_signup` fires in the analytics platform.
5a. **Given** the retailer one-pager PDF asset has been created and uploaded, **When** I click the downloadable one-pager link, **Then** the PDF downloads (or opens in a new tab) and contains: product specs, pricing, shelf placement information, and jar dimensions (16oz glass, 82mm lid).
5b. **Given** the retailer one-pager PDF asset has NOT yet been created, **When** I view the retailer CTA page, **Then** the PDF download link/button is hidden and replaced with a "Request spec sheet" option (a form field or mailto link), so no broken link is ever visible to a buyer.
6. **Given** I view the page on desktop, **When** the page renders, **Then** the page has a professional, clean layout appropriate for a B2B audience — not the consumer-forward playful brand voice.

**Edge Cases:**

- **Retailer in unsupported region**: The form should accept any location input — do not gate by geography. Gulf Coast FL is the launch priority but out-of-region retailer interest is still valuable data.
- **Role field confusion**: "Role" may confuse buyers who aren't sure how to title themselves. Consider a dropdown with common options (Store Owner, Category Manager, Buyer, Other) rather than a free-text field.
- **Large retail chain inquiry**: A national buyer may need a different follow-up path than an independent store. Capture enough information in the form to allow internal routing, but don't over-engineer the form.

**Implementation Notes:**

- KPI: 50+ retailer signups.
- The downloadable one-pager PDF is a separate asset dependency. Coordinate with product renders (P1-15) and visual identity (P1-07) teams.
- Brand voice for this page: professional and confident, not playful. The "Rated by the storm." tagline can appear but should not be the dominant tone.
- This page requires the email platform (P1-12) to be complete.

---

### Story 8: Build Product Pages — Five EF-Level Varieties (Template)

**Priority:** must-have

> As Marcus the Flavor Chaser,
> I want to browse individual product pages for each EF-level hot sauce variety and sign up to be notified when they launch,
> So that I can find the heat level that matches my preference and secure early access.

**Acceptance Criteria:**

1. **Given** I navigate to any product page, **When** the page loads, **Then** I see: the rendered jar mockup, product name, EF level designation, flavor headline, heat descriptor, Scoville range, and two key ingredients.
2. **Given** I scroll to the bottom of any product page, **When** I see the "Notify Me" section, **Then** there is a visible email capture form with a submit button.
3. **Given** I submit the "Notify Me" form on a product page, **When** submission succeeds, **Then** I am added to the Consumer "Notify Me" email list and see an inline confirmation.
4. **Given** I submit the form, **When** submission succeeds, **Then** a `consumer_signup` event fires in analytics with the product variety as a property (so we can see per-variety interest).
5. **Given** the shared product page template is built, **When** I view the EF-3 Squall Line reference page (the canonical test instance for the template), **Then** all required content zones are present and populated: jar mockup, product name, EF level designation, flavor headline, heat descriptor, Scoville range, two key ingredients, and the "Notify Me" form. This AC is complete when one page is verified. Per-variety population for the remaining four varieties is covered in Story 9.
6. **Given** I view a product page on mobile, **When** the page renders, **Then** the jar mockup renders at an appropriate size and the "Notify Me" form is usable without horizontal scrolling at 375px.

**Edge Cases:**

- **Jar mockup not yet available**: If a render for a specific variety is not ready at launch, do not use a placeholder graphic. Either hold that variety's page or use a clearly-labeled "Render coming soon" state. Do not display a broken image.
- **Same email submitted on multiple product pages**: A user may sign up on several product pages. Each submission should succeed — do not block based on existing list membership. Do tag the contact with which varieties they expressed interest in if the platform supports it.
- **EF-5 Ground Zero heat warning**: EF-5 is extreme heat. Consider whether the page needs a brief "this is very hot" context note for users unfamiliar with the scale — consistent with the brand's commitment to heat accuracy.
- **Variety names change before launch**: Product names (EF-1 Coastal Calm, EF-2 Gulf Breeze, etc.) are not yet finalized. Build pages with a CMS or config-driven content approach so names can be updated without code changes.

**Implementation Notes:**

- Five varieties: EF-1 Coastal Calm, EF-2 Gulf Breeze, EF-3 Squall Line, EF-4 Supercell, EF-5 Ground Zero.
- KPI: 500+ consumer signups total across all product pages.
- "Coming Soon" pages — there is no purchase flow, no cart, no e-commerce.
- This page requires email platform (P1-12) to be complete.
- Product renders (P1-15) are a dependency for the jar mockup asset.

---

### Story 9: Build Product Pages — Per-Variety Content Population

**Priority:** must-have

> As a Site Administrator,
> I want to populate each of the five EF-level product pages with variety-specific content,
> So that every product page is distinct and informative without requiring five separate page builds.

**Precondition:** Per-variety content (product name, flavor headline, heat descriptor, Scoville range, two key ingredients, and jar render) has been provided and approved by the brand team for each variety before this story begins. This story is a technical population task — it does not include authoring or approving product copy.

**Acceptance Criteria:**

1. **Given** the shared product page template is built AND approved brand content has been delivered for a variety, **When** I populate that variety's content fields, **Then** the published page shows the brand-provided product name, EF level number, flavor headline, heat descriptor, Scoville range, and two key ingredients exactly as supplied — no paraphrasing or rewriting by the implementer.
2. **Given** I view EF-1 Coastal Calm, **When** I compare it to EF-5 Ground Zero, **Then** the visual treatment (color intensity, heat language) clearly communicates the difference in heat level.
3. **Given** I view any product page, **When** I look at the page title and meta description, **Then** the SEO metadata includes the product name and EF level for search indexability.

**Edge Cases:**

- **Content for all five varieties not ready simultaneously**: If some variety content (flavor headline, ingredients) is not finalized, allow pages to be built with placeholder content and a draft/hidden status. Only publish a variety page when all its content fields are confirmed.

**Implementation Notes:**

- This story is the content-population companion to Story 8 (template build). They can be worked in parallel by different team members.

---

### Story 10: Build Hero Section — "The EF System" Differentiator

**Priority:** must-have

> As Marcus the Flavor Chaser,
> I want to immediately understand Tomato Warning's unique EF heat scale system when I land on the site,
> So that I know within seconds why this brand is different from every other hot sauce.

**Acceptance Criteria:**

1. **Given** I visit the site homepage, **When** the hero section loads, **Then** I see the headline "Finally, a heat scale that means something." above the fold on both desktop and mobile.
2. **Given** I view the hero section, **When** I see the EF-scale bar, **Then** it displays a horizontal bar progressing from amber (EF-1) to near-black (EF-5) with a rendered jar image at each level.
3. **Given** I view the hero section, **When** I read the sub-copy, **Then** the text explicitly states that (a) each jar has a specific Scoville rating AND (b) the heat level is consistent from batch to batch — both facts must appear as readable text in the rendered section, not implied by imagery alone.
4. **Given** I want to learn the brand backstory, **When** I see the CTA in the hero section, **Then** there is a visible link or button to the origin story / mission page.
5. **Given** I view the hero on a mobile device, **When** the page renders, **Then** the EF-scale bar and jar images are visible without horizontal scrolling at 375px, and the headline is fully readable.
6. **Given** JavaScript is disabled or animations are not loaded, **When** I view the hero section, **Then** the section is fully comprehensible as a static layout — no content is hidden behind animation states.

**Edge Cases:**

- **Jar renders not all available**: The EF-scale bar requires all five jar renders. If any render is missing at build time, use a styled placeholder that maintains visual progression. Do not launch with broken images.
- **Headline meaning unclear to non-meteorologists**: The word "EF system" may be unfamiliar to some users. The sub-copy must briefly define it (tornado wind-speed scale, EF-1 to EF-5) without requiring users to leave the page to understand it.
- **Viewport width between mobile and desktop breakpoints**: Test at 768px (tablet) — the horizontal EF-scale bar may need to reflow or scroll horizontally at this breakpoint.
- **High contrast / accessibility**: The amber-to-near-black color progression must maintain sufficient contrast for the jar images to be distinguishable. Do not rely on color alone to communicate heat level — include labels.

**Implementation Notes:**

- Phase 2 will add animation to this section. Build with animation in mind (CSS classes, JS hooks) but do not build animation in Phase 1.
- This section must communicate the differentiator in under 5 seconds for a first-time visitor — test with real users if possible before launch.
- Jar renders (P1-15) are a hard dependency.
- Visual identity / color system (P1-07) must be established before the amber-to-near-black color progression can be finalized.

---

### Story 11: Build Press Page — "Storm Watch"

**Priority:** should-have

> As a Press/Media Contact,
> I want to find brand overview materials, high-res images, and a founder story in one place,
> So that I can write about Tomato Warning without needing to contact the team for basic assets.

**Acceptance Criteria:**

1. **Given** I navigate to the Press page, **When** the page loads, **Then** I see a brand overview paragraph that accurately describes Tomato Warning in 2-3 sentences.
2. **Given** I browse the Press page, **When** I look for downloadable assets, **Then** I find high-resolution product renders available for download (JPG or PNG, minimum 300dpi or 2000px wide).
3. **Given** I want the founder story, **When** I read the Press page, **Then** I find a founder narrative that is 150-250 words, written in third person, and includes ALL of: the founder's name, the founding year, the brand origin story (the tornado warning incident), and the product differentiator (EF heat scale).
4. **Given** I want a brand fact sheet, **When** I look for it on the Press page, **Then** I find a downloadable PDF or clearly formatted fact sheet with: brand name, founding story, product range, price point, launch region, and giving structure summary.
5. **Given** I have a press inquiry, **When** I fill out and submit the press inquiry contact form, **Then** my message is delivered to the team and I see a confirmation message.
6. **Given** I view the Press page, **When** I read the page, **Then** the tone is factual and professional — this page is written for journalists, not consumers.

**Edge Cases:**

- **High-res assets are large files**: Renders suitable for print may be 10-30MB each. Consider a ZIP download for the asset bundle, or link to a cloud storage folder rather than hosting large files in the web server directly.
- **Press inquiry form sends to wrong inbox**: Ensure the form routes to a monitored email address, not a generic contact inbox. Define the recipient before launch.
- **Brand fact sheet content not finalized**: If pricing, launch date, or charity partner are not confirmed, the fact sheet must either not be published or clearly mark those fields as "to be announced" — do not include unconfirmed data in a press document.
- **Page crawled before launch**: If the press page is indexed before launch, ensure no confidential or draft content is included. Use noindex meta tag during pre-launch staging.

**Implementation Notes:**

- This is the simplest page on the site — primarily asset assembly and a contact form.
- No KPI target for this page. It is a should-have for media enablement, not a primary signup driver.
- Asset dependencies: product renders (P1-15), founder content (P1-14).
- The press inquiry form does not need to integrate with the email marketing platform — a simple email notification is sufficient.

---

### Story 12: Build Privacy Policy Page

**Priority:** must-have

> As a Site Visitor,
> I want to read a clear privacy policy before submitting my email address,
> So that I understand how my data will be used and can make an informed decision about signing up.

**Acceptance Criteria:**

1. **Given** I click a privacy policy link in any signup form footer, **When** the link is followed, **Then** I am taken to a dedicated Privacy Policy page at a stable URL (e.g., `/privacy`).
2. **Given** I read the Privacy Policy page, **When** I scan the page, **Then** I find ALL of the following: (a) what personal data is collected (email address, any form fields), (b) how that data is used (email marketing, list segmentation), (c) the name of the email marketing platform used to store data, (d) how to unsubscribe or request data deletion, and (e) a contact email address for privacy inquiries.
3. **Given** any signup form is rendered on any page, **When** I view the form, **Then** a link to the Privacy Policy page is visible within or immediately below the form before submission.
4. **Given** the Privacy Policy page exists, **When** I view it on mobile, **Then** all text is readable at 375px viewport width with no horizontal scrolling.

**Edge Cases:**

- **Email platform changes**: If the email marketing platform is replaced, the privacy policy must be updated to reflect the new platform name and data processing terms before the new platform goes live.
- **GDPR vs. CAN-SPAM differences**: The page must satisfy both CAN-SPAM (US) requirements and GDPR basics for any EU visitors who may reach the site organically. If legal review is not available, use a reputable privacy policy generator and note that formal legal review is deferred.
- **Policy version history**: If the policy is updated after launch, add a "Last updated" date stamp at the top of the page so visitors know which version they are reading.

**Implementation Notes:**

- This page is a hard dependency for ALL signup forms across the site (Stories 2, 6, 7, 8). No signup form should go live without this page existing at a stable URL.
- This is not a marketing page — plain prose is appropriate. No brand voice requirements apply beyond basic consistency.
- A "Last updated" date must appear at the top of the page.
- This story is not derived from a numbered roadmap item but is required for CAN-SPAM/GDPR compliance and is an acceptance gate for all form deployments.

---

## Non-Functional Requirements

- **Performance**: All pages must achieve a Lighthouse performance score of 85+ on mobile. Images must be served in modern formats (WebP with JPEG fallback). Product jar renders must be optimized for web without visible quality loss.
- **Accessibility**: All pages must meet WCAG 2.1 AA. This includes: sufficient color contrast on all text, keyboard-navigable forms, ARIA labels on icon-only buttons, and alt text on all images (including jar renders with descriptive alt text that conveys the product and heat level).
- **SEO**: Each page must have a unique title tag, meta description, and canonical URL. Product pages must include structured data (schema.org Product) for future search visibility.
- **Mobile-first**: All pages must be fully functional at 375px viewport width. Forms must be usable with touch input. No horizontal scrolling.
- **Brand voice consistency**: Consumer-facing pages (product pages, hero, mission) must use playful-with-product / earnest-with-mission voice. B2B pages (retailer CTA, press) must use professional tone. These must not be mixed.
- **No e-commerce**: Under no circumstances should any page include a shopping cart, checkout flow, or payment processing. All product pages are "Coming Soon" only.
- **Form reliability**: Signup forms are the primary conversion mechanism. They must work without JavaScript failures, have visible error states, and must never silently fail. Every form submission must trigger the corresponding analytics event.
- **GDPR/CAN-SPAM compliance**: All email signup forms must include consent language and link to a privacy policy. The privacy policy page is a dependency.

---

## Out of Scope

- Shopping cart, checkout, or any e-commerce functionality
- User accounts or login
- Phase 2 animated hero section (EF-scale bar animation)
- Blog or editorial content beyond the mission page origin story
- Social media feed embeds
- Live product availability or inventory status
- Any pages not listed in P1-12 through P1-22
- Internationalization or languages other than English
- Dark mode
- Payment processing or donation portal

---

## Dependencies

- **P1-02 Charity Partner**: Must be named and confirmed before the Mission page (Story 5) can launch. This is a hard block.
- **P1-07 Visual Identity**: Brand colors, typography, and design system must be established before any page can be built to spec. The EF-scale color progression (amber to near-black) is blocked on this.
- **P1-11 Logo**: Logo asset must be available before any branded page or email template can be finalized.
- **P1-14 Founder Content**: Founder story and photography/biography are required for the Press page (Story 11) and Mission page (Story 5).
- **P1-15 Product Renders**: Jar mockup renders for all five varieties are required for product pages (Stories 8-9) and the hero section (Story 10). The hero section and product pages should not launch without renders.
- **P1-12 Email Platform** (Stories 1-2): Must be complete before any page with a signup form can go live. Blocks Stories 6, 7, 8.
- **P1-16 Analytics** (Stories 3-4): Must be installed before signup forms go live to ensure all conversions are tracked from day one.
- **Privacy Policy page** (Story 12): Required for CAN-SPAM/GDPR compliance on all email signup forms. Story 12 covers this deliverable. Must be live before any signup form goes live.
- **Retailer one-pager PDF**: Required for Story 7 (Retailer CTA page) download CTA. Asset must be created before page launch.
