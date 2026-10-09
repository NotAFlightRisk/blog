import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, envField, fontProviders } from 'astro/config';
import { markdown } from './src/lib/markdown';
import { site } from './src/site';

const optional = { context: 'client', access: 'public', optional: true } as const;

export default defineConfig({
  site: site.url,
  trailingSlash: 'always',
  markdown,
  build: { inlineStylesheets: 'always' },
  image: { layout: 'constrained', domains: ['i.ytimg.com'] },
  integrations: [mdx(), sitemap({ filter: (page) => !/\/(404|500|search)\/$/.test(page) })],
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
