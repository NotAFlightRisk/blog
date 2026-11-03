import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { peekScript } from './peek.ts';
import { speculationRules } from './speculation.ts';
import { themeScript } from './theme.ts';

// the only inline scripts, so the CSP trusts each by the hash of exactly what's in it
const inline = {
  'theme script': themeScript,
  'peek script': peekScript,
  'speculation rules': speculationRules,
};

for (const [name, source] of Object.entries(inline)) {
  test(`vercel.json's CSP has the hash of the ${name} as it is now`, async () => {
    const { headers } = JSON.parse(await readFile('vercel.json', 'utf8'));
    const csp = headers
      .flatMap(({ headers }: { headers: { key: string; value: string }[] }) => headers)
      .find(({ key }: { key: string }) => key === 'Content-Security-Policy').value;
    const hash = `'sha256-${createHash('sha256').update(source).digest('base64')}'`;
    assert.ok(csp.includes(hash), `script-src wants ${hash}`);
  });
}
