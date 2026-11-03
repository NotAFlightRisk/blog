import assert from 'node:assert/strict';
import { test } from 'node:test';
import { frontPage, neighbours, related } from './rank.ts';

const post = (id: string, date: string, tags: string[], featured = false) => ({
  id,
  data: { date: new Date(date), tags, featured },
});

const posts = [
  post('newest', '2026-10-09', ['astro', 'css']),
  post('middle', '2026-09-01', ['astro']),
  post('older', '2026-06-01', ['astro', 'css']),
  post('oldest', '2025-01-01', ['security']),
];
const ids = (list: { id: string }[]) => list.map(({ id }) => id);

test('related puts the most shared tags first, never the post itself', () => {
  assert.deepEqual(ids(related(posts[0], posts)), ['older', 'middle']);
});

test('related breaks a tie on tags by whichever was written closest', () => {
  const tied = [...posts, post('ancient', '2020-01-01', ['astro', 'css'])];
  assert.deepEqual(ids(related(posts[1], tied)), ['newest', 'older', 'ancient']);
});

test('related leaves out posts with nothing in common, and stops at the count', () => {
  assert.deepEqual(ids(related(posts[3], posts)), []);
  assert.equal(related(posts[0], posts, 1).length, 1);
});

test('frontPage has the newest posts, then featured ones from before them', () => {
  const list = [
    post('a', '2026-10-05', [], true),
    post('b', '2026-10-04', []),
    post('c', '2026-10-03', [], true),
    post('d', '2026-10-02', []),
    post('e', '2026-10-01', [], true),
  ];
  assert.deepEqual(ids(frontPage(list, 2, 5)), ['a', 'b', 'c', 'e']);
  assert.deepEqual(ids(frontPage(list, 2, 1)), ['a', 'b', 'c']);
  assert.deepEqual(ids(frontPage(list, 9, 9)), ['a', 'b', 'c', 'd', 'e']);
});

test('neighbours are the newer and older posts either side', () => {
  assert.deepEqual(neighbours(posts[1], posts), { newer: posts[0], older: posts[2] });
  assert.deepEqual(neighbours(posts[0], posts), { newer: undefined, older: posts[1] });
  assert.deepEqual(neighbours(posts[3], posts), { newer: posts[2], older: undefined });
});
