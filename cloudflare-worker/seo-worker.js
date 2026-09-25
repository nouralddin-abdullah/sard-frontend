// Cloudflare Worker for sardnovels.com:
//   /sitemap.xml                         -> sitemap with every public novel and published chapter
//   /api/og/novel/:slug                  -> dynamic Open Graph image
//   /novel/:slug, /novel/:slug/chapter/:id -> server-rendered HTML for crawlers (everyone else gets the React app)
// Crawler HTML is cached for a day; the sitemap for an hour.

import { ImageResponse } from 'workers-og';

const SITE = 'https://www.sardnovels.com';

// Search engines, Search Console's live test, and link-preview bots.
const CRAWLER = /googlebot|google-inspectiontool|googleother|storebot-google|bingbot|bingpreview|yandex|baiduspider|duckduckbot|applebot|petalbot|twitterbot|facebookexternalhit|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkshare|whatsapp|telegrambot|discordbot|w3c_validator/i;

// Identifies us to the API so these requests don't count as reader views.
const API_HEADERS = { 'User-Agent': 'SardSeoWorker/1.0 (+https://www.sardnovels.com)', Accept: 'application/json' };

const HTML_CACHE_SECONDS = 86400;
const SITEMAP_CACHE_SECONDS = 3600;
const OG_CACHE_SECONDS = 604800;

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
  const image = `${SITE}/api/og/novel/${slug}`;
  const author = novel.author?.displayName || '';
  const genres = (novel.genresList || []).map((g) => translateGenre(g.name));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: novel.title,
    url,
    image,
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
    description: truncate(novel.summary, 160),
    url,
    image,
    imageAlt: `${novel.title} - سرد`,
    ogType: 'book',
    jsonLd: [jsonLd, breadcrumbs([{ name: novel.title, url }])],
    body: `
  <nav><a href="/">سرد</a> › <span>${escapeHtml(novel.title)}</span></nav>
  <main>
    <h1>${escapeHtml(novel.title)}</h1>
    <p>بقلم: ${escapeHtml(author)}</p>
    ${genres.length ? `<p>التصنيف: ${genres.map(escapeHtml).join('، ')}</p>` : ''}
    <img src="${escapeHtml(cleanImageUrl(novel.coverImageUrl))}" alt="${escapeHtml(novel.title)}" width="260" height="390">
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
    image: `${SITE}/api/og/novel/${slug}`,
    imageAlt: `${novel.title} - سرد`,
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

function html({ title, description, url, image, imageAlt, ogType, jsonLd, body }) {
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
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(imageAlt)}">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="${ogType}">
  <meta property="og:locale" content="ar_AR">
  <meta property="og:site_name" content="سرد">
  <meta property="fb:app_id" content="966242223397117">
  <meta name="twitter:card" content="summary_large_image">
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

// ─── OG image ───

async function renderOgImage(slug, env) {
  try {
    const novelRes = await api(env, `/api/novel/${slug}`);
    if (!novelRes.ok) {
      return new Response('Novel not found', { status: 404 });
    }
    const novel = await novelRes.json();

    const title = escapeHtml(novel.title || '');
    const author = escapeHtml(novel.author?.displayName || '');
    const genre = escapeHtml(novel.genresList?.[0]?.name || '');
    const coverUrl = cleanImageUrl(novel.coverImageUrl);

    // Noto Sans Arabic Bold
    const fontUrl = 'https://fonts.gstatic.com/s/notosansarabic/v18/nwpxtLGrOAZMl5nJ_wfgRg3DrWFZWsnVBJ_sS6tlqHHFlhQ5l3sQWIHPqzCfyG2vu3CBFQLaig.ttf';
    const fontData = await fetch(fontUrl).then((r) => r.arrayBuffer());

    let coverBase64 = '';
    try {
      const coverRes = await fetch(coverUrl);
      if (coverRes.ok) {
        const bytes = new Uint8Array(await coverRes.arrayBuffer());
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        coverBase64 = `data:image/jpeg;base64,${btoa(binary)}`;
      }
    } catch (e) {
      console.error('Error fetching cover:', e);
    }

    // Book showcase card (RTL)
    const card = `
    <div style="display: flex; width: 1200px; height: 630px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); font-family: 'Noto Sans Arabic'; direction: rtl;">
      <div style="display: flex; align-items: center; justify-content: center; width: 380px; height: 630px; padding: 40px 30px 40px 0;">
        ${coverBase64 ? `
        <div style="display: flex; position: relative;">
          <div style="display: flex; position: absolute; top: 8px; right: -8px; width: 260px; height: 390px; background: rgba(0,0,0,0.4); border-radius: 4px;"></div>
          <div style="display: flex; position: absolute; right: -4px; top: 0; width: 8px; height: 390px; background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.3) 100%); border-radius: 2px 0 0 2px;"></div>
          <img src="${coverBase64}" width="260" height="390" style="border-radius: 4px; border: 2px solid rgba(255,255,255,0.15); object-fit: cover;" />
        </div>
        ` : `
        <div style="display: flex; align-items: center; justify-content: center; width: 260px; height: 390px; background: rgba(255,255,255,0.1); border-radius: 4px; border: 2px solid rgba(255,255,255,0.15); color: white; font-size: 24px;">
          سرد
        </div>
        `}
      </div>
      <div style="display: flex; flex-direction: column; justify-content: center; flex: 1; padding: 50px 40px 50px 50px; gap: 0;">
        <div style="display: flex; font-size: ${title.length > 40 ? '36' : title.length > 25 ? '42' : '50'}px; font-weight: 700; color: #ffffff; line-height: 1.3; margin-bottom: 20px; text-align: right; max-height: 200px; overflow: hidden;">
          ${title}
        </div>
        <div style="display: flex; width: 80px; height: 4px; background: linear-gradient(90deg, #e94560, #c23152); border-radius: 2px; margin-bottom: 24px;"></div>
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
          <div style="display: flex; font-size: 24px; color: #e94560; font-weight: 600;">بقلم</div>
          <div style="display: flex; font-size: 28px; color: #d4d4d4; font-weight: 500;">${author}</div>
        </div>
        ${genre ? `
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="display: flex; padding: 8px 20px; background: rgba(233, 69, 96, 0.15); border: 1px solid rgba(233, 69, 96, 0.3); border-radius: 20px; font-size: 18px; color: #e94560;">
            ${translateGenre(genre)}
          </div>
        </div>
        ` : ''}
        <div style="display: flex; align-items: center; gap: 10px; margin-top: auto; padding-top: 30px;">
          <div style="display: flex; font-size: 20px; color: rgba(255,255,255,0.4); font-weight: 400;">sardnovels.com</div>
        </div>
      </div>
    </div>`;

    const image = new ImageResponse(card, {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Noto Sans Arabic', data: fontData, weight: 700, style: 'normal' }],
    });

    const response = new Response(image.body, image);
    response.headers.set('Content-Type', 'image/png');
    return response;
  } catch (error) {
    console.error('Error generating OG image:', error);
    return Response.redirect(`${SITE}/logo.png`, 302);
  }
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

function cleanImageUrl(url) {
  if (!url) return `${SITE}/logo.png`;

  try {
    // Remove invisible Unicode characters (RTL marks, zero-width characters, etc.)
    const cleanUrl = url.replace(/[\u200B-\u200D\u202A-\u202E\uFEFF]/g, '').trim();
    const urlObj = new URL(cleanUrl);
    urlObj.pathname = urlObj.pathname
      .split('/')
      .map((segment) => (segment ? encodeURIComponent(decodeURIComponent(segment)) : segment))
      .join('/');
    return urlObj.toString();
  } catch (e) {
    console.error('Error cleaning image URL:', e);
    return `${SITE}/logo.png`;
  }
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
