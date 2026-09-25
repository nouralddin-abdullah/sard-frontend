// Cloudflare Worker for sardnovels.com:
//   /sitemap.xml                         -> sitemap with every public novel and published chapter
//   /api/og/novel/:slug                  -> the novel's share image (og.jpg made by the API with its cover)
//   /novel/:slug, /novel/:slug/chapter/:id -> server-rendered HTML for crawlers (everyone else gets the React app)
// Crawler HTML is cached for a day; the sitemap for an hour.

const SITE = 'https://www.sardnovels.com';

// Search engines, Search Console's live test, and link-preview bots.
const CRAWLER = /googlebot|google-inspectiontool|googleother|storebot-google|bingbot|bingpreview|yandex|baiduspider|duckduckbot|applebot|petalbot|twitterbot|facebookexternalhit|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkshare|whatsapp|telegrambot|discordbot|w3c_validator/i;

// Identifies us to the API so these requests don't count as reader views.
const API_HEADERS = { 'User-Agent': 'SardSeoWorker/1.0 (+https://www.sardnovels.com)', Accept: 'application/json' };

const HTML_CACHE_SECONDS = 86400;
const SITEMAP_CACHE_SECONDS = 3600;
const OG_CACHE_SECONDS = 604800;

// Share images are 1200x630 JPEGs. Novels without a cover in the standard format (not converted yet, or no cover)
// get the site's branded default (the web app's public/og-default.jpg).
const DEFAULT_SHARE_IMAGE = `${SITE}/og-default.jpg`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/sitemap.xml') {
      return withCache(url, ctx, SITEMAP_CACHE_SECONDS, () => renderSitemap(env));
    }

    const og = url.pathname.match(/^\/api\/og\/novel\/([^/]+)$/);
    if (og) {
      return withCache(url, ctx, OG_CACHE_SECONDS, () => renderOgImage(og[1], env));
    }

    const isCrawler = CRAWLER.test(request.headers.get('user-agent') || '');
    if (!isCrawler || request.method !== 'GET') {
      return fetch(request);
    }

    const chapter = url.pathname.match(/^\/novel\/([^/]+)\/chapter\/([0-9a-f-]{36})\/?$/i);
    const novel = url.pathname.match(/^\/novel\/([^/]+)\/?$/);
    if (!chapter && !novel) {
      return fetch(request);
    }

    try {
      const response = await withCache(url, ctx, HTML_CACHE_SECONDS, () =>
        chapter ? renderChapter(chapter[1], chapter[2], env) : renderNovel(novel[1], env));
      return response ?? fetch(request);
    } catch (error) {
      console.error('Crawler render failed, serving the app instead:', error);
      return fetch(request);
    }
  },
};

// ─── Caching ───

/** Serves from the edge cache, otherwise renders; only 200s are cached. A null render means "use the app". */
async function withCache(url, ctx, seconds, render) {
  const cache = caches.default;
  const key = new Request(url.toString(), { method: 'GET' });

  const hit = await cache.match(key);
  if (hit) {
    return hit;
  }

  const response = await render();
  if (response && response.status === 200) {
    response.headers.set('Cache-Control', `public, max-age=${seconds}`);
    ctx.waitUntil(cache.put(key, response.clone()));
  }
  return response;
}

function api(env, path) {
  return fetch(`${env.API_URL}${path}`, { headers: API_HEADERS });
}

// ─── Novel page ───

