// Cloudflare Worker for SEO Bot Detection & Pre-rendering + Dynamic OG Image Generation
// Caches rendered HTML for 1 day (86400 seconds)

import { ImageResponse } from 'workers-og';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // ─── Dynamic Sitemap Route ───
    if (url.pathname === '/sitemap.xml') {
      return handleSitemap(url, env);
    }
    
    // Handle static assets (images, icons, etc.) - pass through directly
    const isStaticAsset = /\.(ico|png|jpg|jpeg|gif|svg|webp|css|js|woff|woff2|ttf|eot|json|xml|txt)$/i.test(url.pathname);
    
    if (isStaticAsset) {
      // Pass through to Cloudflare Pages for all static assets including favicon.ico
      return fetch(request);
    }

    // ─── OG Image Generation Route ───
    const ogMatch = url.pathname.match(/^\/api\/og\/novel\/(.+)$/);
    if (ogMatch) {
      const slug = ogMatch[1];
      return handleOgImage(slug, url, env);
    }
    
    // Only handle novel pages (NOT entities)
    const isNovelPage = url.pathname.match(/^\/novel\/[^\/]+$/);
    
    if (!isNovelPage) {
      // Not a target page - proxy to Pages
      return fetch(request);
    }
    
    // Check if request is from a search engine bot
    const userAgent = request.headers.get('user-agent') || '';
    const isBot = /googlebot|bingbot|yandex|baiduspider|twitterbot|facebookexternalhit|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkShare|W3C_Validator/i.test(userAgent);
    
    if (!isBot) {
      // Regular user - proxy to Pages (React app)
      return fetch(request);
    }
    
    // Bot detected - serve pre-rendered HTML
    console.log(`Bot detected: ${userAgent} for ${url.pathname}`);
    
    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;
    
    // Check cache first (1 day cache)
    let response = await cache.match(cacheKey);
    
    if (response) {
      console.log('Serving from cache');
      return response;
    }
    
    // Not in cache - generate HTML
    console.log('Generating fresh HTML');
    
    try {
      response = await generateNovelHTML(url, env);
      
      // Cache for 1 day (86400 seconds)
      const responseToCache = new Response(response.body, response);
      responseToCache.headers.set('Cache-Control', 'public, max-age=86400'); // 1 day
      responseToCache.headers.set('X-Robots-Tag', 'index, follow');
      
      // Store in Cloudflare cache
      await cache.put(cacheKey, responseToCache.clone());
      
      return responseToCache;
    } catch (error) {
      console.error('Error generating HTML:', error);
      // On error, fall back to React app
      return env.ASSETS.fetch(request);
    }
  }
};

// ─── OG Image Generation ───

