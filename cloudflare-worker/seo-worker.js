// Cloudflare Worker for www.sardnovels.com:
//   /sitemap.xml                              -> every public page (a sitemap index of /sitemap-N.xml past 50,000 URLs)
//   /api/og/novel/:slug                       -> the novel's share image (og.jpg made by the API with its cover)
//   Search engines and link-preview bots get server-rendered HTML of the public pages; everyone else gets the React app:
//   /, /home                                  -> the landing and home pages
//   /genre/:slug[?page=N]                     -> a genre's novels
//   /profile/:username                        -> a member's profile (and novels, for authors)
//   /novel/:slug, /novel/:slug/chapter/:id    -> a novel and its chapters
//   /novel/:novelId/wikipedia[/:entityId]     -> the novel's wiki (موسوعة الرواية) and its entries
// Crawler HTML and the sitemap are cached for an hour, share images for a week. Anything made without all of its data
// (an API call failed) is cached for five minutes only, so a hiccup isn't served as the real page for long.
// Genre names and the wiki thin-page rule come from the web app's own modules, so both always agree.

import { translateGenre } from '../src/utils/translate-genre.js';
import { GENRES } from '../src/utils/genreSections.js';
import { countLetters, hasRealWikiName, isIndexableWikiEntity, isIndexableWikiListEntry } from '../src/utils/wiki-pages.js';
import {
  SITE_URL as SITE,
  SITE_NAME,
  SITE_TITLE,
  DEFAULT_SHARE_IMAGE,
  LANDING_DESCRIPTION,
  HOME_TITLE,
  HOME_DESCRIPTION,
  genrePageTitle,
  genrePageDescription,
  profileTitle,
  websiteJsonLd,
} from '../src/utils/seo.js';

// Search engines, Search Console's live test, and link-preview bots.
const CRAWLER = /googlebot|google-inspectiontool|googleother|storebot-google|bingbot|bingpreview|yandex|baiduspider|duckduckbot|applebot|petalbot|twitterbot|facebookexternalhit|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkshare|whatsapp|telegrambot|discordbot|w3c_validator/i;

// Identifies us to the API so these requests don't count as reader views.
const API_HEADERS = { 'User-Agent': 'SardSeoWorker/1.0 (+https://www.sardnovels.com)', Accept: 'application/json' };
const API_TIMEOUT_MS = 20000;

const HTML_CACHE_SECONDS = 3600;
const SITEMAP_CACHE_SECONDS = 3600;
const OG_CACHE_SECONDS = 604800;
const PARTIAL_CACHE_SECONDS = 300;
// Set on a response made without all of its data; withCache keeps it for PARTIAL_CACHE_SECONDS at most.
const PARTIAL = 'X-Sard-Partial';

const SITEMAP_MAX_URLS = 50000;
const GENRE_PAGE_SIZE = 20; // as on the web app's genre page
const HOME_LIST_SIZE = 12;
const NOVEL_LIST_PAGE_SIZE = 1000; // the API's maximum for GET /api/novel
const WIKI_LIST_SIZE = 100;
const PROFILE_NOVELS = 50;

// Share images are 1200x630 JPEGs. Novels without a cover in the standard format (not converted yet, or no cover)
// get the site's branded default (the web app's public/og-default.jpg), as do the other pages.
const DEFAULT_IMAGE = { url: DEFAULT_SHARE_IMAGE, type: 'image/jpeg', width: 1200, height: 630, alt: SITE_TITLE };

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    const sitemap = url.pathname.match(/^\/sitemap(?:-([1-9][0-9]*))?\.xml$/);
    if (sitemap) {
      return withCache(url, ctx, SITEMAP_CACHE_SECONDS, () => renderSitemap(env, sitemap[1]));
    }

    const og = url.pathname.match(/^\/api\/og\/novel\/([^/]+)$/);
    if (og) {
      return withCache(url, ctx, OG_CACHE_SECONDS, () => renderOgImage(og[1], env));
    }

    const isCrawler = CRAWLER.test(request.headers.get('user-agent') || '');
    const render = isCrawler && request.method === 'GET' ? crawlerPage(url, env) : null;
    if (!render) {
      return fetch(request);
    }

    try {
      const response = await withCache(url, ctx, HTML_CACHE_SECONDS, render);
      return response ?? fetch(request);
    } catch (error) {
      console.error('Crawler render failed, serving the app instead:', error);
      return fetch(request);
    }
  },
};

/** The renderer for a public page, or null for everything else (the app serves it as usual). */
function crawlerPage(url, env) {
  const path = url.pathname;
  let m;
  if (path === '/') return () => renderLanding(env);
  if (/^\/home\/?$/.test(path)) return () => renderHome(env);
  if ((m = path.match(/^\/genre\/([^/]+)\/?$/))) return () => renderGenre(m[1], url.searchParams, env);
  if ((m = path.match(/^\/profile\/([^/]+)\/?$/))) return () => renderProfile(m[1], env);
  if ((m = path.match(/^\/novel\/([^/]+)\/wikipedia\/?$/))) return () => renderWiki(m[1], env);
  if ((m = path.match(/^\/novel\/([^/]+)\/wikipedia\/([^/]+)\/?$/))) return () => renderWikiEntry(m[1], m[2], env);
  if ((m = path.match(/^\/novel\/([^/]+)\/chapter\/([0-9a-f-]{36})\/?$/i))) return () => renderChapter(m[1], m[2], env);
  if ((m = path.match(/^\/novel\/([^/]+)\/?$/))) return () => renderNovel(m[1], env);
  return null;
}

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
    const ttl = response.headers.has(PARTIAL) ? Math.min(seconds, PARTIAL_CACHE_SECONDS) : seconds;
    response.headers.set('Cache-Control', `public, max-age=${ttl}`);
    ctx.waitUntil(cache.put(key, response.clone()));
  }
  return response;
}

function api(env, path) {
  return fetch(`${env.API_URL}${path}`, { headers: API_HEADERS, signal: AbortSignal.timeout(API_TIMEOUT_MS) });
}

