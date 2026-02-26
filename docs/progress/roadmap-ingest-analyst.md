---
feature: roadmap-ingest
team: manage-roadmap
agent: analyst
phase: analysis
status: complete
created: 2026-02-26
---

# Roadmap Ingestion Analysis: Tomato Warning

## Overview

This document transforms the evaluated product ideas (37 ideas, 8 categories, 3 tiers) into a structured roadmap recommendation. The analysis covers item grouping, dependency mapping, phase assignments, Phase 1 build sequencing, effort estimates, and gap identification.

The branding site's single mission: build three lists (retailers, nonprofits, consumers) that prove demand before the product exists. Every roadmap item is evaluated against that mission.

---

## 1. Item Grouping Strategy

### Rationale for grouping decisions

Items are grouped when:
- They share a single owner/executor and produce a unified output
- They must be decided together (splitting them creates contradictions)
- They have no independent utility — one piece alone is incomplete

Items are kept separate when:
- They are distinct deliverables that go live independently
- They have different owners or execution timelines
- Completing one without the other is a meaningful milestone

---

### Phase 1 Roadmap Items (PURSUE NOW)

#### Group 1: Confirm Charity Partner
**Source ideas:** Mission Page dependency (idea #4), Open Question #1, giving percentage (Open Question #2)
**Why grouped:** The charity partner name and giving percentage are co-dependent decisions — you cannot confirm one without the other. Both are decision tasks, not build tasks. A single decision-making session resolves both.
**Output:** A documented commitment: "[Named Org], X% of net profits, reported annually"
**Effort:** XS (hours — research candidates, evaluate fit, make the call)

---

#### Group 2: Trademark Search
**Source ideas:** Product names dependency (ideas #6-10), tagline dependency (idea #12), Open Question #3
**Why grouped:** All five product names plus the brand name plus the tagline need trademark clearance simultaneously. A single trademark attorney engagement covers all of them.
**Output:** Trademark clearance report for: "Tomato Warning," "Coastal Calm," "Gulf Breeze," "Squall Line," "Supercell," "Ground Zero," "Rated by the storm."
**Effort:** S (1-2 days — attorney engagement + review)

---

#### Group 3: Confirm Tagline & Product Names
**Source ideas:** Idea #12 (tagline), Ideas #6-10 (product names)
**Why grouped:** These are both decision tasks that unblock all copywriting. Both can be confirmed in the same working session once trademark clearance returns.
**Output:** Documented decisions: confirmed tagline + confirmed EF-1 through EF-5 names
**Effort:** XS (hours — decision, not build, assuming trademark is clear)
**Blocked by:** Trademark Search

---

#### Group 4: Define Brand Voice & Messaging
**Source ideas:** Idea #13 (tone spectrum + messaging pillars)
**Why kept separate:** This is a foundational document that governs all content creation across the site. It stands alone as a deliverable — not a decision but a crafted artifact.
**Output:** Brand voice guide: tone spectrum (playful product / earnest mission), 5 messaging pillars, do/don't examples, persona-specific tone notes
**Effort:** S (1-2 days — skilled copywriter)
**Blocked by:** Confirm Tagline & Product Names (tagline shapes voice), Confirm Charity Partner (pillar #4 requires named partner)

---

#### Group 5: Establish Visual Identity System
**Source ideas:** Idea #14 (color palette, typography, storm imagery, anti-southwestern rules)
**Why kept separate:** This is a large, unified design deliverable. Color, typography, and imagery are inseparable — they must be designed as a system. The output governs all subsequent visual work.
**Output:** Brand identity document: color palette with hex values, typography stack, storm imagery system (radar textures, isobar elements, vortex mark direction), anti-southwestern rules list
**Effort:** M (3-5 days — skilled brand designer)

---

#### Group 6: Design Logo & Vortex Mark
**Source ideas:** Logo / vortex mark (Dependencies table, item #3)
**Why kept separate:** The logo is a discrete deliverable distinct from the broader identity system. It requires iteration and has its own approval gate. It also has specific technical requirements (16px favicon → embroidery scale).
**Output:** Final logo + vortex mark in all required formats (SVG, PNG, favicon, print-ready)
**Effort:** M (3-5 days — brand designer, multiple rounds)
**Blocked by:** Establish Visual Identity System (color palette must be final before logo colorization)

---

#### Group 7: Produce Product Mockup Renders
**Source ideas:** Product mockup renders (Dependencies table, item #6)
**Why kept separate:** The renders are a major production deliverable that unlocks multiple site sections simultaneously (hero, product pages, press page). This is a distinct visual production task.
**Output:** High-res rendered jar mockups for EF-1 through EF-5, in multiple orientations (front, angled, lifestyle)
**Effort:** M-L (3-7 days — 3D rendering or photographer depending on approach; 5 varieties × multiple angles)
**Blocked by:** Establish Visual Identity System (colors, label direction), Design Logo & Vortex Mark (label must include logo)

---

#### Group 8: Configure Email Platform (3-List Architecture)
**Source ideas:** Idea #11 (dual mailing list, context-sensitive signup)
**Why kept separate:** This is a technical infrastructure task with specific architecture requirements (3 lists: consumer, retailer, nonprofit; segmentation logic; form embeds). It must be completed before any signup forms go live.
**Output:** Configured email platform with 3 lists, branded templates, form embeds ready for site integration
**Effort:** S (1-2 days — platform selection + configuration)

---

#### Group 9: Register Social Media Handles
**Source ideas:** Open Question #5 (@tomatowarning across Instagram, Facebook, TikTok, X)
**Why kept separate:** This is an urgent, time-sensitive task that can and should happen immediately — before brand awareness grows and handles get squatted.
**Output:** @tomatowarning (or closest available) secured across all major platforms
**Effort:** XS (hours)

---

#### Group 10: Tech Stack Decision & Domain/Hosting Setup
**Source ideas:** Open Question #6 (tech stack), implied by any site build
**Why grouped:** The tech stack decision and hosting setup are co-dependent — you can't set up hosting without knowing the stack. Both must be resolved before a single line of site code is written.
**Output:** Documented tech stack decision (rationale for chosen approach), domain confirmed, hosting configured
**Effort:** S (1-2 days — decision + setup)

---

#### Group 11: Build Branding Site — Hero Section
**Source ideas:** Idea #3 (5-Second Hero — "The EF System")
**Why kept separate:** The hero is the most critical section of the site and deserves its own build milestone. It's the first thing every visitor sees and communicates the brand's primary differentiator.
**Output:** Live hero section with EF-scale bar, rendered jar at each level, headline, sub-copy
**Effort:** M (3-5 days — design + dev)
**Blocked by:** Tech Stack Decision, Establish Visual Identity System, Produce Product Mockup Renders, Define Brand Voice & Messaging

---

#### Group 12: Build Branding Site — Product Pages (5 varieties)
**Source ideas:** Idea #5 ("Coming Soon" product pages with flavor teasers), Ideas #6-10 (EF-1 through EF-5 concepts)
**Why grouped:** All five product pages share a single template and are built in a single pass. Splitting them creates artificial milestones.
**Output:** Five "Coming Soon" product pages, each with: rendered jar, flavor headline, Scoville range, key ingredients, "Notify Me" email capture (consumer list)
**Effort:** M (3-5 days — page template build × 5 implementations + copy for each)
**Blocked by:** Tech Stack Decision, Produce Product Mockup Renders, Configure Email Platform, Confirm Tagline & Product Names, Define Brand Voice & Messaging

---

#### Group 13: Build Branding Site — Mission Page
**Source ideas:** Idea #4 (Mission Page — "The Storm That Started It All")
**Why kept separate:** The mission page is a distinct, content-heavy page with a different tone and audience than the product or CTA pages. It requires dedicated copywriting and layout work.
**Output:** Live mission page with: origin story, EF system explainer, giving structure with named partner + percentage, community impact section
**Effort:** M (3-5 days — copywriting + design + dev)
**Blocked by:** Tech Stack Decision, Confirm Charity Partner, Define Brand Voice & Messaging, Establish Visual Identity System

---

#### Group 14: Build Branding Site — Retailer CTA Page
**Source ideas:** Idea #1 ("Stock the Storm" — Retailer Interest CTA)
**Why kept separate:** This is a distinct page serving a completely different audience (retail buyers, not consumers) with different copy tone, form fields, and list destination.
**Output:** Live retailer landing page with: "Stock the Storm" headline, short interest form, retailer mailing list opt-in, downloadable one-pager PDF
**Effort:** M (3-5 days — copy + page build + PDF creation + form integration)
**Blocked by:** Tech Stack Decision, Configure Email Platform, Define Brand Voice & Messaging, Produce Product Mockup Renders (for PDF)

---

#### Group 15: Build Branding Site — Nonprofit/Fundraising CTA Page
**Source ideas:** Idea #2 ("Fundraise for Recovery" — Nonprofit Partner CTA)
**Why kept separate:** Same reasoning as retailer page — distinct audience (Coach Dave persona), different copy register, different form fields, different list destination.
**Output:** Live fundraising partner page with: margin/structure bullets, interest form, nonprofit mailing list opt-in
**Effort:** S-M (2-4 days — copy + page build + form integration; simpler than retailer page, no PDF required at launch)
**Blocked by:** Tech Stack Decision, Configure Email Platform, Define Brand Voice & Messaging

---

#### Group 16: Build Branding Site — Press Page
**Source ideas:** Idea #15 ("Storm Watch" — Press/Media Page)
**Why kept separate:** This is a small but distinct deliverable serving a third audience (journalists). It can be built after the primary pages are live without delaying the site launch.
**Output:** Live press page with: brand overview, high-res product renders, founder story, fact sheet, press inquiry form
**Effort:** S (1-2 days — mostly asset assembly + simple page build)
**Blocked by:** Produce Product Mockup Renders, Tech Stack Decision

---

### Phase 2 Roadmap Items (PURSUE AT LAUNCH)

These are kept as individual items because they are each distinct deliverables, many involving physical product decisions.

| Item ID | Name | Source Idea | Effort | Notes |
|---------|------|-------------|--------|-------|
| P2-1 | Resolve Glass Jar Shipping Strategy | Glass jar shipping | M | Existential DTC risk; foam inserts, carrier selection, free-shipping threshold |
| P2-2 | Build Storm Chasers Fund Program | Fundraising program | M-L | Full program: consignment model, custom label capability, campaign materials |
| P2-3 | Design "Storm Sampler" Bundle SKU | Storm Sampler | S | EF-1/EF-3/EF-5, $26.95-$29.95; can begin packaging design now |
| P2-4 | Design "Full Forecast" Bundle SKU | Full Forecast bundle | S-M | All 5 levels, $44.95-$49.95, custom rigid box; holiday target |
| P2-5 | Write Post-Purchase Email Sequence | Post-purchase emails | S | EF-progression upsell copy; write now, configure at launch |
| P2-6 | Design "Fundraiser Pack" 6-Jar Bundle | Fundraiser pack | S | $44.95, ~$22 org margin; core to fundraising program viability |
| P2-7 | Build "The Forecast" Interactive EF Selector | Animated EF selector | L | Radar-style product explorer; high social shareability; complex build |
| P2-8 | Design "Flavor Chaser" Bundle + Recipe Cards | Flavor Chaser bundle | M | EF-2/EF-3/EF-4; begin recipe development now |
| P2-9 | Design QR Code Story Layer per Jar | Per-variety QR pages | M | URL architecture + per-variety content + batch-linked giving impact |
| P2-10 | Begin Nonprofit Anchor Partner Relationship | Anchor charity partner | S | Outreach + relationship; co-branded SKU is Year 2 |

---

### Phase 3 Roadmap Items (PARK FOR LATER)

All 12 growth-phase ideas are added as individual items in Phase 3.

| Item ID | Name | Source Idea | Target | Notes |
|---------|------|-------------|--------|-------|
| P3-1 | Develop Hurricane Season Limited Edition | Hurricane Season SKU | Year 2 | Annual earned media hook; tease on branding site |
| P3-2 | Develop Hailstorm Variety | Hailstorm (white salsa) | Year 2 | Gift set differentiation; requires stable co-packer |
| P3-3 | Develop Black Squall Variety | Black Squall | Year 2 | Chef/foodie media appeal |
| P3-4 | Evaluate Ice Storm Feasibility | Ice Storm | Year 2+ | Fresh format conflict; may work as farmers market exclusive |
| P3-5 | Develop Derecho Variety | Derecho (roasted corn) | Year 2 | TX/OK market entry |
| P3-6 | Develop Waterspout Variety | Waterspout (FL Keys) | Year 2 | FL tourism/resort channel |
| P3-7 | Launch Gulf Coast Welcome Kit | Welcome Kit bundle | Year 2 | Realtor/tourist B2B channel |
| P3-8 | Design Holiday Stormfront Gift Box | Holiday gift box | Year 2 holiday | Annual limited edition with custom ornament |
| P3-9 | Build Custom Case Builder (DTC) | Custom case builder | Year 2 | Valuable at 8+ SKUs; premature before then |
| P3-10 | Launch Storm Season Subscription | DTC subscription | Year 2 | Start with subscribe-and-save; escalate to full subscription |
| P3-11 | Build Impact Dashboard (DTC) | Impact Dashboard | Year 2 | Use order confirmation impact email at launch instead |
| P3-12 | Pursue B Corp Certification | B Corp | Year 2+ | Align operations now; certify when eligible |

---

## 2. Dependency Graph

### Critical Path to Site Launch

The longest dependency chain determines the minimum time to launch. Mapping all chains:

```
Chain A (Visual + Renders — longest chain):
  Establish Visual Identity System
    → Design Logo & Vortex Mark
        → Produce Product Mockup Renders
            → Build Hero Section
            → Build Product Pages
            → Build Retailer CTA Page (for PDF)
            → Build Press Page

Chain B (Decisions → Copy):
  Confirm Charity Partner
    → Define Brand Voice & Messaging
        → All page copy

  Confirm Tagline & Product Names
    → Define Brand Voice & Messaging
        → All page copy

Chain C (Infrastructure):
  Tech Stack Decision & Domain/Hosting
    → All site builds

  Configure Email Platform
    → Build Product Pages (Notify Me forms)
    → Build Retailer CTA Page (retailer form)
    → Build Nonprofit CTA Page (nonprofit form)

Chain D (Legal):
  Trademark Search
    → Confirm Tagline & Product Names
        → Define Brand Voice & Messaging
```

### Full Dependency Map

| Item | Depends On |
|------|-----------|
| Confirm Charity Partner | — (can start immediately) |
| Trademark Search | — (can start immediately) |
| Register Social Media Handles | — (can start immediately) |
| Tech Stack Decision & Domain/Hosting | — (can start immediately) |
| Establish Visual Identity System | — (can start immediately, in parallel with decisions) |
| Confirm Tagline & Product Names | Trademark Search |
| Define Brand Voice & Messaging | Confirm Charity Partner, Confirm Tagline & Product Names |
| Design Logo & Vortex Mark | Establish Visual Identity System |
| Configure Email Platform | Tech Stack Decision (platform compatibility) |
| Produce Product Mockup Renders | Establish Visual Identity System, Design Logo & Vortex Mark |
| Build Hero Section | Tech Stack, Visual Identity, Renders, Brand Voice |
| Build Product Pages | Tech Stack, Renders, Email Platform, Tagline/Names, Brand Voice |
| Build Mission Page | Tech Stack, Charity Partner, Brand Voice, Visual Identity |
| Build Retailer CTA Page | Tech Stack, Email Platform, Brand Voice, Renders (for PDF) |
| Build Nonprofit CTA Page | Tech Stack, Email Platform, Brand Voice |
| Build Press Page | Tech Stack, Renders |

### Items That Can Start Immediately (No Dependencies)

1. Confirm Charity Partner
2. Trademark Search
3. Register Social Media Handles
4. Tech Stack Decision & Domain/Hosting Setup
5. Establish Visual Identity System

These five items should be started in the first week. Items 1-4 are decision/research tasks. Item 5 is a design task that can run in parallel.

---

## 3. Phase Assignment Confirmation

The three-phase structure proposed in the ideas artifact is confirmed with minor adjustments:

**Phase 1: Branding Site** — All 16 items above (15 original + 1 new gap item: Tech Stack & Domain)
**Phase 2: Product Launch** — All 10 PURSUE AT LAUNCH items
**Phase 3: Growth** — All 12 PARK FOR LATER items

No adjustments to tier assignments are recommended. The ideas evaluator made sound tier decisions — every Phase 1 item is genuinely required for the branding site, and every Phase 2 item requires physical product to exist before it can be completed.

One note on Phase 2 work that can be partially started in Phase 1:
- Post-purchase email sequence (P2-5): Copy can be written in Phase 1; configuration happens at launch
- Fundraiser Pack bundle design (P2-6): Design can begin in Phase 1 once renders exist
- Storm Sampler / Full Forecast bundle designs (P2-3, P2-4): Can be scoped in Phase 1

---

## 4. Priority Ordering Within Phase 1

The following sequence reflects the dependency graph and the principle: decisions before design, design before development, infrastructure before pages.

### Wave 0 — Immediate (No dependencies, start now, in parallel)

| Order | Item | Effort | Why Now |
|-------|------|--------|---------|
| 0-A | Confirm Charity Partner | XS | Blocks Mission Page; longest-lead decision |
| 0-B | Trademark Search | S | Blocks tagline + product name confirmation |
| 0-C | Register Social Media Handles | XS | Time-sensitive; handle squatting risk |
| 0-D | Tech Stack Decision & Domain/Hosting | S | Blocks all site builds |
| 0-E | Establish Visual Identity System | M | Blocks all design work; start in parallel with decisions |

### Wave 1 — After Wave 0 Decisions Resolve

| Order | Item | Effort | Blocked Until |
|-------|------|--------|--------------|
| 1-A | Confirm Tagline & Product Names | XS | Trademark Search complete |
| 1-B | Design Logo & Vortex Mark | M | Visual Identity System complete |
| 1-C | Configure Email Platform | S | Tech Stack Decision (for compatibility) |

### Wave 2 — After Wave 1

| Order | Item | Effort | Blocked Until |
|-------|------|--------|--------------|
| 2-A | Define Brand Voice & Messaging | S | Charity Partner confirmed, Tagline & Names confirmed |
| 2-B | Produce Product Mockup Renders | M-L | Visual Identity + Logo complete |

### Wave 3 — Site Build (All waves above must be complete)

| Order | Item | Effort | Notes |
|-------|------|--------|-------|
| 3-A | Build Mission Page | M | Charity Partner + Brand Voice + Visual Identity |
| 3-B | Build Nonprofit CTA Page | S-M | Email Platform + Brand Voice |
| 3-C | Build Retailer CTA Page | M | Email Platform + Brand Voice + Renders (for PDF) |
| 3-D | Build Product Pages | M | Renders + Email Platform + Names + Brand Voice |
| 3-E | Build Hero Section | M | Renders + Visual Identity + Brand Voice |
| 3-F | Build Press Page | S | Renders only; simplest page |

Note: Wave 3 items 3-A through 3-F have some parallelization potential. Mission Page and Nonprofit CTA can proceed without renders. Hero and Product Pages require renders. A two-developer team could parallelize here.

---

## 5. Effort Estimates by Roadmap Item

### Phase 1 Items — Full Effort Summary

| Item | Effort | Description |
|------|--------|-------------|
| Confirm Charity Partner | XS | Research candidates, evaluate, decide; document commitment |
| Trademark Search | S | Attorney engagement for 7 marks |
| Register Social Media Handles | XS | Platform registrations |
| Tech Stack Decision & Domain/Hosting | S | Decision + setup; domain likely already owned |
| Establish Visual Identity System | M | Color, typography, imagery, rules — brand designer |
| Confirm Tagline & Product Names | XS | Decision task (post-trademark) |
| Design Logo & Vortex Mark | M | Multiple rounds; multi-format delivery |
| Configure Email Platform | S | Platform selection, 3-list setup, template, form embeds |
| Define Brand Voice & Messaging | S | Tone guide, pillars, examples — skilled copywriter |
| Produce Product Mockup Renders | M-L | 5 varieties × multiple angles; 3D or photography |
| Build Hero Section | M | Most critical; may warrant extra polish time |
| Build Product Pages (5) | M | Template + 5 implementations |
| Build Mission Page | M | Copy-heavy; earnest tone; key trust page |
| Build Retailer CTA Page | M | Includes PDF one-pager creation |
| Build Nonprofit CTA Page | S-M | Simpler than retailer; no PDF required at launch |
| Build Press Page | S | Asset assembly + simple page |

**Phase 1 Total Effort Estimate:**
- Decision/research tasks (XS × 3): negligible clock time
- Small tasks (S × 4): 4-8 days
- Medium tasks (M × 7): 21-35 days
- Medium-Large tasks (M-L × 1): 5-10 days
- **Rough range: 30-55 working days of effort** (not calendar days; many items can be parallelized)

With a small team running parallel tracks (designer + copywriter + developer), this is achievable in 6-10 weeks of calendar time.

---

## 6. Gaps — Items Not Covered by the Ideas Artifact

The ideas artifact is thorough but focused on product and content. Several operational and infrastructure items are missing:

### Gap 1: Legal / Business Formation
**What's needed:** LLC formation (or chosen business entity), operating agreement, product liability insurance (Publix requires it), basic IP documentation.
**Why it matters:** Cannot enter retail contracts, cannot sign with a co-packer, and cannot credibly claim to be a business without this.
**Recommended item:** "Establish Legal Entity & Foundational Insurance"
**Effort:** S-M (attorney engagement; can run in parallel with branding work)
**Phase:** Phase 1 (Wave 0 — start immediately)

### Gap 2: Analytics & Tracking Setup
**What's needed:** Google Analytics 4 (or privacy-respecting alternative like Plausible), conversion event tracking for all three list signups, UTM strategy.
**Why it matters:** The branding site's success is measured by list growth. Without tracking, the team cannot optimize CTAs, understand traffic sources, or prove demand to potential retail partners.
**Recommended item:** "Configure Site Analytics & Conversion Tracking"
**Effort:** XS-S (1 day; should be done during site build)
**Phase:** Phase 1 (Wave 3 — during site build)

### Gap 3: Giving Economics Model
**What's needed:** A financial model confirming that the chosen giving percentage (recommended: 5% of net profits) is viable at various volume levels, and that the fundraising partner margin (45-50%) works with the co-packer economics.
**Why it matters:** The charity partner commitment and fundraising program economics are published on the site. Publishing unmodeled numbers is a liability.
**Recommended item:** "Model Giving & Fundraising Economics"
**Effort:** XS-S (spreadsheet work; a few hours)
**Phase:** Phase 1 (Wave 0 — run in parallel with charity partner decision; they inform each other)

### Gap 4: Co-Packer Research
**What's needed:** Identify and evaluate Gulf Coast FL co-packers, understand minimum run sizes, pricing per unit, timeline to first batch.
**Why it matters:** Without knowing co-packer economics, the Scoville range commitments, price points, and giving percentages on the branding site are ungrounded. This is also on the critical path to any Phase 2 work.
**Recommended item:** "Research Co-Packer Options (Gulf Coast FL)"
**Effort:** S-M (calls + research; a few days)
**Phase:** Can begin in Phase 1 but not blocking the branding site. Assign to Phase 1 as a parallel track.

### Gap 5: Scoville Range Validation
**What's needed:** Confirmation from a food scientist or experienced recipe developer that the published SHU ranges for each EF level are achievable and consistent in production (not just in a home kitchen).
**Why it matters:** The EF system's credibility rests on Scoville consistency. Publishing ranges that cannot be delivered in a co-packer environment collapses the brand's primary differentiator.
**Recommended item:** "Validate Scoville Ranges with Recipe Developer"
**Effort:** S (consultation with food scientist or co-packer)
**Phase:** Phase 1 or early Phase 2; must precede any "Notify Me" email promises

### Gap 6: Retailer One-Pager PDF (for Retailer CTA Page)
**What's needed:** A downloadable PDF for the "Stock the Storm" retailer page. The ideas artifact mentions it but doesn't define it as a standalone deliverable.
**Why grouped into Retailer CTA item:** This is subsumed into the Retailer CTA Page build item (Group 14) above, which includes "PDF creation" in its output. No separate item needed — but the effort for that item is higher because of this included deliverable.

### Gap 7: Founder Content / Photography
**What's needed:** At minimum, a founder photo and a brief video or photo that supports the origin story on the mission page. The mission page depends on this for credibility.
**Why it matters:** Jennifer (Conscious Buyer) will scrutinize the brand's authenticity. A faceless brand with a personal origin story will feel inauthentic.
**Recommended item:** "Capture Founder Content (Photo/Video)"
**Effort:** XS-S (a few hours with a photographer; or a high-quality phone shoot)
**Phase:** Phase 1 (Wave 2-3, before Mission Page goes live)

---

## 7. Consolidated Roadmap Item List

### Phase 1: Branding Site

| ID | Item | Effort | Wave | Dependencies |
|----|------|--------|------|-------------|
| P1-01 | Establish Legal Entity & Foundational Insurance | S-M | 0 | None |
| P1-02 | Confirm Charity Partner | XS | 0 | None |
| P1-03 | Model Giving & Fundraising Economics | XS-S | 0 | None (informs P1-02) |
| P1-04 | Trademark Search | S | 0 | None |
| P1-05 | Register Social Media Handles | XS | 0 | None |
| P1-06 | Tech Stack Decision & Domain/Hosting | S | 0 | None |
| P1-07 | Establish Visual Identity System | M | 0 | None |
| P1-08 | Research Co-Packer Options | S-M | 0 | None (parallel track) |
| P1-09 | Validate Scoville Ranges | S | 0-1 | None / P1-08 helpful |
| P1-10 | Confirm Tagline & Product Names | XS | 1 | P1-04 |
| P1-11 | Design Logo & Vortex Mark | M | 1 | P1-07 |
| P1-12 | Configure Email Platform | S | 1 | P1-06 |
| P1-13 | Define Brand Voice & Messaging | S | 2 | P1-02, P1-10 |
| P1-14 | Capture Founder Content (Photo/Video) | XS-S | 2 | None (can start anytime) |
| P1-15 | Produce Product Mockup Renders | M-L | 2 | P1-07, P1-11 |
| P1-16 | Configure Site Analytics & Conversion Tracking | XS-S | 3 | P1-06 |
| P1-17 | Build Mission Page | M | 3 | P1-02, P1-13, P1-07, P1-14 |
| P1-18 | Build Nonprofit CTA Page | S-M | 3 | P1-12, P1-13 |
| P1-19 | Build Retailer CTA Page | M | 3 | P1-12, P1-13, P1-15 |
| P1-20 | Build Product Pages (5 varieties) | M | 3 | P1-10, P1-12, P1-13, P1-15 |
| P1-21 | Build Hero Section | M | 3 | P1-07, P1-13, P1-15 |
| P1-22 | Build Press Page | S | 3 | P1-15 |

**Phase 1 total: 22 items** (16 from ideas artifact + 6 gap items)

### Phase 2: Product Launch (10 items — see Section 1)

### Phase 3: Growth (12 items — see Section 1)

**Grand total: 44 roadmap items**

---

## 8. Key Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Charity partner decision delayed | HIGH | Blocks Mission Page; assign a deadline (2 weeks) and a decision owner |
| Trademark conflict on product names | MEDIUM | Conduct search before publishing any names; "Ground Zero" and "Supercell" have prior use risk |
| Social handles already claimed | MEDIUM | Register immediately; have backup handle strategy (@tomatowarning.com, @tomatowarningfl) |
| Renders quality insufficient for press use | MEDIUM | Brief the renderer/photographer with press-quality specs upfront |
| Scoville ranges unachievable at co-packer scale | HIGH | Validate before publishing; use wider ranges with "Scoville tested, batch certified" language |
| Mission page launches with vague charity language | HIGH | Hard rule: do not launch Mission Page without named partner and specific percentage |
| Tech stack choice creates rebuild debt | MEDIUM | Decision document should include: e-commerce readiness, headless CMS capability, Phase 2 requirements |

---

## Summary for Roadmap Builder

**Action items for the roadmap builder:**
1. Create 44 items total: 22 in Phase 1, 10 in Phase 2, 12 in Phase 3
2. Phase 1 has 4 waves; within-wave items are parallelizable
3. Six gap items (P1-01, P1-03, P1-08, P1-09, P1-14, P1-16) should be added to the roadmap — they are not in the ideas artifact but are required for success
4. The critical path runs through: Visual Identity → Logo → Renders → Site Build
5. The fastest unblocking actions are: start trademark search, register social handles, and confirm charity partner — all can begin on day 1

**The three KPIs that define Phase 1 success:**
- 500+ consumer "Notify Me" signups (Gulf Coast FL zip codes prioritized)
- 50+ retailer interest signups
- 10+ nonprofit/org interest signups
