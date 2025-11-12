import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://www.sardnovels.com';
const API_URL = 'https://api-sareed.runasp.net';

async function generateSitemap() {
  try {
    console.log('Fetching novels from API...');
    
    // Fetch all novels from API
    const response = await fetch(`${API_URL}/api/novel?pageNumber=1&pageSize=1000`);
    const data = await response.json();
    const novels = data.items || [];
    
    console.log(`Found ${novels.length} novels`);
    
    // Static pages
    const staticPages = [
      { url: '', priority: '1.0', changefreq: 'daily' },
      { url: '/explore', priority: '0.9', changefreq: 'daily' },
      { url: '/leaderboard', priority: '0.7', changefreq: 'weekly' },
    ];
    
    // Generate static page URLs
    const staticUrls = staticPages.map(page => `
  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('');
    
    // Generate novel URLs
    const novelUrls = novels.map(novel => `
  <url>
    <loc>${BASE_URL}/novel/${novel.slug}</loc>
    <lastmod>${new Date(novel.updatedAt || novel.createdAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');
    
    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticUrls}
  ${novelUrls}
</urlset>`;
    
    // Write to public directory
    const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    fs.writeFileSync(outputPath, sitemap);
    
    console.log(`✅ Sitemap generated successfully at ${outputPath}`);
    console.log(`Total URLs: ${staticPages.length + novels.length}`);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();