/** GET an API path as JSON: { status, data }. status is 0 and data null when the call failed outright. */
async function getJson(env, path) {
  try {
    const res = await api(env, path);
    return { status: res.status, data: res.ok ? await res.json() : null };
  } catch (error) {
    console.error(`API ${path} failed:`, error);
    return { status: 0, data: null };
  }
}

/** Public (not draft, not deleted) novels by lower-cased id, or null when the list can't be read. */
async function publicNovels(env) {
  const path = (page) => `/api/novel?pageNumber=${page}&pageSize=${NOVEL_LIST_PAGE_SIZE}`;
  const first = await getJson(env, path(1));
  if (!first.data) {
    return null;
  }
  const pages = Math.min(first.data.totalPages || 1, 10);
  const rest = await Promise.all(Array.from({ length: pages - 1 }, (_, i) => getJson(env, path(i + 2))));
  if (rest.some((r) => !r.data)) {
    return null;
  }
  const items = [first, ...rest].flatMap((r) => r.data.items || []);
  return new Map(items.map((n) => [String(n.id).toLowerCase(), n]));
}

// ─── Landing and home pages ───

async function renderLanding(env) {
  const [trending, newest, genres] = await Promise.all([
    getJson(env, `/api/rankings/site-wide/Trending?PageSize=${HOME_LIST_SIZE}&PageNumber=1`),
    getJson(env, `/api/rankings/site-wide/NewArrivals?PageSize=${HOME_LIST_SIZE}&PageNumber=1`),
    getJson(env, '/api/genre'),
  ]);
  if (!trending.data && !newest.data) {
    return null;
  }

  const genreList = genresOrDefault(genres.data);
  return html({
    title: SITE_TITLE,
    description: LANDING_DESCRIPTION,
    url: `${SITE}/`,
    jsonLd: [websiteJsonLd()],
    partial: !trending.data || !newest.data || !genres.data,
    body: `
  ${siteHeader()}
  <main>
    <h1>${escapeHtml(SITE_TITLE)}</h1>
    <p>سرد منصة عربية لقراءة الروايات وكتابتها. يكتب فيها كتّاب عرب رواياتهم الأصلية في الفانتازيا والرومانسية والغموض والأكشن والخيال العلمي والرعب والمغامرة، وينشرونها فصلاً بعد فصل، ويتابعها القرّاء ويقيّمونها ويناقشونها في التعليقات.</p>
    <p>ولكل رواية موسوعة يبني فيها كاتبها عالمها: شخصياتها وأماكنها وفصائلها وأسرارها. ابدأ من <a href="/home">الصفحة الرئيسية</a> أو اختر نوعك المفضل.</p>
    ${novelSection('الروايات الأكثر رواجاً', trending.data?.items)}
    ${novelSection('أحدث الروايات', newest.data?.items)}
    ${genreSection(genreList)}
  </main>`,
  });
}

async function renderHome(env) {
  const [trending, newest, allTime, genres] = await Promise.all([
    getJson(env, `/api/rankings/site-wide/Trending?PageSize=${HOME_LIST_SIZE}&PageNumber=1`),
    getJson(env, `/api/rankings/site-wide/NewArrivals?PageSize=${HOME_LIST_SIZE}&PageNumber=1`),
    getJson(env, `/api/rankings/site-wide/AllTime?PageSize=${HOME_LIST_SIZE}&PageNumber=1`),
    getJson(env, '/api/genre'),
  ]);
  if (!trending.data && !newest.data) {
    return null;
  }

  return html({
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: `${SITE}/home`,
    jsonLd: [websiteJsonLd()],
    partial: !trending.data || !newest.data || !allTime.data || !genres.data,
    body: `
  ${siteHeader()}
  <main>
    <h1>اكتشف الروايات العربية على سرد</h1>
    <p>${escapeHtml(HOME_DESCRIPTION)}</p>
    ${novelSection('الأكثر رواجاً هذا الأسبوع', trending.data?.items)}
    ${novelSection('وصل حديثاً', newest.data?.items)}
    ${novelSection('الأكثر قراءة', allTime.data?.items)}
    ${genreSection(genresOrDefault(genres.data))}
  </main>`,
  });
}

function novelSection(heading, novels) {
  if (!novels?.length) {
    return '';
  }
  return `<section>
      <h2>${escapeHtml(heading)}</h2>
      <ol>
${novels.map(novelListItem).join('\n')}
      </ol>
    </section>`;
}

/** A novel in a list: title link, genres and the start of the summary. */
function novelListItem(novel) {
  const genres = (novel.genresList || [])
    .filter((g) => g?.slug)
    .map((g) => `<a href="${genrePath(g.slug)}">${escapeHtml(translateGenre(g.name))}</a>`)
    .join('، ');
  const summary = truncate(novel.summary, 200);
  return `        <li><a href="${novelPath(novel.slug)}">${escapeHtml(novel.title)}</a>${genres ? ` - ${genres}` : ''}${summary ? `<p>${escapeHtml(summary)}</p>` : ''}</li>`;
}

function genreSection(genres, current) {
  return `<section>
      <h2>تصفح حسب النوع</h2>
      <ul>
${genres
  .filter((g) => g.slug !== current)
  .map((g) => `        <li><a href="${genrePath(g.slug)}">روايات ${escapeHtml(translateGenre(g.name))}</a>${g.description ? `<p>${escapeHtml(g.description)}</p>` : ''}</li>`)
  .join('\n')}
      </ul>
    </section>`;
}

function genresOrDefault(apiGenres) {
  return Array.isArray(apiGenres) && apiGenres.length ? apiGenres : GENRES;
}

// ─── Genre page ───

