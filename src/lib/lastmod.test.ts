import assert from 'node:assert/strict';
import { test } from 'node:test';
import { lastModified } from './lastmod.ts';

test('a post was last changed when it was updated, or else when it went out', () => {
  assert.equal(
    lastModified('---\ntitle: A\ndate: 2026-10-07\nupdated: 2026-10-09\n---'),
    '2026-10-09',
  );
  assert.equal(lastModified("---\ndate: '2026-10-07'\n---"), '2026-10-07');
  assert.equal(lastModified('---\ntitle: No dates\n---'), undefined);
});
