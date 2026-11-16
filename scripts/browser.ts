import { existsSync } from 'node:fs';
import Chromium from '@sparticuz/chromium';
import { chromium, type BrowserContextOptions } from 'playwright-core';
import { site } from '../src/site.ts';

// a Chromium that brings its own libraries, so it starts on Vercel's builder too, but it only
// comes for x64 Linux, so anything else borrows the Chrome that's installed
export async function launch() {
  const bundled = process.platform === 'linux' && process.arch === 'x64';
  return chromium.launch(
    bundled
      ? { executablePath: await Chromium.executablePath(), args: Chromium.args }
      : { channel: 'chrome' },
  );
}

// a page that loads the site from dist/, with everything off-site blocked, analytics included
export async function openDist(options: BrowserContextOptions = {}) {
  const browser = await launch();
  const page = await browser.newPage(options);
  await page.route('**', (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== site.url) return route.abort();
    const path = `dist${url.pathname.replace(/\/$/, '/index.html')}`;
    return route.fulfill(existsSync(path) ? { path } : { status: 404 });
  });
  return { browser, page };
}
