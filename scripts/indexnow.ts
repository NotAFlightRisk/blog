import { execFileSync } from 'node:child_process';
import { site } from '../src/site.ts';

// tells IndexNow about the posts the last commit touched. --dry-run prints them instead
const slugs = execFileSync('git', ['diff', '--name-only', 'HEAD^', 'HEAD', '--', 'posts'], {
  encoding: 'utf8',
})
  .split('\n')
  .filter(Boolean)
  .map((path) => path.split('/')[1]);
const posts = [...new Set(slugs)].map((slug) => `${site.url}/${slug}/`);
const urlList = [`${site.url}/`, ...posts];

if (!posts.length) {
  console.log('No posts changed, so nothing to send');
} else if (process.argv.includes('--dry-run')) {
  console.log(urlList.join('\n'));
} else {
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: new URL(site.url).host, key: site.indexnow, urlList }),
  });
  if (!response.ok) throw new Error(`IndexNow said ${response.status}: ${await response.text()}`);
  console.log(`Sent ${urlList.length} pages to IndexNow`);
}