async function handleOgImage(slug, url, env) {
  // Check cache first
  const cacheKey = new Request(url.toString());
  const cache = caches.default;
  
  let cached = await cache.match(cacheKey);
  if (cached) {
    console.log('OG image served from cache');
    return cached;
  }

  try {
    // Fetch novel data
    const novelRes = await fetch(`${env.API_URL}/api/novel/${slug}`);
    if (!novelRes.ok) {
      return new Response('Novel not found', { status: 404 });
    }
    const novel = await novelRes.json();
    
    const title = escapeHtml(novel.title || '');
    const author = escapeHtml(novel.author?.displayName || '');
    const genre = escapeHtml(novel.genresList?.[0]?.name || '');
    const coverUrl = cleanImageUrl(novel.coverImageUrl);

    // Fetch the Arabic font (Noto Sans Arabic Bold)
    const fontUrl = 'https://fonts.gstatic.com/s/notosansarabic/v18/nwpxtLGrOAZMl5nJ_wfgRg3DrWFZWsnVBJ_sS6tlqHHFlhQ5l3sQWIHPqzCfyG2vu3CBFQLaig.ttf';
    const fontData = await fetch(fontUrl).then(r => r.arrayBuffer());

    // Fetch the cover image and convert to base64
    let coverBase64 = '';
    try {
      const coverRes = await fetch(coverUrl);
      if (coverRes.ok) {
        const coverBuffer = await coverRes.arrayBuffer();
        const uint8Array = new Uint8Array(coverBuffer);
        let binary = '';
        for (let i = 0; i < uint8Array.length; i++) {
          binary += String.fromCharCode(uint8Array[i]);
        }
        coverBase64 = `data:image/jpeg;base64,${btoa(binary)}`;
      }
    } catch (e) {
      console.error('Error fetching cover:', e);
    }

    // Build the OG card HTML — Option 1: Book Showcase (RTL layout)
    const html = `
    <div style="display: flex; width: 1200px; height: 630px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); font-family: 'Noto Sans Arabic'; direction: rtl;">
      
      <!-- Right side: Cover Image -->
      <div style="display: flex; align-items: center; justify-content: center; width: 380px; height: 630px; padding: 40px 30px 40px 0;">
        ${coverBase64 ? `
        <div style="display: flex; position: relative;">
          <!-- Book shadow effect -->
          <div style="display: flex; position: absolute; top: 8px; right: -8px; width: 260px; height: 390px; background: rgba(0,0,0,0.4); border-radius: 4px;"></div>
          <!-- Book spine effect -->
          <div style="display: flex; position: absolute; right: -4px; top: 0; width: 8px; height: 390px; background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.3) 100%); border-radius: 2px 0 0 2px;"></div>
          <!-- Cover image -->
          <img src="${coverBase64}" width="260" height="390" style="border-radius: 4px; border: 2px solid rgba(255,255,255,0.15); object-fit: cover;" />
        </div>
        ` : `
        <div style="display: flex; align-items: center; justify-content: center; width: 260px; height: 390px; background: rgba(255,255,255,0.1); border-radius: 4px; border: 2px solid rgba(255,255,255,0.15); color: white; font-size: 24px;">
          سرد
        </div>
        `}
      </div>

      <!-- Left side: Novel Info -->
      <div style="display: flex; flex-direction: column; justify-content: center; flex: 1; padding: 50px 40px 50px 50px; gap: 0;">
        
        <!-- Novel Title -->
        <div style="display: flex; font-size: ${title.length > 40 ? '36' : title.length > 25 ? '42' : '50'}px; font-weight: 700; color: #ffffff; line-height: 1.3; margin-bottom: 20px; text-align: right; max-height: 200px; overflow: hidden;">
          ${title}
        </div>

        <!-- Divider -->
        <div style="display: flex; width: 80px; height: 4px; background: linear-gradient(90deg, #e94560, #c23152); border-radius: 2px; margin-bottom: 24px;"></div>
        
        <!-- Author -->
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
          <div style="display: flex; font-size: 24px; color: #e94560; font-weight: 600;">بقلم</div>
          <div style="display: flex; font-size: 28px; color: #d4d4d4; font-weight: 500;">${author}</div>
        </div>

        ${genre ? `
        <!-- Genre Badge -->
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="display: flex; padding: 8px 20px; background: rgba(233, 69, 96, 0.15); border: 1px solid rgba(233, 69, 96, 0.3); border-radius: 20px; font-size: 18px; color: #e94560;">
            ${translateGenre(genre)}
          </div>
        </div>
        ` : ''}

        <!-- Sard Branding -->
        <div style="display: flex; align-items: center; gap: 10px; margin-top: auto; padding-top: 30px;">
          <div style="display: flex; font-size: 20px; color: rgba(255,255,255,0.4); font-weight: 400;">sardnovels.com</div>
        </div>
      </div>
    </div>`;

    const response = new ImageResponse(html, {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Noto Sans Arabic',
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    });

    // Clone and cache for 7 days (OG images don't change often)
    const responseToCache = new Response(response.body, response);
    responseToCache.headers.set('Cache-Control', 'public, max-age=604800'); // 7 days
    responseToCache.headers.set('Content-Type', 'image/png');
    
    await cache.put(cacheKey, responseToCache.clone());
    
    return responseToCache;
  } catch (error) {
    console.error('Error generating OG image:', error);
    // Fallback: redirect to logo
    return Response.redirect('https://www.sardnovels.com/logo.png', 302);
  }
}

// ─── Novel HTML Generation (for SEO bots) ───

async function generateNovelHTML(url, env) {
  const slug = url.pathname.split('/')[2];
  
  try {
    // Fetch novel data from your API
    const novel = await fetch(`${env.API_URL}/api/novel/${slug}`)
      .then(r => r.json());
    
    const ogImageUrl = `https://www.sardnovels.com/api/og/novel/${slug}`;
    
    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(novel.title)} - سرد</title>
  <meta name="description" content="${escapeHtml(novel.summary?.substring(0, 160) || '')}">
  <meta property="og:title" content="${escapeHtml(novel.title)}">
  <meta property="og:description" content="بقلم: ${escapeHtml(novel.author?.displayName || '')}">
  <meta property="og:image" content="${ogImageUrl}">
  <meta property="og:image:secure_url" content="${ogImageUrl}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(novel.title)} - سرد">
  <meta property="og:url" content="https://www.sardnovels.com/novel/${slug}">
  <meta property="og:type" content="book">
  <meta property="og:locale" content="ar_AR">
  <meta property="og:site_name" content="سرد">
  <meta property="fb:app_id" content="966242223397117">
  <link rel="canonical" href="https://www.sardnovels.com/novel/${slug}">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": "${escapeHtml(novel.title)}",
    "author": {
      "@type": "Person",
      "name": "${escapeHtml(novel.author?.displayName || '')}"
    },
    "description": "${escapeHtml(novel.summary || '')}",
    "image": "${ogImageUrl}",
    "inLanguage": "ar",
    "datePublished": "${novel.createdAt}"
  }
  </script>
