import { readFileSync, writeFileSync } from 'node:fs';
import { formatDate } from '../src/lib/format.ts';
import { latest, site } from '../src/site.ts';

// fills the post list in the README from the live site, so it only ever shows what's published
type Post = {
  title: string;
  description: string;
  url: string;
  date: string;
  tags: string[];
  readingMinutes: number;
  image: string;
};

const README = '.github/README.md';

// GitHub reads a pair of $ as maths, even inside HTML
const escape = (text: string) =>
  text.replace(/[&<>"$]/g, (char) => `&#${char.charCodeAt(0)};`).replace(/\s+/g, ' ');

const tag = (name: string) => `<a href="${site.url}/tags/${name}/">#${name}</a>`;

const row = (post: Post) => {
  const title = escape(post.title);
  const meta = [
    formatDate(new Date(post.date)),
    `${post.readingMinutes} min read`,
    post.tags.map(tag).join(' '),
  ];
  return [
    '  <tr>',
    '    <td width="240">',
    `      <a href="${post.url}"><img src="${post.image}" alt="${title}" width="240" /></a>`,
    '    </td>',
    '    <td valign="top">',
    `      <b><a href="${post.url}">${title}</a></b><br />`,
    `      ${escape(post.description)}<br />`,
    `      <sub>${meta.join(' · ')}</sub>`,
    '    </td>',
    '  </tr>',
  ].join('\n');
};

const response = await fetch(`${site.url}/api/posts.json`);
if (!response.ok) throw new Error(`${site.url}/api/posts.json: ${response.status}`);
const { posts }: { posts: Post[] } = await response.json();
const shown = posts.slice(0, latest);
const more = posts.length > shown.length;

const list = [
  '<table>',
  ...shown.map(row),
  '</table>',
  ...(more ? ['', `[All ${posts.length} posts are in the archive](${site.url}/archive/)`] : []),
].join('\n');

function fill(text: string, name: string, content: string) {
  const [start, end] = [`<!-- ${name}-start -->`, `<!-- ${name}-end -->`];
  const [from, to] = [text.indexOf(start), text.indexOf(end)];
  if (from < 0 || to < from) throw new Error(`${README} needs ${start} and ${end} in it`);
  return `${text.slice(0, from + start.length)}\n${content}\n${text.slice(to)}`;
}

writeFileSync(README, fill(readFileSync(README, 'utf8'), 'posts', list));
console.log(`${shown.length} of ${posts.length} posts in the README`);
