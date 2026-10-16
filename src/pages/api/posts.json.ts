import { isoDate, readingTime } from '../../lib/format';
import { absolute, getPosts, ogUrl, postUrl } from '../../lib/posts';

// every post, newest first, for anything else that wants to list them (peng.ly, mostly)
export async function GET() {
  const posts = (await getPosts()).map((post) => ({
    slug: post.id,
    title: post.data.title,
    description: post.data.description,
    url: absolute(postUrl(post)),
    date: isoDate(post.data.date),
    updated: post.data.updated && isoDate(post.data.updated),
    tags: post.data.tags,
    readingMinutes: readingTime(post.body ?? ''),
    image: absolute(ogUrl(post)),
  }));
  return Response.json({ posts });
}
