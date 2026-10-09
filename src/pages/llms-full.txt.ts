import { getPosts, markdownOf } from '../lib/posts';

export async function GET() {
  const posts = await getPosts();
  return new Response(posts.map(markdownOf).join('\n---\n\n'));
}
