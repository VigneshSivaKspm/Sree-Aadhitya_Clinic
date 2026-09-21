import { BRAND, SITE_URL } from '../../config/site';

const SUFFIX = BRAND.short;

/**
 * Per-page SEO. React 19 hoists <title>/<meta>/<link> into <head>.
 * `path` should be the route path (e.g. /ayurveda/services/panchakarma) for canonical URLs.
 */
export default function Seo({ title, description, path, image, noindex = false }) {
  const fullTitle = title ? `${title} | ${SUFFIX}` : `${BRAND.fullName}`;
  const url = SITE_URL && path ? `${SITE_URL}${path}` : undefined;
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
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
    </>
  );
}
