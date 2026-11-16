import { getContainerRenderer } from '@astrojs/mdx/container-renderer';
import rss from '@astrojs/rss';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { render } from 'astro:content';
import { absolute, chartUrl, getPosts, postUrl, type Post } from '../lib/posts';
import { site } from '../site';

const container = await AstroContainer.create({
  renderers: await loadRenderers([getContainerRenderer()]),
});

// feed readers can't draw a chart, so it goes in as its picture, numbers and all
function chartPicture(figure: string, src: string) {
  const title = figure.match(/<span class="title">(.*?)<\/span>/)?.[1];
  const numbers = figure.match(/<details>[\s\S]*<\/details>/)?.[0] ?? '';
  return `<img src="${src}" alt="${title}">${numbers}`;
}

// the whole post, tidied for feed readers: no scripts, responsive extras or styles that lean on
// the site's tokens, and every link absolute
async function html(post: Post) {
  const { Content } = await render(post);
  let chart = 0;
  return (await container.renderToString(Content))
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/\s(?:srcset|sizes|data-astro-cid-\w+|data-pagefind-ignore)(?:="[^"]*")?/g, '')
    .replace(/\sstyle="[^"]*var\(--[^"]*"/g, '')
    .replace(/<figure class="chart">[\s\S]*?<\/figure>/g, (figure) =>
      chartPicture(figure, chartUrl(post, ++chart)),
    )
    .replace(/(href|src)="#/g, `$1="${absolute(postUrl(post))}#`)
    .replace(/(href|src)="\/(?!\/)/g, `$1="${site.url}/`);
}

const feedSize = 20;

export async function GET() {
  const posts = (await getPosts()).slice(0, feedSize);
  return rss({
    title: site.name,
    description: site.description,
    site: site.url,
    trailingSlash: true,
    xmlns: { atom: 'http://www.w3.org/2005/Atom', dc: 'http://purl.org/dc/elements/1.1/' },
    customData: [
      `<language>${site.lang.toLowerCase()}</language>`,
      `<atom:link href="${absolute(site.feed)}" rel="self" type="application/rss+xml"/>`,
    ].join(''),
    items: await Promise.all(
      posts.map(async (post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.date,
        link: postUrl(post),
        categories: post.data.tags,
        customData: `<dc:creator>${site.author.name}</dc:creator>`,
        content: await html(post),
      })),
    ),
  });
}
