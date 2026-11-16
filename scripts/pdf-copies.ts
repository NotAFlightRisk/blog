import { createHash } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  globSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { basename } from 'node:path';
import type { Page } from 'playwright-core';
import { site } from '../src/site.ts';
import { openDist } from './browser.ts';

// prints every built page that links a PDF copy of itself, and never fails the build over one,
// since a missing copy falls back to its post and CI's link check still spots it

// Vercel keeps .vercel/cache between builds, and it's gitignored here
const cache = '.vercel/cache/pdf-copies';
// a page only reprints when its HTML (styles inlined, pictures hashed), this or Chromium changes
const recipe = [
  'scripts/pdf-copies.ts',
  'scripts/browser.ts',
  'node_modules/@sparticuz/chromium/package.json',
]
  .map((file) => readFileSync(file, 'utf8'))
  .join('');
// a stuck Chromium can't hold up a deploy, and whatever did print is cached for next time
const budget = 3 * 60_000;

// Chromium fills the classes in, and wants its own sizes since none of ours reach it
const footer = `<p style="width: 100%; margin: 0; text-align: center; font: 8px sans-serif">
  <span class="url"></span> · <span class="pageNumber"></span> of <span class="totalPages"></span></p>`;

type Copy = { page: string; pdf: string; cached: string };

const warn = (message: string, error?: unknown) =>
  console.warn(
    `PDF copies: ${message}${error instanceof Error ? ` (${error.message.split('\n')[0]})` : ''}`,
  );

const copies: Copy[] = globSync('dist/**/index.html').flatMap((file) => {
  const html = readFileSync(file, 'utf8');
  const pdf = html.match(/<link rel="alternate" type="application\/pdf" href="([^"]+)"/)?.[1];
  if (!pdf) return [];
  const key = createHash('sha256').update(recipe).update(html).digest('hex');
  const page = file.slice('dist'.length, -'index.html'.length);
  return [{ page, pdf: `dist${pdf}`, cached: `${cache}/${key}.pdf` }];
});

async function print(page: Page, copy: Copy) {
  await page.goto(site.url + copy.page);
  // the code font's only asked for once the page is laid out for paper
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    tagged: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: footer,
  });
  writeFileSync(copy.pdf, pdf);
  // renamed into place, so a build killed halfway can't leave half a PDF in the cache
  writeFileSync(`${copy.cached}.part`, pdf);
  renameSync(`${copy.cached}.part`, copy.cached);
}

async function printAll(missing: Copy[]) {
  const { browser, page } = await openDist();
  await page.emulateMedia({ media: 'print' });
  for (const copy of missing) {
    await print(page, copy).catch((error) => warn(`left out ${copy.pdf}`, error));
  }
  await browser.close();
}

if (!copies.length) warn('no page links one, has the <link> changed?');
setTimeout(() => {
  warn(`gave up after ${budget / 60_000} minutes, the rest print next build`);
  process.exit();
}, budget).unref();

mkdirSync(cache, { recursive: true });
const missing = copies.filter((copy) => !existsSync(copy.cached));
for (const copy of copies) if (existsSync(copy.cached)) copyFileSync(copy.cached, copy.pdf);
if (missing.length) await printAll(missing).catch((error) => warn('Chromium gave up', error));

// the cache only ever holds this build's copies
const current = new Set(copies.map((copy) => basename(copy.cached)));
for (const file of readdirSync(cache)) if (!current.has(file)) rmSync(`${cache}/${file}`);

const ready = copies.filter((copy) => existsSync(copy.pdf)).length;
console.log(`PDF copies: ${ready} of ${copies.length} ready, ${missing.length} needed printing`);
