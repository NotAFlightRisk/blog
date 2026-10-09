import type { APIRoute } from 'astro';
import { formatDate, readingTime } from '../../lib/format';
import { ogImage } from '../../lib/og';
import { getPosts, type Post } from '../../lib/posts';

export async function getStaticPaths() {
  return (await getPosts()).map((post) => ({ params: { slug: post.id }, props: { post } }));
}

export const GET: APIRoute<{ post: Post }> = async ({ props: { post } }) => {
  const { title, date } = post.data;
  const footnote = `${formatDate(date)} · ${readingTime(post.body ?? '')} min read`;
  return new Response(new Uint8Array(await ogImage(title, footnote)));
};
