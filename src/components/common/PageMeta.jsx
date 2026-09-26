import { Helmet } from "react-helmet-async";
import { DEFAULT_SHARE_IMAGE, SITE_NAME, SITE_URL } from "../../utils/seo";

/**
 * A page's title, description, canonical and share tags. They replace the defaults in index.html (marked data-rh for
 * that). path is the canonical path ("/genre/fantasy"); leave it out for pages that shouldn't have one (noindex).
 * Crawlers mostly get the SEO worker's HTML of these pages; this keeps the app itself right for everyone else.
 */
const PageMeta = ({ title, description, path, robots, image = DEFAULT_SHARE_IMAGE, type = "website", jsonLd }) => {
  const url = path ? `${SITE_URL}${path}` : null;
  const tags = [
    <title key="title">{title}</title>,
    description && <meta key="description" name="description" content={description} />,
    robots && <meta key="robots" name="robots" content={robots} />,
    url && <link key="canonical" rel="canonical" href={url} />,
    <meta key="og:type" property="og:type" content={type} />,
    <meta key="og:title" property="og:title" content={title} />,
    description && <meta key="og:description" property="og:description" content={description} />,
    url && <meta key="og:url" property="og:url" content={url} />,
    <meta key="og:image" property="og:image" content={image} />,
    <meta key="og:site_name" property="og:site_name" content={SITE_NAME} />,
    <meta key="og:locale" property="og:locale" content="ar_AR" />,
    <meta key="twitter:card" name="twitter:card" content="summary_large_image" />,
    <meta key="twitter:title" name="twitter:title" content={title} />,
    description && <meta key="twitter:description" name="twitter:description" content={description} />,
    <meta key="twitter:image" name="twitter:image" content={image} />,
    jsonLd && (
      <script key="jsonld" type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    ),
  ].filter(Boolean);

  return <Helmet>{tags}</Helmet>;
};

export default PageMeta;
