# Sard web app (sard-frontend)

React web app for Sard (سرد, www.sardnovels.com), an Arabic web-novel platform. Live in production.
Load the `sard` skill for platform context: API, production data, SEO audit, roadmap.

## Stack

Vite 7 SPA, React 19, React Router 7 (routes in the config used by `src/components/common/AppRouter.jsx`),
TanStack Query (hooks per domain in `src/hooks/<domain>/`), Zustand (`src/store/`), Tailwind 4, i18next
(`src/locale/ar`, `src/locale/en`), react-helmet-async for page meta, Tiptap for the author editor. ES modules only.
API base URL: `src/constants/base-url.js`. Cloudflare Worker for SEO/OG/sitemap: `cloudflare-worker/`.

## Commands

```bash
npm run dev
npm run build
npm run lint
npm run test:e2e        # Playwright
cd cloudflare-worker && npx wrangler deploy     # SEO worker (see cloudflare-worker/DEPLOYMENT.md)
```

## Rules

- Arabic-first, RTL by default. Use logical CSS (`ms-`/`me-`/`ps-`/`pe-`, `start`/`end`), not left/right.
  Every user-facing string goes through i18next with both `ar` and `en` entries.
- Correctness and stability over speed; no shortcuts. UI work runs as a Design -> Debug -> Redesign loop until no
  issues remain, and is never left half-finished. (From the project's original Copilot instructions.)
- Every indexable page sets its own `<title>`, description, canonical, and OG tags. Never hard-code a canonical in
  `index.html`.
- SEO changes are verified as Googlebot sees them:
  `curl -s -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" <url>`, then check status
  code, `<title>`, `rel="canonical"`, and internal links. Known problems and the SSR plan: `sard` skill audit + roadmap.

## Before you say it's done

`npm run build` and `npm run lint` pass; UI checked in the browser in Arabic (RTL) and English; for SEO work, the
Googlebot curl check above passes.