</head>
<body>
  <h1>${escapeHtml(novel.title)}</h1>
  <p>${escapeHtml(novel.summary || '')}</p>
  <img src="${novel.coverImageUrl || ''}" alt="${escapeHtml(novel.title)}">
  
  <noscript>
    <p>يرجى تفعيل JavaScript لعرض المحتوى الكامل</p>
  </noscript>
</body>
</html>`;
    
    return new Response(html, {
      headers: { 
        'Content-Type': 'text/html; charset=utf-8',
        'X-Rendered-By': 'Cloudflare-Worker'
      }
    });
  } catch (error) {
    throw error;
  }
}

// ─── Utilities ───

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function cleanImageUrl(url) {
  if (!url) return 'https://www.sardnovels.com/logo.png';
  
  try {
    // Remove invisible Unicode characters (RTL marks, zero-width characters, etc.)
    const cleanUrl = url
      .replace(/[\u200B-\u200D\u202A-\u202E\uFEFF]/g, '') // Remove invisible Unicode
      .trim();
    
    // Parse and properly encode the URL
    const urlObj = new URL(cleanUrl);
    
    // Split pathname and encode each segment
    const pathSegments = urlObj.pathname.split('/');
    const encodedSegments = pathSegments.map(segment => {
      if (!segment) return segment;
      // Decode first (in case it's already encoded), then encode properly
      return encodeURIComponent(decodeURIComponent(segment));
    });
    
    urlObj.pathname = encodedSegments.join('/');
    
    return urlObj.toString();
  } catch (e) {
    console.error('Error cleaning image URL:', e);
    // Fallback to logo if URL is invalid
    return 'https://www.sardnovels.com/logo.png';
  }
}

function translateGenre(genre) {
  const genreMap = {
    'Romance': 'رومانسي',
    'Fantasy': 'فانتازيا',
    'SciFi': 'خيال علمي',
    'Horror': 'رعب',
    'Mystery': 'غموض',
    'Thriller': 'إثارة',
    'Comedy': 'كوميديا',
    'Drama': 'دراما',
    'Action': 'أكشن',
    'Adventure': 'مغامرة',
    'Historical': 'تاريخي',
    'Crime': 'جريمة',
    'Tragedy': 'تراجيديا',
    'SliceOfLife': 'شريحة من الحياة',
    'Supernatural': 'خارق للطبيعة',
    'Psychological': 'نفسي',
    'Martial': 'فنون قتالية',
    'FanFiction': 'فان فيكشن',
  };
  return genreMap[genre] || genre;
}

// ─── Dynamic Sitemap Generation ───
async function handleSitemap(url, env) {
  const cacheKey = new Request(url.toString(), { method: 'GET' });
  const cache = caches.default;
  
  let cached = await cache.match(cacheKey);
  if (cached) {
    console.log('Serving sitemap from cache');
    return cached;
  }
  
  try {
    const response = await fetch(`${env.API_URL}/api/novel?pageNumber=1&pageSize=1000`);
    if (!response.ok) throw new Error(`API returned status: ${response.status}`);
    const data = await response.json();
    const novels = data.items || [];
    
    const BASE_URL = 'https://www.sardnovels.com';
    const staticPages = [
      { url: '', priority: '1.0', changefreq: 'daily' },
      { url: '/home', priority: '0.9', changefreq: 'daily' },
      { url: '/leaderboard', priority: '0.7', changefreq: 'weekly' },
    ];
    
    const staticUrls = staticPages.map(page => `
  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('');
    
    const novelUrls = novels.map(novel => `
  <url>
    <loc>${BASE_URL}/novel/${novel.slug}</loc>
    <lastmod>${new Date(novel.updatedAt || novel.createdAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticUrls}
  ${novelUrls}
</urlset>`;
    
    const res = new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=7200',
        'X-Rendered-By': 'Cloudflare-Worker'
      }
    });
    
    await cache.put(cacheKey, res.clone());
    return res;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      status: 500,
      headers: { 'Content-Type': 'application/xml' }
    });
  }
}
