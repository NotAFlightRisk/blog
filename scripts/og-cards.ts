import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { penguinSvg } from '../src/lib/penguin.ts';
import { site } from '../src/site.ts';

// draws a post's posts/<slug>/og.html into the og.png beside it, the picture its links share.
// The card only has to be its own markup and styles, since it lands on a page that already has
// the site's tokens, font and a .penguin to use
const origin = 'http://og.test';
const named = process.argv.slice(2);
const slugs = named.length
  ? named
  : readdirSync('posts').filter((slug) => existsSync(`posts/${slug}/og.html`));

const penguin = Buffer.from(penguinSvg('#151b23', site.color)).toString('base64');
const shell = (card: string) => `<!doctype html>
<style>
  ${readFileSync('src/styles/tokens.css', 'utf8')}
  @font-face {
    font-family: 'Bricolage Grotesque';
    src: url(/node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2);
    font-weight: 200 800;
  }
  /* light, unless the card asks for dark */
  :root { color-scheme: light; }
  body {
    margin: 0;
    width: 1200px;
    height: 630px;
    overflow: hidden;
    background: var(--bg);
    color: var(--text);
    font-family: 'Bricolage Grotesque', system-ui, sans-serif;
  }
  .penguin {
    aspect-ratio: 510 / 465;
    background: url(data:image/svg+xml;base64,${penguin}) center / contain no-repeat;
  }
</style>
${card}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
// anything the card links to comes from the repo, so it can use the post's own pictures
await page.route(`${origin}/**`, (route) => {
  const path = decodeURIComponent(new URL(route.request().url()).pathname.slice(1));
  if (!existsSync(path)) return route.fulfill({ status: 404 });
  return path.endsWith('/og.html')
    ? route.fulfill({
        contentType: 'text/html; charset=utf-8',
        body: shell(readFileSync(path, 'utf8')),
      })
    : route.fulfill({ path });
});

for (const slug of slugs) {
  if (!existsSync(`posts/${slug}/og.html`)) {
    console.error(`posts/${slug} has no og.html to draw`);
    process.exitCode = 1;
    continue;
  }
  await page.goto(`${origin}/posts/${slug}/og.html`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `posts/${slug}/og.png`, animations: 'disabled' });
  console.log(`posts/${slug}/og.png`);
}
await browser.close();