async function renderGenre(rawSlug, params, env) {
  const slug = safeDecode(rawSlug);
  if (!slug || !/^[a-z0-9-]{1,64}$/.test(slug)) {
    return notFound();
  }

  // As on the web app: ?page=N (N > 1) is its own page; other filters are views of the genre's first page.
  const pageParam = params.get('page');
  const page = /^[1-9][0-9]{0,3}$/.test(pageParam || '') ? Number(pageParam) : 1;
  const sorting = params.get('sorting');
  const isDefaultView = (!sorting || sorting === 'popular') && !params.has('completed');

  const [novelsRes, genresRes] = await Promise.all([
    getJson(env, `/api/genre/${encodeURIComponent(slug)}/novels?PageNumber=${page}&PageSize=${GENRE_PAGE_SIZE}&Sorting=popular`),
    getJson(env, '/api/genre'),
  ]);
  if (novelsRes.status === 404) {
    return notFound();
  }
  if (!novelsRes.data) {
    return null;
  }

  const { items = [], totalItemsCount = 0, totalPages = 0 } = novelsRes.data;
  if (page > Math.max(1, totalPages)) {
    return notFound();
  }

  const genres = genresOrDefault(genresRes.data);
  const genre = genres.find((g) => g.slug === slug) || GENRES.find((g) => g.slug === slug) || { name: slug, slug };
  const label = translateGenre(genre.name);
  const pageUrl = (n) => `${SITE}${genrePath(slug)}${n > 1 ? `?page=${n}` : ''}`;
  const url = isDefaultView ? pageUrl(page) : pageUrl(1);
  const title = genrePageTitle(label, page);
  const description = genrePageDescription(label, page, totalPages);
  const offset = (page - 1) * GENRE_PAGE_SIZE;

  const collection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `روايات ${label}`,
    url,
    description,
    inLanguage: 'ar',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${SITE}/` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: totalItemsCount,
      itemListElement: items.map((n, i) => ({
        '@type': 'ListItem',
        position: offset + i + 1,
        url: `${SITE}${novelPath(n.slug)}`,
        name: n.title,
      })),
    },
  };

  const pager = totalPages > 1
    ? `<nav aria-label="الصفحات">
      ${page > 1 ? `<a rel="prev" href="${pageUrl(page - 1).slice(SITE.length)}">الصفحة السابقة</a>` : ''}
      ${Array.from({ length: totalPages }, (_, i) => i + 1)
        .map((n) => (n === page ? `<span aria-current="page">${n}</span>` : `<a href="${pageUrl(n).slice(SITE.length)}">${n}</a>`))
        .join(' ')}
      ${page < totalPages ? `<a rel="next" href="${pageUrl(page + 1).slice(SITE.length)}">الصفحة التالية</a>` : ''}
    </nav>`
    : '';

  return html({
    title,
    description,
    url,
    // A genre without novels yet has nothing to show; its page returns once one is published.
    robots: totalItemsCount > 0 ? undefined : 'noindex, follow',
    jsonLd: [collection, breadcrumbs([{ name: `روايات ${label}`, url: pageUrl(1) }])],
    head: [
      page > 1 && isDefaultView ? `<link rel="prev" href="${pageUrl(page - 1)}">` : '',
      page < totalPages && isDefaultView ? `<link rel="next" href="${pageUrl(page + 1)}">` : '',
    ].join(''),
    partial: !genresRes.data,
    body: `
  ${siteHeader([{ name: `روايات ${label}` }])}
  <main>
    <h1>روايات ${escapeHtml(label)}${page > 1 ? ` - صفحة ${page}` : ''}</h1>
    ${genre.description ? `<p>${escapeHtml(genre.description)}</p>` : ''}
    <p>${totalItemsCount} رواية في هذا النوع.</p>
    ${items.length ? `<ol start="${offset + 1}">\n${items.map(novelListItem).join('\n')}\n    </ol>` : '<p>لا توجد روايات منشورة في هذا النوع بعد.</p>'}
    ${pager}
    ${genreSection(genres, slug)}
  </main>`,
  });
}

// ─── Profile page ───

async function renderProfile(rawUserName, env) {
  const userName = safeDecode(rawUserName);
  if (!userName || userName.length > 256) {
    return notFound();
  }

  const profileRes = await getJson(env, `/api/User/${encodeURIComponent(userName)}`);
  if (profileRes.status === 404) {
    return notFound();
  }
  if (!profileRes.data) {
    return null;
  }
  const user = profileRes.data;

  const worksRes = await getJson(env, `/api/myworks/user/${encodeURIComponent(user.id)}?pageSize=${PROFILE_NOVELS}&pageNumber=1`);
  if (!worksRes.data) {
    // Without the novels we can't tell whether the page is worth indexing: let the app answer instead.
    return null;
  }
  const novels = (worksRes.data.items || []).filter((n) => !n.isDraft);
  const novelCount = worksRes.data.totalItemsCount || novels.length;

  const name = (user.displayName || '').trim() || user.userName;
  const url = `${SITE}${profilePath(user.userName)}`;
  const bio = (user.userBio || '').trim();
  const photo = httpUrl(user.profilePhoto);
  const sameAs = [user.facebookUrl, user.twitterUrl].map(httpUrl).filter(Boolean);
  const isAuthor = novels.length > 0;
  const title = profileTitle(name, isAuthor);
  const description = truncate(bio, 160)
    || (isAuthor
      ? truncate(`${name} على سرد: ${novels.map((n) => n.title).join('، ')}`, 160)
      : `${name} (@${user.userName}) على سرد، منصة القراءة والكتابة العربية.`);

  const person = {
    '@type': 'Person',
    name,
    alternateName: `@${user.userName}`,
    identifier: user.userName,
    url,
    image: photo || undefined,
    description: bio || undefined,
    sameAs: sameAs.length ? sameAs : undefined,
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/FollowAction',
      userInteractionCount: user.totalFollowers || 0,
    },
    agentInteractionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/WriteAction',
      userInteractionCount: novelCount,
    },
  };
  const profilePage = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url,
    name: title,
    inLanguage: 'ar',
    dateCreated: toIso(user.createdAt),
    mainEntity: person,
  };

  const novelItems = novels
    .map((n) => {
      const genres = (n.genresList || [])
        .filter((g) => g?.slug)
        .map((g) => `<a href="${genrePath(g.slug)}">${escapeHtml(translateGenre(g.name))}</a>`)
        .join('، ');
      const summary = truncate(n.summary, 200);
      return `        <li><a href="${novelPath(n.slug)}">${escapeHtml(n.title)}</a>${genres ? ` - ${genres}` : ''}${summary ? `<p>${escapeHtml(summary)}</p>` : ''}</li>`;
    })
    .join('\n');

  return html({
    title,
    description,
    url,
    image: DEFAULT_IMAGE,
    ogType: 'profile',
    // Members without a published novel have nothing for search to show.
    robots: isAuthor ? undefined : 'noindex, follow',
    jsonLd: [profilePage, breadcrumbs([{ name, url }])],
    body: `
  ${siteHeader([{ name }])}
  <main>
    <h1>${escapeHtml(name)}</h1>
    <p>@${escapeHtml(user.userName)}</p>
    ${photo ? `<img src="${escapeHtml(photo)}" alt="${escapeHtml(`صورة ${name}`)}" width="160" height="160">` : ''}
    ${bio ? `<p>${escapeHtml(bio)}</p>` : ''}
    ${sameAs.length ? `<p>${sameAs.map((u) => `<a href="${escapeHtml(u)}" rel="nofollow ugc noopener">${escapeHtml(u)}</a>`).join(' ')}</p>` : ''}
    ${isAuthor ? `<h2>روايات ${escapeHtml(name)} (${novelCount})</h2>\n    <ul>\n${novelItems}\n    </ul>` : ''}
  </main>`,
  });
}

// ─── Novel page ───

async function renderNovel(slug, env) {
  const novelRes = await getJson(env, `/api/novel/${slug}`);
  if (novelRes.status === 404) {
    return notFound();
  }
  if (!novelRes.data) {
    return null;
  }
  const novel = novelRes.data;

  const [chaptersRes, wikiRes] = await Promise.all([
    getJson(env, `/api/novel/${novel.id}/chapter`),
    getJson(env, `/api/novels/${novel.id}/entities?pageNumber=1&pageSize=${WIKI_LIST_SIZE}`),
  ]);
  const chapters = chaptersRes.data || [];
  const wikiEntries = (wikiRes.data?.items || []).filter((e) => hasRealWikiName(e.name));

  const novelPathname = novelPath(novel.slug);
  const url = `${SITE}${novelPathname}`;
  const image = shareImageUrl(novel.slug, novel.coverImageUrl);
  const cover = coverImageUrl(novel.coverImageUrl);
  const author = (novel.author?.displayName || '').trim();
  const authorPath = novel.author?.userName ? profilePath(novel.author.userName) : null;
  const genres = (novel.genresList || []).filter((g) => g?.slug);
  const rating = novel.reviewCount > 0 && novel.totalAverageScore >= 1 ? Math.round(novel.totalAverageScore * 100) / 100 : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: novel.title,
    url,
    image: cover || image,
    author: { '@type': 'Person', name: author, url: authorPath ? `${SITE}${authorPath}` : undefined },
    description: novel.summary || '',
    genre: genres.map((g) => translateGenre(g.name)),
    inLanguage: 'ar',
    datePublished: toIso(novel.createdAt),
    dateModified: toIso(novel.lastUpdatedAt || novel.createdAt),
    aggregateRating: rating
      ? { '@type': 'AggregateRating', ratingValue: rating, bestRating: 5, worstRating: 1, ratingCount: novel.reviewCount }
      : undefined,
  };

  const chapterLinks = chapters
    .map((c) => `      <li><a href="${novelPathname}/chapter/${c.id}">${escapeHtml(c.title)}</a></li>`)
    .join('\n');
  const genreLinks = genres.map((g) => `<a href="${genrePath(g.slug)}">${escapeHtml(translateGenre(g.name))}</a>`).join('، ');
  const firstGenre = genres[0];

  return html({
    title: `${novel.title} - سرد`,
    // Link previews show og:title and og:description under the image, which carries no text.
    ogTitle: author ? `${novel.title.trim()} - ${author}` : novel.title.trim(),
    description: truncate(novel.summary, 160),
    url,
    image: { url: image, type: 'image/jpeg', width: 1200, height: 630, alt: `غلاف رواية ${novel.title}` },
    ogType: 'book',
    jsonLd: [
      jsonLd,
      breadcrumbs([
        ...(firstGenre ? [{ name: `روايات ${translateGenre(firstGenre.name)}`, url: `${SITE}${genrePath(firstGenre.slug)}` }] : []),
        { name: novel.title, url },
      ]),
    ],
    partial: !chaptersRes.data || !wikiRes.data,
    body: `
  ${siteHeader([...(firstGenre ? [{ name: `روايات ${translateGenre(firstGenre.name)}`, path: genrePath(firstGenre.slug) }] : []), { name: novel.title }])}
  <main>
    <h1>${escapeHtml(novel.title)}</h1>
    <p>بقلم: ${authorPath ? `<a href="${authorPath}" rel="author">${escapeHtml(author)}</a>` : escapeHtml(author)}</p>
    ${genreLinks ? `<p>التصنيف: ${genreLinks}</p>` : ''}
    ${rating ? `<p>التقييم: ${rating} من 5 (${novel.reviewCount} ${novel.reviewCount === 1 ? 'تقييم' : 'تقييمات'})</p>` : ''}
    ${cover ? `<img src="${escapeHtml(cover)}" alt="${escapeHtml(`غلاف رواية ${novel.title}`)}" width="320" height="480">` : ''}
    <p>${escapeHtml(novel.summary || '')}</p>
    ${wikiEntries.length ? `<p><a href="/novel/${novel.id}/wikipedia">موسوعة الرواية</a>: ${wikiEntries.slice(0, 10).map((e) => `<a href="/novel/${novel.id}/wikipedia/${e.id}">${escapeHtml(e.name.trim())}</a>`).join('، ')}</p>` : ''}
    ${chapters.length ? `<h2>الفصول (${chapters.length})</h2>\n    <ol>\n${chapterLinks}\n    </ol>` : ''}
  </main>`,
  });
}

// ─── Chapter page ───

async function renderChapter(slug, chapterId, env) {
  const novelRes = await getJson(env, `/api/novel/${slug}`);
  if (novelRes.status === 404) {
    return notFound();
  }
  if (!novelRes.data) {
    return null;
  }
  const novel = novelRes.data;

  const [chapterRes, chaptersRes] = await Promise.all([
    getJson(env, `/api/novel/${novel.id}/chapter/${chapterId}`),
    getJson(env, `/api/novel/${novel.id}/chapter`),
  ]);
  if (chapterRes.status === 404) {
    return notFound();
  }
  if (!chapterRes.data) {
    return null;
  }
  const chapter = chapterRes.data;
  const chapters = chaptersRes.data || [];

  const novelPathname = novelPath(novel.slug);
  const novelUrl = `${SITE}${novelPathname}`;
  const url = `${novelUrl}/chapter/${chapterId.toLowerCase()}`;
  const position = chapters.findIndex((c) => c.id === chapterId.toLowerCase());
  const previous = position > 0 ? chapters[position - 1] : null;
  const next = position >= 0 && position < chapters.length - 1 ? chapters[position + 1] : null;
  const author = novel.author?.displayName || '';
  const authorPath = novel.author?.userName ? profilePath(novel.author.userName) : null;

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
    author: { '@type': 'Person', name: author, url: authorPath ? `${SITE}${authorPath}` : undefined },
    isPartOf: { '@type': 'Book', name: novel.title, url: novelUrl },
    isAccessibleForFree: !chapter.isLocked,
  };

  const pager = [
    previous ? `<a rel="prev" href="${novelPathname}/chapter/${previous.id}">الفصل السابق: ${escapeHtml(previous.title)}</a>` : '',
    `<a href="${novelPathname}">فهرس الفصول</a>`,
    next ? `<a rel="next" href="${novelPathname}/chapter/${next.id}">الفصل التالي: ${escapeHtml(next.title)}</a>` : '',
  ].filter(Boolean).join(' | ');

  return html({
    title: `${chapter.title} - ${novel.title} | سرد`,
    description: truncate(chapter.isLocked ? novel.summary : paragraphs.join(' '), 160),
    url,
    image: { url: shareImageUrl(novel.slug, novel.coverImageUrl), type: 'image/jpeg', width: 1200, height: 630, alt: `غلاف رواية ${novel.title}` },
    ogType: 'article',
    jsonLd: [jsonLd, breadcrumbs([{ name: novel.title, url: novelUrl }, { name: chapter.title, url }])],
    partial: !chaptersRes.data,
    body: `
  ${siteHeader([{ name: novel.title, path: novelPathname }, { name: chapter.title }])}
  <main>
    <article>
    <h1>${escapeHtml(chapter.title)}</h1>
    <p>من رواية <a href="${novelPathname}">${escapeHtml(novel.title)}</a> بقلم ${authorPath ? `<a href="${authorPath}" rel="author">${escapeHtml(author)}</a>` : escapeHtml(author)}</p>
    ${text}
    </article>
    <nav>${pager}</nav>
  </main>`,
  });
}

// ─── Wiki (موسوعة الرواية) ───

// Wiki URLs carry the novel's id, and the API serves a wiki by id whatever the novel's state, so every wiki page first
// checks the id against the public novel list: drafts, deleted and unknown novels get a 404.
async function renderWiki(rawNovelId, env) {
  const novelId = safeDecode(rawNovelId).toLowerCase();
  if (!GUID.test(novelId)) {
    return notFound();
  }

  const [novels, wikiRes] = await Promise.all([
    publicNovels(env),
    getJson(env, `/api/novels/${novelId}/entities?pageNumber=1&pageSize=${WIKI_LIST_SIZE}`),
  ]);
  if (!novels) {
    return null;
  }
  const novel = novels.get(novelId);
  if (!novel) {
    return notFound();
  }
  if (!wikiRes.data) {
    return null;
  }

  const entries = (wikiRes.data.items || []).filter((e) => hasRealWikiName(e.name));
  const novelUrl = `${SITE}${novelPath(novel.slug)}`;
  const url = `${SITE}/novel/${novelId}/wikipedia`;
  const title = `موسوعة رواية ${novel.title} | سرد`;
  const sections = groupBySection(entries);
  const names = entries.map((e) => e.name.trim());
  const firstLine = entries.map((e) => (e.shortDescription || '').trim()).find((line) => countLetters(line) >= 20);
  const description = truncate(
    entries.length
      ? `موسوعة رواية ${novel.title} على سرد: ${names.join('، ')}.${firstLine ? ` ${firstLine}` : ''}`
      : `موسوعة رواية ${novel.title} على سرد.`,
    160,
  );

  const collection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `موسوعة رواية ${novel.title}`,
    url,
    description,
    inLanguage: 'ar',
    about: { '@type': 'Book', name: novel.title, url: novelUrl },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: entries.length,
      itemListElement: entries.map((e, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${url}/${e.id}`,
        name: e.name.trim(),
      })),
    },
  };

  const sectionHtml = sections
    .map(([section, list]) => `<section>
      <h2>${escapeHtml(section)}</h2>
      <ul>
${list.map((e) => `        <li><a href="/novel/${novelId}/wikipedia/${e.id}">${escapeHtml(e.name.trim())}</a>${e.shortDescription?.trim() ? `: ${escapeHtml(e.shortDescription.trim())}` : ''}</li>`).join('\n')}
      </ul>
    </section>`)
    .join('\n    ');

  return html({
    title,
    description,
    url,
    // Worth indexing once at least one entry is (see src/utils/wiki-pages.js); otherwise the list is only a way in.
    robots: entries.some(isIndexableWikiListEntry) ? undefined : 'noindex, follow',
    jsonLd: [collection, breadcrumbs([{ name: novel.title, url: novelUrl }, { name: 'موسوعة الرواية', url }])],
    body: `
  ${siteHeader([{ name: novel.title, path: novelPath(novel.slug) }, { name: 'موسوعة الرواية' }])}
  <main>
    <h1>موسوعة رواية ${escapeHtml(novel.title)}</h1>
    <p>شخصيات عالم رواية <a href="${novelPath(novel.slug)}">${escapeHtml(novel.title)}</a> وأماكنه وتفاصيله، كما كتبها مؤلفها.</p>
    ${sectionHtml || '<p>لا توجد مداخل في هذه الموسوعة بعد.</p>'}
  </main>`,
  });
}

