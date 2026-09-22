import { BRAND, SITE_URL } from "../../config/site";

const SUFFIX = BRAND.short;

/**
 * Per-page SEO. React 19 hoists <title>/<meta>/<link> into <head>.
 * `path` should be the route path (e.g. /ayurveda/services/panchakarma) for canonical URLs.
 */
export default function Seo({
  title,
  description,
  path,
  image = "/og-main.png",
  noindex = false,
}) {
  const fullTitle = title ? `${title} | ${SUFFIX}` : `${BRAND.fullName}`;
  const url = SITE_URL && path ? `${SITE_URL}${path}` : undefined;
  const fullImage = image
    ? image.startsWith("http") || !SITE_URL
      ? image
      : `${SITE_URL}${image}`
    : undefined;
  return (
    <>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {url && <link rel="canonical" href={url} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={BRAND.fullName} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      {url && <meta property="og:url" content={url} />}
      {fullImage && <meta property="og:image" content={fullImage} />}
      <meta
        name="twitter:card"
        content={fullImage ? "summary_large_image" : "summary"}
      />
    </>
  );
}
