import { absolute, getPosts, rawUrl } from '../lib/posts';
import { site } from '../site';

// https://llmstxt.org, a contents page for anything that would rather read Markdown
export async function GET() {
  const posts = (await getPosts()).map(
    (post) => `- [${post.data.title}](${absolute(rawUrl(post))}): ${post.data.description}`,
  );
  const body = [
    `# ${site.name}`,
    `> ${site.description}, by ${site.author.name} (${site.home.url}).`,
    'Every post is also plain Markdown at its own address with `.md` on the end, and ' +
      `${absolute('/llms-full.txt')} has the lot in one file.`,
    `## Posts\n\n${posts.join('\n')}`,
  ];
  return new Response(`${body.join('\n\n')}\n`);
}