async function renderWikiEntry(rawNovelId, rawEntityId, env) {
  const novelId = safeDecode(rawNovelId).toLowerCase();
  const entityId = safeDecode(rawEntityId).toLowerCase();
  if (!GUID.test(novelId) || !GUID.test(entityId)) {
    return notFound();
  }

  const [novels, entityRes] = await Promise.all([
    publicNovels(env),
    getJson(env, `/api/novels/${novelId}/entities/${entityId}`),
  ]);
  if (!novels) {
    return null;
  }
  const novel = novels.get(novelId);
  // The API looks entries up by their own id alone, so an entry of another novel must not show under this one.
  if (!novel || entityRes.status === 404 || (entityRes.data && String(entityRes.data.novelId).toLowerCase() !== novelId)) {
    return notFound();
  }
  if (!entityRes.data) {
    return null;
  }
  const entity = entityRes.data;

  // Placeholder names (a lone ".") still get a readable title; such entries are noindex anyway.
  const name = hasRealWikiName(entity.name) ? entity.name.trim() : 'مدخل بلا اسم';
  const section = (entity.section || '').trim();
  const novelPathname = novelPath(novel.slug);
  const novelUrl = `${SITE}${novelPathname}`;
  const wikiPath = `/novel/${novelId}/wikipedia`;
  const url = `${SITE}${wikiPath}/${entityId}`;
  const shortDescription = (entity.shortDescription || '').trim();
  const paragraphs = String(entity.description || '').split(/\r?\n\s*\r?\n/).map((p) => p.trim()).filter(Boolean);
  const image = httpUrl(entity.imageUrl);
  const attributes = Object.entries(entity.attributes || {}).filter(([key]) => key.trim());
  const articles = (entity.articles || []).filter((a) => a?.title || a?.content);
  const relationships = (entity.relationships || []).filter((r) => r?.targetEntityId && hasRealWikiName(r.targetEntityName));
  const gallery = (entity.galleryImages || []).filter((g) => httpUrl(g?.imageUrl));

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: truncate(`${name} - موسوعة رواية ${novel.title}`, 110),
    url,
    description: truncate(shortDescription || entity.description, 160) || undefined,
    image: image || undefined,
    inLanguage: 'ar',
    datePublished: toIso(entity.createdAt),
    dateModified: toIso(entity.updatedAt || entity.createdAt),
    about: { '@type': 'Thing', name, description: shortDescription || undefined },
    isPartOf: { '@type': 'Book', name: novel.title, url: novelUrl },
  };

  return html({
    title: `${name} - موسوعة رواية ${novel.title} | سرد`,
    description: truncate(shortDescription || entity.description || `${name} في موسوعة رواية ${novel.title} على سرد.`, 160),
    url,
    image: image ? { url: image, alt: name } : DEFAULT_IMAGE,
    ogType: 'article',
    robots: isIndexableWikiEntity(entity) ? undefined : 'noindex, follow',
    jsonLd: [
      article,
      breadcrumbs([
        { name: novel.title, url: novelUrl },
        { name: 'موسوعة الرواية', url: `${SITE}${wikiPath}` },
        { name, url },
      ]),
    ],
    body: `
  ${siteHeader([{ name: novel.title, path: novelPathname }, { name: 'موسوعة الرواية', path: wikiPath }, { name }])}
  <main>
    <article>
    <h1>${escapeHtml(name)}</h1>
    <p>${section ? `${escapeHtml(section)} في ` : ''}موسوعة رواية <a href="${novelPathname}">${escapeHtml(novel.title)}</a></p>
    ${entity.role?.trim() ? `<p>الدور: ${escapeHtml(entity.role.trim())}</p>` : ''}
    ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(name)}">` : ''}
    ${shortDescription ? `<p><strong>${escapeHtml(shortDescription)}</strong></p>` : ''}
    ${paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('\n    ')}
    ${attributes.length ? `<h2>السمات</h2>\n    <dl>\n${attributes.map(([key, value]) => `      <dt>${escapeHtml(key)}</dt><dd>${escapeHtml(attributeText(value))}</dd>`).join('\n')}\n    </dl>` : ''}
    ${articles.map((a) => `<section>\n      <h2>${escapeHtml(a.title || '')}</h2>\n      ${htmlToText(a.content).split('\n').filter(Boolean).map((p) => `<p>${escapeHtml(p)}</p>`).join('\n      ')}\n    </section>`).join('\n    ')}
    ${relationships.length ? `<h2>العلاقات</h2>\n    <ul>\n${relationships.map((r) => `      <li><a href="${wikiPath}/${String(r.targetEntityId).toLowerCase()}">${escapeHtml(r.targetEntityName.trim())}</a>${r.label ? `: ${escapeHtml(r.label)}` : ''}</li>`).join('\n')}\n    </ul>` : ''}
    ${gallery.length ? `<h2>معرض الصور</h2>\n    ${gallery.map((g, i) => `<img src="${escapeHtml(httpUrl(g.imageUrl))}" alt="${escapeHtml(g.caption || `${name} - صورة ${i + 1}`)}" loading="lazy">`).join('\n    ')}` : ''}
    </article>
    <p><a href="${wikiPath}">العودة إلى موسوعة رواية ${escapeHtml(novel.title)}</a></p>
  </main>`,
  });
}

/** [section, entries] in the order the sections first appear (the API lists entries by creation). */
function groupBySection(entries) {
  const sections = new Map();
  for (const entry of entries) {
    const section = (entry.section || '').trim() || 'مداخل';
    if (!sections.has(section)) sections.set(section, []);
    sections.get(section).push(entry);
  }
  return [...sections];
}

function attributeText(value) {
  if (Array.isArray(value)) return value.map(attributeText).join('، ');
  if (value && typeof value === 'object') return Object.values(value).map(attributeText).join('، ');
  return value == null ? '' : String(value);
}

// ─── Shared HTML ───

/**
 * A crawler page. robots defaults to indexable; image is { url, alt, type?, width?, height? }; head is extra <head>
 * markup; partial marks a page made without all of its data (cached briefly).
 */
function html({ title, ogTitle, description, url, image = DEFAULT_IMAGE, ogType = 'website', robots, jsonLd = [], head = '', partial = false, body }) {
  const robotsValue = robots || 'index, follow, max-image-preview:large';
  const scripts = jsonLd
    .map((data) => `<script type="application/ld+json">${safeJson(data)}</script>`)
    .join('\n  ');
  const imageMeta = [
    `<meta property="og:image" content="${escapeHtml(image.url)}">`,
    image.type ? `<meta property="og:image:type" content="${image.type}">` : '',
    image.width ? `<meta property="og:image:width" content="${image.width}">` : '',
    image.height ? `<meta property="og:image:height" content="${image.height}">` : '',
    `<meta property="og:image:alt" content="${escapeHtml(image.alt || title)}">`,
  ].filter(Boolean).join('\n  ');

  const page = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="${robotsValue}">
  <link rel="canonical" href="${escapeHtml(url)}">
  ${head}
  <meta property="og:title" content="${escapeHtml(ogTitle || title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  ${imageMeta}
  <meta property="og:url" content="${escapeHtml(url)}">
  <meta property="og:type" content="${ogType}">
  <meta property="og:locale" content="ar_AR">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="fb:app_id" content="966242223397117">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(ogTitle || title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image.url)}">
  ${scripts}
</head>
<body>${body}
  ${siteFooter()}
</body>
</html>`;

  const headers = {
    'Content-Type': 'text/html; charset=utf-8',
    'X-Robots-Tag': robotsValue,
    'X-Rendered-By': 'Cloudflare-Worker',
  };
  if (partial) {
    headers[PARTIAL] = '1';
  }
  return new Response(page, { headers });
}

