# SEO worker: deployment

`seo-worker.js` answers search engines and link-preview bots with server-rendered HTML for the public pages
(home, genres, author profiles, novels, chapters, novel wikis), builds `sitemap.xml`, and serves the novels' share
images under `/api/og/`. Every other visitor gets the React app exactly as before: for them the worker just passes
the request through. It reads the public API (`API_URL` in `wrangler.toml`) with GET requests only.

## Deploy

```bash
cd cloudflare-worker
npx wrangler login          # once
npx wrangler deploy
```

`wrangler deploy` also applies the routes listed in `wrangler.toml` (no dashboard step needed):

| Route | Serves |
| --- | --- |
| `www.sardnovels.com/` | the landing page (exact URL only; this does not route the whole site) |
| `www.sardnovels.com/home*` | the home page |
| `www.sardnovels.com/genre/*` | genre pages, including `?page=N` |
| `www.sardnovels.com/profile/*` | member profiles |
| `www.sardnovels.com/novel/*` | novels, chapters and novel wikis |
| `www.sardnovels.com/api/og/*` | share images |
| `www.sardnovels.com/sitemap*` | `sitemap.xml` (and `sitemap-N.xml` past 50,000 URLs) |

The worker imports the genre names and the wiki thin-page rule from `../src/utils/`, so deploy from a full checkout.

## Check it as Googlebot

```bash
UA="Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
curl -s -A "$UA" https://www.sardnovels.com/genre/fantasy | grep -E "<title>|canonical|robots"
curl -s -A "$UA" -o /dev/null -w "%{http_code}\n" https://www.sardnovels.com/genre/unknown   # 404
curl -s -A "$UA" https://www.sardnovels.com/sitemap.xml | head
curl -sI https://www.sardnovels.com/genre/fantasy       # a normal visitor: the app, no X-Rendered-By header
```

Crawler pages carry `X-Rendered-By: Cloudflare-Worker` and `Cache-Control: public, max-age=3600`. A page built
while part of the API failed also carries `X-Sard-Partial: 1` and is cached for five minutes only.

## Caching

Crawler HTML and the sitemap are cached at the edge for an hour, share images for a week (the `?v=` in `og:image`
changes with the cover). To see a change sooner, purge the URL in the Cloudflare dashboard (Caching, Configuration,
Custom Purge).

## Local testing

```bash
npx wrangler dev --local --var API_URL:https://api-sareed.runasp.net
curl -s -A "$UA" http://127.0.0.1:8787/genre/fantasy
```

Requests that the worker passes through go to the live site, so test the crawler pages locally and the pass-through
on the live site.

## Troubleshooting

- `npx wrangler tail` shows the worker's logs (failed API calls are logged with their path).
- A route not answering: check Workers & Pages, the worker, Settings, Domains & Routes.
