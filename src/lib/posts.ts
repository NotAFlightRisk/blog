import { getCollection, type CollectionEntry } from 'astro:content';
import { site } from '../site';
import { formatDate } from './format';
import { plainMarkdown } from './plain';

export type Post = CollectionEntry<'posts'>;

// drafts only ever turn up on the dev server
export async function getPosts() {
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const postUrl = (post: Post) => `/${post.id}/`;
export const rawUrl = (post: Post) => `/${post.id}.md`;
export const ogUrl = (post: Post) => `/${post.id}/og.png`;
export const tagUrl = (tag: string) => `/tags/${tag}/`;
export const absolute = (path: string) => new URL(path, site.url).href;

export function byTag(posts: Post[]) {
  const tags = new Map<string, Post[]>();
  for (const post of posts) {
    for (const tag of post.data.tags) tags.set(tag, [...(tags.get(tag) ?? []), post]);
  }
  return [...tags].sort(([a], [b]) => a.localeCompare(b));
}

// the post as plain Markdown, with its files pointed at the repo so they still load
export function markdownOf(post: Post) {
  const { title, description, date, tags } = post.data;
  const files = `${site.repo.replace('github.com', 'raw.githubusercontent.com')}/main/posts/${post.id}/`;
  const body = plainMarkdown(post.body ?? '', files);
  const meta = `${formatDate(date)} · ${tags.map((tag) => `#${tag}`).join(' ')}`;
  return `# ${title}\n\n> ${description}\n\n${meta} · ${absolute(postUrl(post))}\n\n${body}\n`;
}
