import { parseFrontmatter } from '@astrojs/markdown-remark';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

type Source = { slug: string; text: string };

// the newer of a post's two dates, straight off its frontmatter
export function lastModified(frontmatter: string) {
  const date = (key: string) =>
    frontmatter.match(new RegExp(`^${key}:\\s*['"]?(\\d{4}-\\d{2}-\\d{2})`, 'm'))?.[1];
  return date('updated') ?? date('date');
}

// the sitemap can't reach the content collection, so it reads the post folders itself
export function readPosts(dir = 'posts'): Source[] {
  return readdirSync(dir).flatMap((slug) => {
    const file = ['index.md', 'index.mdx'].map((name) => `${dir}/${slug}/${name}`).find(existsSync);
    return file ? [{ slug, text: readFileSync(file, 'utf8') }] : [];
  });
}

export function postDates(posts: Source[]) {
  const dates = new Map<string, string>();
  for (const { slug, text } of posts) {
    const date = lastModified(text);
    if (date) dates.set(slug, date);
  }
  return dates;
}

// a tag on just one post gets a page that only links to it, which search can do without
export function lonelyTags(posts: Source[]) {
  const counts = new Map<string, number>();
  for (const { text } of posts) {
    const { draft, tags = [] } = parseFrontmatter(text).frontmatter;
    if (!draft) for (const tag of tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts].filter(([, count]) => count === 1).map(([tag]) => tag);
}
