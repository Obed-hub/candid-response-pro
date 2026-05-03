const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'https://userpov.com';
const SEO_DATA_PATH = path.join(__dirname, '../src/data/seo-data.ts');
const PUBLIC_DIR = path.join(__dirname, '../public');

function generateSitemap() {
  console.log('Generating sitemap...');
  
  // Static routes
  const staticRoutes = [
    '/',
    '/pricing',
    '/about-us',
    '/login',
    '/signup',
    '/dashboard',
  ];

  // Read seo-data.ts
  const content = fs.readFileSync(SEO_DATA_PATH, 'utf8');
  
  // Extract slugs and types using regex
  // This is a bit fragile but works for our structured data
  const pageRegex = /slug:\s*"([^"]+)",\s*type:\s*"([^"]+)"/g;
  let match;
  const dynamicRoutes = [];

  while ((match = pageRegex.exec(content)) !== null) {
    const slug = match[1];
    const type = match[2];
    
    let pathPrefix = '';
    if (type === 'industry') pathPrefix = '/industries/';
    if (type === 'use-case') pathPrefix = '/use-cases/';
    if (type === 'location') pathPrefix = '/locations/';
    
    dynamicRoutes.push(`${pathPrefix}${slug}`);
  }

  const allRoutes = [...staticRoutes, ...dynamicRoutes];
  const date = new Date().toISOString().split('T')[0];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `  <url>
    <loc>${BASE_URL}${route}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>${route === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapXml);
  console.log(`Sitemap generated successfully with ${allRoutes.length} URLs.`);
}

generateSitemap();
