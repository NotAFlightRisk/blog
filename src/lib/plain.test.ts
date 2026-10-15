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

test('charts become their title, a link to the data and the caption', () => {
  const body = [
    "import fixes from './fixes.json';",
    '<Chart type="line" title="Fixes that needed fixing" data={fixes} unit="%">',
    '  Reviewed advisories, each autumn',
    '</Chart>',
    '<Chart title="Inline data" data={[{ year: 2026, share: 10 }]} />',
  ].join('\n');
  assert.equal(
    plainMarkdown(body, files),
    `**Fixes that needed fixing** ([the data](${files}fixes.json))\n\n_Reviewed advisories, each autumn_\n**Inline data**`,
  );
});

test('components it has never heard of go, but keep the words inside them', () => {
  const body =
    "import Thing from './Thing.astro';\n<Thing size={2} />\n<Thing>Still **here**</Thing>";
  assert.equal(plainMarkdown(body, files), 'Still **here**');
  assert.equal(
    plainMarkdown('<Box>one <Box>two</Box> <Row><Cell>three</Cell></Row></Box>', files),
    'one two three',
  );
});

test('examples inside code fences are left exactly as written', () => {
  const body = '```mdx\n<Callout type="tip">Use it.</Callout>\nimport x from \'./x.png\';\n```';
  assert.equal(plainMarkdown(body, files), body);
});
