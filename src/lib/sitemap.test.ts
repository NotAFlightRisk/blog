import assert from 'node:assert/strict';
import { test } from 'node:test';
import { lastModified, lonelyTags } from './sitemap.ts';

test('a post was last changed when it was updated, or else when it went out', () => {
  assert.equal(
    lastModified('---\ntitle: A\ndate: 2026-10-07\nupdated: 2026-10-09\n---'),
    '2026-10-09',
  );
  assert.equal(lastModified("---\ndate: '2026-10-07'\n---"), '2026-10-07');
  assert.equal(lastModified('---\ntitle: No dates\n---'), undefined);
});

test('a tag is lonely when only one published post has it', () => {
  const post = (slug: string, frontmatter: string) => ({
    slug,
    text: `---\n${frontmatter}\n---\n`,
  });
  const posts = [
    post('a', 'tags: [git, npm]'),
    post('b', 'tags:\n  - git\n  - css'),
    post('c', 'tags: [npm]\ndraft: true'),
  ];
  assert.deepEqual(lonelyTags(posts), ['npm', 'css']);
});
