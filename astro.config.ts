import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, envField, fontProviders } from 'astro/config';
import { markdown } from './src/lib/markdown';
import { lonelyTags, postDates, readPosts } from './src/lib/sitemap';
import { site } from './src/site';

const optional = { context: 'client', access: 'public', optional: true } as const;
const posts = readPosts();
const dates = postDates(posts);
const lonely = new Set(lonelyTags(posts).map((tag) => `${site.url}/tags/${tag}/`));

export default defineConfig({
  site: site.url,
  trailingSlash: 'always',
  markdown,
  build: { inlineStylesheets: 'always' },
  image: { layout: 'constrained', domains: ['i.ytimg.com'] },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !/\/(404|500|search)\/$/.test(page) && !lonely.has(page),
      serialize: (item) => ({
        ...item,
        lastmod: dates.get(new URL(item.url).pathname.slice(1, -1)),
      }),
    }),
  ],
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Bricolage Grotesque',
      cssVariable: '--font-sans',
      fallbacks: ['system-ui', 'sans-serif'],
      options: {
        variants: [
          {
            src: [
              '@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2',
            ],
            weight: '200 800',
            style: 'normal',
          },
        ],
      },
    },
    // code on paper, so a PDF looks the same whichever machine printed it
    {
      provider: fontProviders.local(),
      name: 'JetBrains Mono',
      cssVariable: '--font-print-mono',
      fallbacks: ['monospace'],
      options: {
        variants: [
          {
            src: [
              '@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2',
            ],
            weight: '100 800',
            style: 'normal',
          },
        ],
      },
    },
  ],
  env: {
    schema: {
      PUBLIC_PLAUSIBLE_SCRIPT: envField.string({ ...optional, url: true }),
      PUBLIC_SENTRY_DSN: envField.string({ ...optional, url: true }),
      PUBLIC_CF_BEACON_TOKEN: envField.string(optional),
    },
  },
  vite: {
    // small scripts would otherwise get inlined, and the CSP only trusts the theme one
    build: { assetsInlineLimit: 0 },
  },
});
