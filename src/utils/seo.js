// Page titles and descriptions shared by the web app and the SEO worker (cloudflare-worker/seo-worker.js), which serves
// the same pages to crawlers as plain HTML. Keep this module free of browser APIs.

export const SITE_URL = "https://www.sardnovels.com";
export const SITE_NAME = "سرد";
export const SITE_TITLE = "سرد - منصة القراءة والكتابة العربية";
export const DEFAULT_SHARE_IMAGE = `${SITE_URL}/og-default.jpg`;

export const LANDING_DESCRIPTION =
  "سرد منصة عربية لقراءة الروايات وكتابتها: روايات أصلية يكتبها كتّاب عرب في الفانتازيا والرومانسية والغموض والأكشن والخيال العلمي، تُنشر فصلاً بعد فصل.";

export const HOME_TITLE = "سرد - منصة الروايات العربية | اكتشف وشارك قصصك المفضلة";
export const HOME_DESCRIPTION =
  "تابع أحدث الروايات العربية وأكثرها رواجاً على سرد، وتصفح الفانتازيا والرومانسية والغموض والأكشن والخيال العلمي وغيرها، واقرأ الفصول الجديدة فور نشرها.";

/** Genre page title and description; page 2 onwards is its own page with its own title. */
export const genrePageTitle = (genre, page = 1) =>
  page > 1 ? `روايات ${genre} - صفحة ${page} | سرد` : `روايات ${genre} | سرد`;

export const genrePageDescription = (genre, page = 1, totalPages = 0) =>
  `اكتشف أفضل روايات ${genre} العربية على سرد: الأكثر رواجاً والأعلى تقييماً والأحدث.${
    page > 1 && totalPages ? ` صفحة ${page} من ${totalPages}.` : ""
  }`;

/** A member's profile: authors are listed under their novels, everyone else under their name. */
export const profileTitle = (name, isAuthor) => (isAuthor ? `روايات ${name} | سرد` : `${name} | سرد`);

/** WebSite structured data with the site search, for the landing and home pages. */
export const websiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  alternateName: ["Sard", "Sard Novels"],
  url: `${SITE_URL}/`,
  description: LANDING_DESCRIPTION,
  inLanguage: "ar",
  publisher: {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
  },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
});

/** Plain text of at most max characters, cut at a word with an ellipsis. */
export const clip = (text, max = 160) => {
  const clean = String(text ?? "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
};
