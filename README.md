# Tomato Warning

Pre-launch branding site for Tomato Warning — a premium hot sauce brand rated on the EF-1 to EF-5 tornado heat scale.

## Tech Stack

- [Astro 5.x](https://astro.build/) — Static site generator
- [Preact](https://preactjs.com/) — Lightweight interactive islands (forms)
- [Tailwind CSS v4](https://tailwindcss.com/) — Utility-first styling
- [Plausible Analytics](https://plausible.io/) — Privacy-friendly analytics
- [Cloudflare Pages](https://pages.cloudflare.com/) — Hosting & deployment

## Getting Started

```bash
npm install
npm run dev        # http://localhost:4321
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |

## Project Structure

```
src/
├── components/
│   ├── common/       # SkipNav, SEOHead, CTAButton, PrivacyLink
│   ├── forms/        # Preact form islands (Consumer, Retailer, Nonprofit, Footer, Press)
│   ├── hero/         # HeroSection, EFScaleBar, JarImage
│   ├── layout/       # Header, MobileNav, Footer
│   ├── press/        # AssetDownload
│   └── product/      # ProductCard, ProductHero, ProductDetails, HeatIndicator
├── config/           # Site config, form config, analytics config
├── content/          # Product data (JSON), page content (Markdown)
├── layouts/          # BaseLayout, PageLayout, ProductLayout
├── lib/              # Validation, analytics, form submission utilities
├── pages/            # Astro pages
└── styles/           # Global CSS with Tailwind v4 + brand tokens
docs/
├── specs/            # Technical spec, user stories, implementation plan
├── architecture/     # System design, data model ADRs
├── progress/         # Build progress and quality reviews
└── roadmap/          # Product roadmap
```

## Environment Variables

| Variable | Description |
|---|---|
| `PUBLIC_EMAIL_FORM_ENDPOINT` | Email platform API endpoint |
| `PUBLIC_CONSUMER_LIST_ID` | Consumer mailing list ID |
| `PUBLIC_RETAILER_LIST_ID` | Retailer mailing list ID |
| `PUBLIC_NONPROFIT_LIST_ID` | Nonprofit mailing list ID |
| `PUBLIC_PLAUSIBLE_DOMAIN` | Plausible analytics domain |
