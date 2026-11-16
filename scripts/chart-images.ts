import { execFileSync } from 'node:child_process';
import { existsSync, globSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { basename } from 'node:path';
import { site } from '../src/site.ts';
import { openDist } from './browser.ts';

// feed readers can't draw our charts, so each one gets a picture at posts/<slug>/charts/N.png
const built = () => readdirSync('posts').filter((slug) => existsSync(`dist/${slug}/index.html`));
const wanted = (slug: string) => {
  const html = readFileSync(`dist/${slug}/index.html`, 'utf8');
  const charts = html.split('<figure class="chart"').length - 1;
  return Array.from({ length: charts }, (_, index) => `${index + 1}.png`);
};
const pictures = (slug: string) =>
  globSync(`posts/${slug}/charts/*.png`)
    .map((path) => basename(path))
    .sort((a, b) => parseInt(a) - parseInt(b));

if (process.argv.includes('--check')) {
  const off = built().filter((slug) => String(wanted(slug)) !== String(pictures(slug)));
  for (const slug of off) {
    console.error(`posts/${slug} wants [${wanted(slug)}] but has [${pictures(slug)}]`);
  }
  if (off.length) {
    console.error('Run npm run charts and commit what it makes');
    process.exit(1);
  }
} else {
  execFileSync('npx', ['astro', 'build'], { stdio: 'inherit' });
  const { browser, page } = await openDist({
    colorScheme: 'light',
    deviceScaleFactor: 2,
    viewport: { width: 1280, height: 800 },
  });

  for (const slug of built()) {
    const dir = `posts/${slug}/charts`;
    rmSync(dir, { recursive: true, force: true });
    await page.goto(`${site.url}/${slug}/`);
    // the numbers stay as a real table in the feed, so the picture skips them
    await page.addStyleTag({
      content: 'figure.chart { margin: 0; padding: var(--space-m); & details { display: none } }',
    });
    await page.evaluate(() => document.fonts.ready);
    const figures = await page.locator('figure.chart').all();
    for (const [index, figure] of figures.entries()) {
      await figure.screenshot({ path: `${dir}/${index + 1}.png`, animations: 'disabled' });
    }
    if (figures.length) console.log(`${dir}: ${figures.length}`);
  }
  await browser.close();
}
