---
title: Configure Email Platform
id: P1-12
status: pending
phase: 1
wave: 1
priority: high
category: infrastructure
effort: S
impact: high
dependencies: [P1-06]
created: 2026-02-26
updated: 2026-02-26
---

# P1-12: Configure Email Platform (3-List Architecture)

Set up email marketing platform with three distinct lists and branded templates.

## Three Lists
1. **Consumer** — "Notify Me" signups from product pages
2. **Retailer** — signups from "Stock the Storm" CTA page
3. **Nonprofit** — signups from "Fundraise for Recovery" CTA page

## Deliverables
- Email platform account (Klaviyo, Mailchimp, or similar)
- Three segmented lists configured
- Branded email templates (using P1-07 visual identity when available)
- Embeddable signup forms for each list
- Welcome automation for each list (distinct messaging per audience)
- Footer combined signup with segmentation dropdown

## Notes
- Blocked by P1-06 (tech stack — platform must be compatible)
- Blocks all site pages with signup forms (P1-18, P1-19, P1-20)
- Set up the three-list architecture BEFORE any signups are collected — retroactive separation is painful
