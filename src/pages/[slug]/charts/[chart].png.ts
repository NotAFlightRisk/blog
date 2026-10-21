import { globSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';
import type { APIRoute } from 'astro';
import { getPosts } from '../../../lib/posts';

export async function getStaticPaths() {
  return (await getPosts()).flatMap((post) =>
    globSync(`posts/${post.id}/charts/*.png`).map((file) => ({
      params: { slug: post.id, chart: basename(file, '.png') },
      props: { file },
    })),
  );
}

export const GET: APIRoute<{ file: string }> = ({ props: { file } }) =>
  new Response(readFileSync(file));
