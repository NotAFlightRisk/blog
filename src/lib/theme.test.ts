import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { themeScript } from './theme.ts';

test("vercel.json's CSP trusts the theme script as it is now", async () => {
  const { headers } = JSON.parse(await readFile('vercel.json', 'utf8'));
  const csp = headers
    .flatMap(({ headers }: { headers: { key: string; value: string }[] }) => headers)
    .find(({ key }: { key: string }) => key === 'Content-Security-Policy').value;
  const hash = `'sha256-${createHash('sha256').update(themeScript).digest('base64')}'`;
  assert.ok(csp.includes(hash), `script-src wants ${hash}`);
});
