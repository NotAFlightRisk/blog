import { ogImage } from '../lib/og';
import { site } from '../site';

export const GET = async () =>
  new Response(new Uint8Array(await ogImage(site.tagline, site.url.replace('https://', ''))));