/** Site links and the breadcrumb trail ({ name, path? }; the last item is the current page). */
function siteHeader(trail = []) {
  const crumbs = trail
    .map((item) => (item.path ? `<a href="${escapeHtml(item.path)}">${escapeHtml(item.name)}</a>` : `<span>${escapeHtml(item.name)}</span>`))
    .join(' › ');
  return `<header>
    <nav aria-label="سرد"><a href="/">سرد</a> | <a href="/home">الرئيسية</a> | <a href="/leaderboard">المتصدرون</a></nav>
    ${crumbs ? `<nav aria-label="مسار التصفح"><a href="/">سرد</a> › ${crumbs}</nav>` : ''}
  </header>`;
}

function siteFooter() {
  return `<footer>
    <nav aria-label="الأنواع">تصفح الروايات حسب النوع: ${GENRES.map((g) => `<a href="${genrePath(g.slug)}">${escapeHtml(translateGenre(g.name))}</a>`).join(' | ')}</nav>
    <p><a href="/">سرد - منصة القراءة والكتابة العربية</a></p>
  </footer>`;
}

function notFound() {
  return new Response(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8"><meta name="robots" content="noindex"><title>الصفحة غير موجودة - سرد</title></head>
<body><h1>الصفحة غير موجودة</h1><p><a href="/">العودة إلى سرد</a></p></body>
</html>`, {
    status: 404,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex', 'X-Rendered-By': 'Cloudflare-Worker' },
  });
}

function breadcrumbs(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: SITE_NAME, url: `${SITE}/` }, ...items].map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function novelPath(slug) {
  return `/novel/${encodeURIComponent(slug)}`;
}

function genrePath(slug) {
  return `/genre/${encodeURIComponent(slug)}`;
}

function profilePath(userName) {
  return `/profile/${encodeURIComponent(userName)}`;
}

// ─── Sitemap ───

// Everything a search engine should index: home pages, genres, novels and their chapters, the authors' profiles, and
// the wiki pages with real content. An API from before the author/genre/wiki fields still gives novels and chapters,
// with the genres from the genre list.
async function renderSitemap(env, part) {
  const urls = await sitemapUrls(env);
  if (!urls) {
    return new Response('Sitemap temporarily unavailable', { status: 503, headers: { 'Retry-After': '600' } });
  }

  const parts = Math.ceil(urls.length / SITEMAP_MAX_URLS);
  if (part === undefined) {
    return xml(parts <= 1 ? urlset(urls) : sitemapIndex(parts, latest(urls.map((u) => u.lastmod))));
  }
  const n = Number(part);
  if (parts <= 1 || n > parts) {
    return new Response('Not found', { status: 404 });
  }
  return xml(urlset(urls.slice((n - 1) * SITEMAP_MAX_URLS, n * SITEMAP_MAX_URLS)));
}

async function sitemapUrls(env) {
  const [seo, genresRes] = await Promise.all([getJson(env, '/api/seo/sitemap'), getJson(env, '/api/genre')]);
  let novels = seo.data;
  if (!Array.isArray(novels)) {
    // Older API without /api/seo/sitemap: novels only.
    const legacy = await getJson(env, '/api/novel?pageNumber=1&pageSize=1000');
    if (!legacy.data) {
      return null;
    }
    novels = (legacy.data.items || []).map((n) => ({ slug: n.slug, lastModified: n.updatedAt || n.lastUpdatedAt || n.createdAt, chapters: [] }));
  }

  const newest = latest(novels.map((n) => n.lastModified));
  const urls = [
    { loc: `${SITE}/`, lastmod: newest, priority: '1.0' },
    { loc: `${SITE}/home`, lastmod: newest, priority: '0.9' },
    { loc: `${SITE}/leaderboard`, priority: '0.5' },
  ];

  // Genres: the ones that have novels, when the API says which; otherwise every genre.
  const genres = genresOrDefault(genresRes.data);
  const withGenres = novels.some((n) => Array.isArray(n.genres));
  const genreModified = new Map();
  for (const novel of novels) {
    for (const genre of novel.genres || []) {
      genreModified.set(genre, latest([genreModified.get(genre), novel.lastModified]));
    }
  }
  const genreSlugs = withGenres
    ? [...new Set([...genres.map((g) => g.slug).filter((s) => genreModified.has(s)), ...genreModified.keys()])]
    : genres.map((g) => g.slug);
  for (const slug of genreSlugs) {
    urls.push({ loc: `${SITE}${genrePath(slug)}`, lastmod: genreModified.get(slug), priority: '0.7' });
  }

  const authors = new Map();
  for (const novel of novels) {
    const novelLoc = `${SITE}${novelPath(novel.slug)}`;
    urls.push({ loc: novelLoc, lastmod: novel.lastModified, priority: '0.8' });
    for (const chapter of novel.chapters || []) {
      urls.push({ loc: `${novelLoc}/chapter/${chapter.id}`, lastmod: chapter.lastModified, priority: '0.6' });
    }
    if (novel.id && novel.wiki?.length) {
      const wikiLoc = `${SITE}/novel/${String(novel.id).toLowerCase()}/wikipedia`;
      urls.push({ loc: wikiLoc, lastmod: latest(novel.wiki.map((w) => w.lastModified)), priority: '0.5' });
      for (const entry of novel.wiki) {
        urls.push({ loc: `${wikiLoc}/${String(entry.id).toLowerCase()}`, lastmod: entry.lastModified, priority: '0.4' });
      }
    }
    if (novel.authorUserName) {
      authors.set(novel.authorUserName, latest([authors.get(novel.authorUserName), novel.lastModified]));
    }
  }
  for (const [userName, lastmod] of authors) {
    urls.push({ loc: `${SITE}${profilePath(userName)}`, lastmod, priority: '0.5' });
  }

  return urls;
}

function urlset(urls) {
  const lines = urls.map(({ loc, lastmod, priority }) =>
    `  <url><loc>${escapeHtml(loc)}</loc>${toIso(lastmod) ? `<lastmod>${toIso(lastmod)}</lastmod>` : ''}<priority>${priority}</priority></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${lines.join('\n')}
</urlset>`;
}

function sitemapIndex(parts, lastmod) {
  const lines = Array.from({ length: parts }, (_, i) =>
    `  <sitemap><loc>${SITE}/sitemap-${i + 1}.xml</loc>${toIso(lastmod) ? `<lastmod>${toIso(lastmod)}</lastmod>` : ''}</sitemap>`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${lines.join('\n')}
</sitemapindex>`;
}

function xml(body) {
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'X-Rendered-By': 'Cloudflare-Worker' },
  });
}

