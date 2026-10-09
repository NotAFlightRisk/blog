import assert from 'node:assert/strict';
import { test } from 'node:test';
import { plainMarkdown } from './plain.ts';

const files = 'https://example.com/posts/demo/';

test('imports go, and imported files become links to where they live', () => {
  const body = [
    "import Figure from '../../src/components/mdx/Figure.astro';",
    "import rail from './rail.png';",
    '',
    '<Figure src={rail} alt="The rail">',
    '  Where the dates live',
    '</Figure>',
  ].join('\n');
  assert.equal(
    plainMarkdown(body, files),
    `![The rail](${files}rail.png)\n\n_Where the dates live_`,
  );
});

test('callouts turn into GitHub style alerts, keeping a custom title', () => {
  assert.equal(
    plainMarkdown('<Callout type="tip" title="Pro tip">Use it.</Callout>', files),
    '> [!TIP]\n> **Pro tip**\n> Use it.',
  );
  assert.equal(
    plainMarkdown('<Callout>Just so you know.</Callout>', files),
    '> [!NOTE]\n> Just so you know.',
  );
});

test('videos become links, to YouTube or to the file next to the post', () => {
  const body = [
    "import clip from './clip.webm';",
    "import still from './clip.png';",
    '<Video youtube="abc123" title="A talk" />',
    '<Video src={clip} poster={still.src} title="A clip" />',
  ].join('\n');
  assert.equal(
    plainMarkdown(body, files),
    `[Video: A talk](https://www.youtube.com/watch?v=abc123)\n[Video: A clip](${files}clip.webm)`,
  );
});

test('examples inside code fences are left exactly as written', () => {
  const body = '```mdx\n<Callout type="tip">Use it.</Callout>\nimport x from \'./x.png\';\n```';
  assert.equal(plainMarkdown(body, files), body);
});
