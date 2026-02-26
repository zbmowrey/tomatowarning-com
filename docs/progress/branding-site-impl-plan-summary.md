---
feature: branding-site
team: plan-implementation
status: complete
updated: "2026-02-26"
---

# Session Summary: Branding Site Implementation Plan

## What Was Accomplished

- Produced a complete file-by-file implementation plan for the Tomato Warning Phase 1 branding site
- ~63 files across 6 build phases, each phase independently deployable
- Implementation Architect (Opus) produced the plan; Plan Skeptic (Opus) reviewed and approved on Round 1
- 5 non-blocking issues identified by skeptic and incorporated as implementation guidance in the final artifact

## Deliverables

| Artifact | Path | Author |
|----------|------|--------|
| Implementation Plan (draft) | `docs/progress/branding-site-impl-architect.md` | impl-architect |
| Plan Review | `docs/progress/branding-site-plan-skeptic.md` | plan-skeptic |
| Final Implementation Plan | `docs/specs/branding-site/implementation-plan.md` | Team Lead (synthesized) |

## Plan Structure

| Phase | Files | Description |
|-------|-------|-------------|
| Phase 0 | 8 | Project scaffolding (Astro init, config, tooling) |
| Phase 1 | 15 | Foundation (layouts, shared components, config, content schemas) |
| Phase 2 | 15 | Content & static pages (product data, privacy, mission, product pages) |
| Phase 3 | 12 | Interactive islands (forms, email integration, analytics) |
| Phase 4 | 4 | Hero & homepage |
| Phase 5 | 4 | CTA pages (retailer, nonprofit, press) |
| Phase 6 | 5 | Polish & verification |

## Key Decisions

- Full TypeScript interfaces defined for all shared types (Product, PageMeta, SiteConfig, form types, analytics types, submission types)
- Vitest for unit/integration tests, @testing-library/preact for form component tests, axe-core for a11y, Lighthouse CI for performance
- `lib/submit.ts` as single abstraction point for email platform API (swap-friendly)
- Hero content hardcoded in component (no separate hero.yaml)
- System fonts initially, brand font swap later
- Page-specific frontmatter (mission, press) validated at component level, not shared schema

## Non-Blocking Issues (from Skeptic)

1. Mission/press page schema fields — validate at page component level
2. Image path vs. Astro Image import — use `image()` helper or resolve imports
3. `tailwind.config.mjs` — clarify if Tailwind v4 CSS config replaces it
4. CF Worker for press inquiry — create Worker file if that approach chosen
5. (All incorporated as implementation notes in final artifact)

## What Remains

- Implementation plan is ready for execution via `/conclave:build-product`
- 6 ambiguities to resolve during implementation (all non-blocking)

## Blockers Encountered

- None (approved on first review round)
