import { existsSync, readdirSync, readFileSync } from 'node:fs';

// the newer of a post's two dates, straight off its frontmatter
export function lastModified(frontmatter: string) {
  const date = (key: string) =>
    frontmatter.match(new RegExp(`^${key}:\\s*['"]?(\\d{4}-\\d{2}-\\d{2})`, 'm'))?.[1];
  return date('updated') ?? date('date');
}

// the sitemap can't reach the content collection, so it reads the post folders itself
export function postDates(dir = 'posts') {
  const dates = new Map<string, string>();
  for (const slug of readdirSync(dir)) {
    const file = ['index.md', 'index.mdx'].map((name) => `${dir}/${slug}/${name}`).find(existsSync);
    const date = file && lastModified(readFileSync(file, 'utf8'));
    if (date) dates.set(slug, date);
  }
  return dates;
}
