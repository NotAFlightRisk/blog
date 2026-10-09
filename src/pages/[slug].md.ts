import type { APIRoute } from 'astro';
import { getPosts, markdownOf, type Post } from '../lib/posts';

export async function getStaticPaths() {
  return (await getPosts()).map((post) => ({ params: { slug: post.id }, props: { post } }));
}

export const GET: APIRoute<{ post: Post }> = ({ props }) => new Response(markdownOf(props.post));
