import { getContainerRenderer } from '@astrojs/mdx/container-renderer';
import rss from '@astrojs/rss';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { render } from 'astro:content';
import { absolute, getPosts, postUrl, type Post } from '../lib/posts';
import { site } from '../site';

const container = await AstroContainer.create({
  renderers: await loadRenderers([getContainerRenderer()]),
});

// the whole post, tidied for feed readers: no scripts or responsive extras, every link absolute
async function html(post: Post) {
  const { Content } = await render(post);
  return (await container.renderToString(Content))
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/\s(?:srcset|sizes|data-astro-cid-\w+|data-pagefind-ignore)(?:="[^"]*")?/g, '')
    .replace(/(href|src)="#/g, `$1="${absolute(postUrl(post))}#`)
    .replace(/(href|src)="\/(?!\/)/g, `$1="${site.url}/`);
}

export async function GET() {
  const posts = await getPosts();
  return rss({
    title: site.name,
    description: site.description,
    site: site.url,
    trailingSlash: true,
    customData: `<language>${site.lang.toLowerCase()}</language>`,
    items: await Promise.all(
      posts.map(async (post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.date,
        link: postUrl(post),
        categories: post.data.tags,
        content: await html(post),
      })),
    ),
  });
}