/** The latest of some API timestamps (as given), or undefined. */
function latest(values) {
  let best;
  let bestTime = -Infinity;
  for (const value of values) {
    const time = Date.parse(toIso(value) || '');
    if (time > bestTime) {
      best = value;
      bestTime = time;
    }
  }
  return best;
}

// ─── Share image ───

// The API stores each cover as novel-covers/{novelId}/{coverId}/{width}.webp next to og.jpg, a ready-made 1200x630
// share image (the cover on a blurred copy of itself, with the Sard wordmark). This route serves that file from the
// site's own domain so previews show sardnovels.com and the edge caches it; the ?v= in og:image changes with the
// cover, so a new cover is a new cache entry for Cloudflare and for Facebook/WhatsApp.
const STANDARD_COVER = /\/novel-covers\/[0-9a-fA-F-]{36}\/([0-9a-f]{32})\/[1-9][0-9]{1,3}\.webp$/;

async function renderOgImage(slug, env) {
  const { status, data: novel } = await getJson(env, `/api/novel/${slug}`);
  if (status === 404) {
    return new Response('Novel not found', { status: 404 });
  }
  if (!novel) {
    // The API is down or failing: stand in with the default image, briefly (not for the week a real image gets).
    return fallbackShareImage(true);
  }
  const shareUrl = standardShareImage(novel.coverImageUrl);
  if (!shareUrl) {
    // No converted cover yet: the default image is this novel's share image until its cover (and so ?v=) changes.
    return fallbackShareImage(false);
  }
  const res = await fetch(shareUrl).catch(() => null);
  if (res?.ok) {
    return new Response(res.body, { headers: { 'Content-Type': 'image/jpeg' } });
  }
  console.error(`Share image missing for ${slug}: ${res?.status} ${shareUrl}`);
  return fallbackShareImage(true);
}

