import { ogImage } from '../lib/og';
import { site } from '../site';

export const GET = async () =>
  new Response(
    new Uint8Array(
      await ogImage(
        'Writing about code, security and the odd penguin',
        site.url.replace('https://', ''),
      ),
    ),
  );