async function renderNovel(slug, env) {
  const novelRes = await api(env, `/api/novel/${slug}`);
  if (novelRes.status === 404) {
    return notFound();
  }
  if (!novelRes.ok) {
    return null;
  }
  const novel = await novelRes.json();

  const chaptersRes = await api(env, `/api/novel/${novel.id}/chapter`);
  const chapters = chaptersRes.ok ? await chaptersRes.json() : [];

  const url = `${SITE}/novel/${slug}`;
  const image = shareImageUrl(slug, novel.coverImageUrl);
  const cover = coverImageUrl(novel.coverImageUrl);
  const author = (novel.author?.displayName || '').trim();
  const genres = (novel.genresList || []).map((g) => translateGenre(g.name));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: novel.title,
    url,
    image: cover || image,
    author: { '@type': 'Person', name: author },
    description: novel.summary || '',
    genre: genres,
    inLanguage: 'ar',
    datePublished: toIso(novel.createdAt),
    dateModified: toIso(novel.lastUpdatedAt || novel.createdAt),
  };

  const chapterLinks = chapters
    .map((c) => `<li><a href="/novel/${slug}/chapter/${c.id}">${escapeHtml(c.title)}</a></li>`)
    .join('\n');

  return html({
    title: `${novel.title} - سرد`,
    // Link previews show og:title and og:description under the image, which carries no text.
    ogTitle: author ? `${novel.title.trim()} - ${author}` : novel.title.trim(),
    description: truncate(novel.summary, 160),
    url,
    image,
    imageAlt: `غلاف رواية ${novel.title}`,
    ogType: 'book',
    jsonLd: [jsonLd, breadcrumbs([{ name: novel.title, url }])],
    body: `
  <nav><a href="/">سرد</a> › <span>${escapeHtml(novel.title)}</span></nav>
  <main>
    <h1>${escapeHtml(novel.title)}</h1>
    <p>بقلم: ${escapeHtml(author)}</p>
    ${genres.length ? `<p>التصنيف: ${genres.map(escapeHtml).join('، ')}</p>` : ''}
    ${cover ? `<img src="${escapeHtml(cover)}" alt="${escapeHtml(`غلاف رواية ${novel.title}`)}" width="320" height="480">` : ''}
    <p>${escapeHtml(novel.summary || '')}</p>
    ${chapters.length ? `<h2>الفصول (${chapters.length})</h2>\n    <ol>\n${chapterLinks}\n    </ol>` : ''}
  </main>`,
  });
}

// ─── Chapter page ───

async function renderChapter(slug, chapterId, env) {
  const novelRes = await api(env, `/api/novel/${slug}`);
  if (novelRes.status === 404) {
    return notFound();
  }
  if (!novelRes.ok) {
    return null;
  }
  const novel = await novelRes.json();

  const [chapterRes, chaptersRes] = await Promise.all([
    api(env, `/api/novel/${novel.id}/chapter/${chapterId}`),
    api(env, `/api/novel/${novel.id}/chapter`),
  ]);
  if (chapterRes.status === 404) {
    return notFound();
  }
  if (!chapterRes.ok) {
    return null;
  }
  const chapter = await chapterRes.json();
  const chapters = chaptersRes.ok ? await chaptersRes.json() : [];

  const novelUrl = `${SITE}/novel/${slug}`;
  const url = `${novelUrl}/chapter/${chapterId}`;
  const position = chapters.findIndex((c) => c.id === chapterId);
  const previous = position > 0 ? chapters[position - 1] : null;
  const next = position >= 0 && position < chapters.length - 1 ? chapters[position + 1] : null;
  const author = novel.author?.displayName || '';

  const paragraphs = (chapter.paragraphs || [])
    .filter((p) => (p.contentType || 'text') === 'text')
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((p) => htmlToText(p.content))
    .filter(Boolean);

  const text = chapter.isLocked
    ? `<p>${escapeHtml(chapter.lockMessage || 'هذا الفصل متاح للمشتركين.')}</p>`
    : paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('\n    ');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Chapter',
    name: chapter.title,
    url,
    position: position >= 0 ? position + 1 : undefined,
    inLanguage: 'ar',
    author: { '@type': 'Person', name: author },
    isPartOf: { '@type': 'Book', name: novel.title, url: novelUrl },
    isAccessibleForFree: !chapter.isLocked,
  };

  const pager = [
    previous ? `<a rel="prev" href="/novel/${slug}/chapter/${previous.id}">الفصل السابق: ${escapeHtml(previous.title)}</a>` : '',
    `<a href="/novel/${slug}">فهرس الفصول</a>`,
    next ? `<a rel="next" href="/novel/${slug}/chapter/${next.id}">الفصل التالي: ${escapeHtml(next.title)}</a>` : '',
  ].filter(Boolean).join(' | ');

  return html({
    title: `${chapter.title} - ${novel.title} | سرد`,
    description: truncate(chapter.isLocked ? novel.summary : paragraphs.join(' '), 160),
    url,
    image: shareImageUrl(slug, novel.coverImageUrl),
    imageAlt: `غلاف رواية ${novel.title}`,
    ogType: 'article',
    jsonLd: [jsonLd, breadcrumbs([{ name: novel.title, url: novelUrl }, { name: chapter.title, url }])],
    body: `
  <nav><a href="/">سرد</a> › <a href="/novel/${slug}">${escapeHtml(novel.title)}</a> › <span>${escapeHtml(chapter.title)}</span></nav>
  <main>
    <article>
    <h1>${escapeHtml(chapter.title)}</h1>
    <p>من رواية <a href="/novel/${slug}">${escapeHtml(novel.title)}</a> بقلم ${escapeHtml(author)}</p>
    ${text}
    </article>
    <nav>${pager}</nav>
  </main>`,
  });
}

