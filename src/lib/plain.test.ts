import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
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

test('a figure without a caption closes itself, and leaves the next one alone', () => {
  const body = [
    "import one from './one.png';",
    "import two from './two.png';",
    '<Figure src={one} alt="One" />',
    'Between them.',
    '<Figure src={two} alt="Two">The second</Figure>',
  ].join('\n');
  assert.equal(
    plainMarkdown(body, files),
    `![One](${files}one.png)\nBetween them.\n![Two](${files}two.png)\n\n_The second_`,
  );
});

test("every picture a real post imports makes it into that post's .md copy", () => {
  for (const slug of readdirSync('posts')) {
    const source = ['mdx', 'md'].map((ext) => `posts/${slug}/index.${ext}`).find(existsSync)!;
    const body = readFileSync(source, 'utf8');
    const plain = plainMarkdown(body, files);
    for (const [, file] of body.matchAll(
      /^import \w+ from '\.\/(.+\.(?:png|jpe?g|gif|webp|svg))';$/gm,
    )) {
      assert.ok(plain.includes(`${files}${file}`), `${slug}: ${file} is missing from the .md copy`);
    }
    assert.doesNotMatch(plain, /<Figure\b/, `${slug}: a Figure tag leaked into the .md copy`);
  }
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

test('the other charts read the same way as Chart does', () => {
  const body = [
    "import groups from './groups.json';",
    '<Waffle title="Who can go closed" data={groups} of={50} />',
    '<Matrix title="Who has a CLA" data={[{ app: "Plane", cla: true }]}>Read in October</Matrix>',
  ].join('\n');
  assert.equal(
    plainMarkdown(body, files),
    `**Who can go closed** ([the data](${files}groups.json))\n**Who has a CLA**\n\n_Read in October_`,
  );
});

test('charts can show as their pictures too, numbered in order', () => {
  const body =
    '<Chart title="One" data={[]} />\n```\n<Chart title="Code" />\n```\n<Waffle title="Two" data={[]} />';
  assert.equal(
    plainMarkdown(body, files, (chart) => `${files}charts/${chart}.png`),
    `![One](${files}charts/1.png)\n\n**One**\n\`\`\`\n<Chart title="Code" />\n\`\`\`\n![Two](${files}charts/2.png)\n\n**Two**`,
  );
});

test('quotes keep who said it, linked when there is a source', () => {
  assert.equal(
    plainMarkdown(
      '<Quote by="A user" href="https://example.com/a">\n  Not a legal issue.\n</Quote>',
      files,
    ),
    '> Not a legal issue.\n>\n> - [A user](https://example.com/a)',
  );
  assert.equal(plainMarkdown('<Quote by="Someone">Hi.</Quote>', files), '> Hi.\n>\n> - Someone');
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
