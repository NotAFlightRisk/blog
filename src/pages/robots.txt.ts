import { absolute } from '../lib/posts';

// the PDFs are for people, crawlers already get each post as a page and as Markdown
export const GET = () =>
  new Response(
    `User-agent: *\nAllow: /\nDisallow: /*.pdf$\n\nSitemap: ${absolute('/sitemap-index.xml')}\n`,
  );
