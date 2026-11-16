import { site } from '../site';

export const getStaticPaths = () => [{ params: { key: site.indexnow } }];

export const GET = () => new Response(site.indexnow);