// ─── Shared HTML ───

function html({ title, ogTitle, description, url, image, imageAlt, ogType, jsonLd, body }) {
  const scripts = jsonLd
    .map((data) => `<script type="application/ld+json">${safeJson(data)}</script>`)
    .join('\n  ');

  const page = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${url}">
  <meta property="og:title" content="${escapeHtml(ogTitle || title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(imageAlt)}">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="${ogType}">
  <meta property="og:locale" content="ar_AR">
  <meta property="og:site_name" content="سرد">
  <meta property="fb:app_id" content="966242223397117">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(ogTitle || title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
  ${scripts}
</head>
<body>${body}
</body>
</html>`;

  return new Response(page, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'index, follow',
      'X-Rendered-By': 'Cloudflare-Worker',
    },
  });
}

function notFound() {
  return new Response(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8"><meta name="robots" content="noindex"><title>الصفحة غير موجودة - سرد</title></head>
<body><h1>الصفحة غير موجودة</h1><p><a href="/">العودة إلى سرد</a></p></body>
</html>`, {
    status: 404,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' },
  });
}

function breadcrumbs(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'سرد', url: SITE }, ...items].map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ─── Sitemap ───

async function renderSitemap(env) {
  let novels;
  const res = await api(env, '/api/seo/sitemap');
  if (res.ok) {
    novels = await res.json();
  } else {
    // Older API without /api/seo/sitemap: novels only.
    const legacy = await api(env, '/api/novel?pageNumber=1&pageSize=1000');
    if (!legacy.ok) {
      return new Response('Sitemap temporarily unavailable', { status: 503, headers: { 'Retry-After': '600' } });
    }
    const data = await legacy.json();
    novels = (data.items || []).map((n) => ({ slug: n.slug, lastModified: n.lastUpdatedAt || n.createdAt, chapters: [] }));
  }

  const entry = (loc, lastmod, priority) =>
    `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${toIso(lastmod)}</lastmod>` : ''}<priority>${priority}</priority></url>`;

  const lines = [
    entry(`${SITE}/`, null, '1.0'),
    entry(`${SITE}/home`, null, '0.9'),
    entry(`${SITE}/leaderboard`, null, '0.5'),
  ];
  for (const novel of novels) {
    const novelLoc = `${SITE}/novel/${encodeURIComponent(novel.slug)}`;
    lines.push(entry(novelLoc, novel.lastModified, '0.8'));
    for (const chapter of novel.chapters || []) {
      lines.push(entry(`${novelLoc}/chapter/${chapter.id}`, chapter.lastModified, '0.6'));
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${lines.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'X-Rendered-By': 'Cloudflare-Worker' },
  });
}

// ─── Share image ───

// The API stores each cover as novel-covers/{novelId}/{coverId}/{width}.webp next to og.jpg, a ready-made 1200x630
// share image (the cover on a blurred copy of itself, with the Sard wordmark). This route serves that file from the
// site's own domain so previews show sardnovels.com and the edge caches it; the ?v= in og:image changes with the
// cover, so a new cover is a new cache entry for Cloudflare and for Facebook/WhatsApp.
const STANDARD_COVER = /\/novel-covers\/[0-9a-fA-F-]{36}\/([0-9a-f]{32})\/[1-9][0-9]{1,3}\.webp$/;

async function renderOgImage(slug, env) {
  const novelRes = await api(env, `/api/novel/${slug}`);
  if (!novelRes.ok) {
    return novelRes.status === 404 ? new Response('Novel not found', { status: 404 }) : fallbackShareImage();
  }
  const novel = await novelRes.json();
  const shareUrl = standardShareImage(novel.coverImageUrl);
  if (shareUrl) {
    const res = await fetch(shareUrl);
    if (res.ok) {
      return new Response(res.body, { headers: { 'Content-Type': 'image/jpeg' } });
    }
    console.error(`Share image missing for ${slug}: ${res.status} ${shareUrl}`);
  }
  return fallbackShareImage();
}

async function fallbackShareImage() {
  const res = await fetch(DEFAULT_SHARE_IMAGE);
  // The site answers unknown paths with the app's HTML, so check that this really is the image.
  if (!res.ok || !(res.headers.get('content-type') || '').startsWith('image/')) {
    return Response.redirect(`${SITE}/logo.png`, 302);
  }
  return new Response(res.body, { headers: { 'Content-Type': 'image/jpeg' } });
}

/** og.jpg next to a standard cover, or null for a legacy (not yet converted) cover. */
function standardShareImage(url) {
  const clean = String(url || '').replace(INVISIBLE, '');
  return STANDARD_COVER.test(clean) ? clean.slice(0, clean.lastIndexOf('/') + 1) + 'og.jpg' : null;
}

/** og:image for a novel: this worker's route, versioned by the cover so a changed cover is fetched again. */
function shareImageUrl(slug, coverUrl) {
  return `${SITE}/api/og/novel/${slug}?v=${coverVersion(coverUrl)}`;
}

function coverVersion(url) {
  if (!url) return 'none';
  const match = String(url).match(STANDARD_COVER);
  if (match) return match[1];
  // Legacy cover: a short hash of its URL (FNV-1a).
  let hash = 0x811c9dc5;
  for (const ch of String(url)) {
    hash ^= ch.codePointAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16);
}

// ─── Utilities ───

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** JSON for a <script> tag: "<" is escaped so text can never close the tag. */
function safeJson(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** Editor HTML -> plain text lines (never re-emitted as HTML). */
function htmlToText(html) {
  return String(html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function truncate(text, max) {
  const clean = htmlToText(text).replace(/\s+/g, ' ');
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

/** API timestamps have no zone designator but are UTC. */
function toIso(value) {
  if (!value) return undefined;
  const s = String(value);
  const date = new Date(/[zZ]|[+-]\d\d:\d\d$/.test(s) ? s : `${s}Z`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

// Invisible direction marks and zero-width characters that sometimes end up in pasted titles (and so in legacy keys).
const INVISIBLE = /[\u200B-\u200D\u202A-\u202E\u2066-\u2069\uFEFF]/g;

/**
 * A cover URL crawlers load exactly as stored. Legacy keys contain spaces (sometimes trailing), Arabic and brackets;
 * URL parsers drop a raw trailing space, which asks the bucket for another key, so each path segment is encoded here.
 * Standard covers (plain ASCII keys) pass through unchanged. Null when there is no usable URL.
 */
function coverImageUrl(url) {
  if (!url) return null;
  const cleaned = String(url).replace(INVISIBLE, '');
  const match = cleaned.match(/^(https?:\/\/[^/?#]+)([^?#]*)(.*)$/i);
  if (!match) return null;
  const [, origin, path, rest] = match;
  const encoded = path
    .split('/')
    .map((segment) => {
      let decoded = segment;
      try {
        decoded = decodeURIComponent(segment);
      } catch {
        // A lone "%" in a legacy key: encode it as it is.
      }
      return encodeURIComponent(decoded);
    })
    .join('/');
  return `${origin}${encoded}${rest}`;
}

function translateGenre(genre) {
  const genreMap = {
    Romance: 'رومانسي',
    Fantasy: 'فانتازيا',
    SciFi: 'خيال علمي',
    'Science Fiction': 'خيال علمي',
    Horror: 'رعب',
    Mystery: 'غموض',
    Thriller: 'إثارة',
    Comedy: 'كوميديا',
    Drama: 'دراما',
    Action: 'أكشن',
    Adventure: 'مغامرة',
    Historical: 'تاريخي',
    Crime: 'جريمة',
    Tragedy: 'تراجيديا',
    SliceOfLife: 'شريحة من الحياة',
    Supernatural: 'خارق للطبيعة',
    Psychological: 'نفسي',
    Martial: 'فنون قتالية',
    FanFiction: 'فان فيكشن',
  };
  return genreMap[genre] || genre;
}