/** The branded default image; partial when it stands in for an image we failed to get (cached briefly). */
async function fallbackShareImage(partial) {
  const res = await fetch(DEFAULT_SHARE_IMAGE).catch(() => null);
  // The site answers unknown paths with the app's HTML, so check that this really is the image.
  if (!res?.ok || !(res.headers.get('content-type') || '').startsWith('image/')) {
    return Response.redirect(`${SITE}/logo.png`, 302);
  }
  const headers = { 'Content-Type': 'image/jpeg' };
  if (partial) {
    headers[PARTIAL] = '1';
  }
  return new Response(res.body, { headers });
}

/** og.jpg next to a standard cover, or null for a legacy (not yet converted) cover. */
function standardShareImage(url) {
  const clean = String(url || '').replace(INVISIBLE, '');
  return STANDARD_COVER.test(clean) ? clean.slice(0, clean.lastIndexOf('/') + 1) + 'og.jpg' : null;
}

/** og:image for a novel: this worker's route, versioned by the cover so a changed cover is fetched again. */
function shareImageUrl(slug, coverUrl) {
  return `${SITE}/api/og/novel/${encodeURIComponent(slug)}?v=${coverVersion(coverUrl)}`;
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

/** A path segment as text; '' when it isn't valid percent-encoding. */
function safeDecode(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return '';
  }
}

/** The URL when it is an absolute http(s) URL, otherwise null (user-supplied links and images). */
function httpUrl(value) {
  const text = String(value || '').trim();
  return /^https?:\/\/[^\s"<>]+$/i.test(text) ? text : null;
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
