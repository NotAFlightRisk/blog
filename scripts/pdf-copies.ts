import { globSync, readFileSync } from 'node:fs';
import { site } from '../src/site.ts';
import { openDist } from './browser.ts';

// every built page that links a PDF copy of itself gets printed to it, print styles and all
const copies = globSync('dist/**/index.html').flatMap((file) => {
  const html = readFileSync(file, 'utf8');
  const pdf = html.match(/<link rel="alternate" type="application\/pdf" href="([^"]+)"/)?.[1];
  return pdf ? [{ page: file.slice('dist'.length, -'index.html'.length), pdf }] : [];
});
if (!copies.length) throw new Error('No page links a PDF copy, has the <link> changed?');

// Chromium fills the classes in, and wants its own sizes since none of ours reach it
const footer = `<p style="width: 100%; margin: 0; text-align: center; font: 8px sans-serif">
  <span class="url"></span> · <span class="pageNumber"></span> of <span class="totalPages"></span></p>`;

const { browser, page } = await openDist();
await page.emulateMedia({ media: 'print' });
for (const copy of copies) {
  await page.goto(site.url + copy.page);
  // the code font's only asked for once the page is laid out for paper
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.pdf({
    path: `dist${copy.pdf}`,
    format: 'A4',
    printBackground: true,
    tagged: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: footer,
  });
}
await browser.close();
console.log(`Printed ${copies.length} PDF copies`);
