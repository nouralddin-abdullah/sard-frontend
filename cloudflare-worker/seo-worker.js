// Cloudflare Worker for SEO Bot Detection & Pre-rendering
// Caches rendered HTML for 1 day (86400 seconds)

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle static assets (images, icons, etc.) - pass through directly
    const isStaticAsset = /\.(ico|png|jpg|jpeg|gif|svg|webp|css|js|woff|woff2|ttf|eot|json|xml|txt)$/i.test(url.pathname);
    
    if (isStaticAsset) {
      // Pass through to Cloudflare Pages for all static assets including favicon.ico
      return fetch(request);
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

async function generateNovelHTML(url, env) {
  const slug = url.pathname.split('/')[2];
  
  try {
    // Fetch novel data from your API
    const novel = await fetch(`${env.API_URL}/api/novel/${slug}`)
      .then(r => r.json());
    
    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(novel.title)} - سرد</title>
  <meta name="description" content="${escapeHtml(novel.summary?.substring(0, 160) || '')}">
  <meta property="og:title" content="${escapeHtml(novel.title)}">
  <meta property="og:description" content="بقلم: ${escapeHtml(novel.author?.displayName || '')}">
  <meta property="og:image" content="${cleanImageUrl(novel.coverImageUrl)}">
  <meta property="og:image:secure_url" content="${cleanImageUrl(novel.coverImageUrl)}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="سرد - منصة الروايات العربية">
  <meta property="og:url" content="https://www.sardnovels.com/novel/${slug}">
  <meta property="og:type" content="book">
  <meta property="og:locale" content="ar_AR">
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
    "image": "${novel.coverImageUrl || ''}",
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
