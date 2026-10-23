import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import { plainMarkdown } from '../src/lib/plain.ts';
import { site } from '../src/site.ts';

// copies posts to DEV, pointing back here as the original. Names the posts to send, or sends
// the ones the last commit touched. --dry-run prints what it would send instead
type Post = {
  slug: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  image: string;
};

const dry = process.argv.includes('--dry-run');
const named = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const slugs = named.length
  ? named
  : execFileSync('git', ['diff', '--name-only', 'HEAD^', 'HEAD', '--', 'posts'], {
      encoding: 'utf8',
    })
      .split('\n')
      .filter(Boolean)
      .map((path) => path.split('/')[1]);

async function dev(path: string, init: RequestInit = {}) {
  const headers = {
    'api-key': process.env.DEVTO_API_KEY ?? '',
    accept: 'application/vnd.forem.api-v1+json',
    'content-type': 'application/json',
  };
  for (let tries = 1; ; tries++) {
    const response = await fetch(`https://dev.to/api${path}`, { ...init, headers });
    if (response.ok) return response.json();
    // DEV only takes a new article every so often
    if (response.status !== 429 || tries === 5) {
      const request = `${init.method ?? 'GET'} ${path}`;
      throw new Error(`${request}: ${response.status} ${await response.text()}`);
    }
    await sleep(30_000);
  }
}

// DEV tags are letters and numbers only, and up to four, so keep the ones most people follow
function tagsFor(post: Post, popular: string[]) {
  const rank = (tag: string) => (popular.includes(tag) ? popular.indexOf(tag) : popular.length);
  const tags = post.tags.map((tag) => tag.replace(/[^a-z0-9]/g, ''));
  return tags.sort((a, b) => rank(a) - rank(b)).slice(0, 4);
}

function markdownFor(post: Post) {
  const file = ['mdx', 'md'].map((ext) => `posts/${post.slug}/index.${ext}`).find(existsSync)!;
  const body = readFileSync(file, 'utf8').replace(/^---\n[\s\S]*?\n---\n/, '');
  const files = `${site.repo.replace('github.com', 'raw.githubusercontent.com')}/main/posts/${post.slug}/`;
  const markdown = plainMarkdown(body, files, (chart) => `${post.url}charts/${chart}.png`)
    .replace(/^> \[!\w+\]\n/gm, '') // DEV has no alerts, so a callout's just a quote
    .replace(/\]\(\//g, `](${site.url}/`)
    .replace(/\]\(#/g, `](${post.url}#`);
  return `${markdown}\n\n---\n\n_First on [${new URL(site.url).host}](${post.url}), and written with help from AI._\n`;
}

const { posts }: { posts: Post[] } = await (await fetch(`${site.url}/api/posts.json`)).json();
const popular = (await dev('/tags?per_page=1000')).map(({ name }: { name: string }) => name);
// one per original, preferring a published copy over a draft (DEV's RSS import makes drafts)
const copies = new Map<string, number>();
for (const { id, canonical_url, published } of await dev('/articles/me/all?per_page=1000')) {
  if (published || !copies.has(canonical_url)) copies.set(canonical_url, id);
}

for (const slug of new Set(slugs)) {
  const post = posts.find((post) => post.slug === slug);
  if (!post) {
    console.log(`${slug}: not live, skipped`);
    continue;
  }
  const article = {
    title: post.title,
    description: post.description,
    body_markdown: markdownFor(post),
    tags: tagsFor(post, popular),
    main_image: post.image,
    canonical_url: post.url,
    published: true,
  };
  const id = copies.get(post.url);
  if (dry) {
    console.log(JSON.stringify({ id, ...article }, null, 2));
    continue;
  }
  const saved = await dev(id ? `/articles/${id}` : '/articles', {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify({ article }),
  });
  console.log(`${slug}: ${id ? 'updated' : 'posted'} ${saved.url}`);
}
