import assert from 'node:assert/strict';
import { test } from 'node:test';
import { neighbours, related } from './rank.ts';

const post = (id: string, date: string, tags: string[]) => ({
  id,
  data: { date: new Date(date), tags },
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

test('neighbours are the newer and older posts either side', () => {
  assert.deepEqual(neighbours(posts[1], posts), { newer: posts[0], older: posts[2] });
  assert.deepEqual(neighbours(posts[0], posts), { newer: undefined, older: posts[1] });
  assert.deepEqual(neighbours(posts[3], posts), { newer: posts[2], older: undefined });
});
