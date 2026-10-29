// Public metadata uses the deployed address even during a local preview.
// Override the complete base URL when moving to another domain or subdirectory.
export const siteUrl = new URL(process.env.SITE_URL || 'https://villarrubi.github.io/personalWebsite/');
if (!['http:', 'https:'].includes(siteUrl.protocol) || siteUrl.username || siteUrl.password || siteUrl.search || siteUrl.hash)
  throw new Error('SITE_URL must be an absolute HTTP(S) base URL without credentials, a query, or a fragment.');
siteUrl.pathname = siteUrl.pathname.replace(/\/+$/, '') + '/';
export const canonicalUrl = (lang, id) => new URL(`${lang}/${id ? `projects/${id}/` : ''}`, siteUrl).href;
