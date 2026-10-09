import { absolute } from '../lib/posts';

export const GET = () =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${absolute('/sitemap-index.xml')}\n`);
