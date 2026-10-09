import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import satori from 'satori';
import sharp from 'sharp';
import { site } from '../site';
import { penguinSvg } from './penguin';

// satori wants plain hex and woff, so the share card keeps its own little palette
const ink = '#151b23';
const require = createRequire(import.meta.url);
const font = (weight: 400 | 800) =>
  readFile(
    require.resolve(
      `@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-${weight}-normal.woff`,
    ),
  ).then((data) => ({ name: 'Bricolage', data, weight, style: 'normal' as const }));

let fonts: ReturnType<typeof load> | undefined;
const load = () => Promise.all([font(400), font(800)]);
const penguin = `data:image/svg+xml;base64,${Buffer.from(penguinSvg(ink, site.color)).toString('base64')}`;

const el = (type: string, props: Record<string, unknown>, ...children: unknown[]) => ({
  type,
  props: { ...props, children },
});

// peng.ly's share card, yellow all over with the penguin popping up from the bottom
export async function ogImage(title: string, footnote: string) {
  fonts ??= load();
  const card = el(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        padding: '64px 72px',
        background: site.color,
        color: ink,
        fontFamily: 'Bricolage',
      },
    },
    el('div', { style: { fontSize: 44, fontWeight: 800, letterSpacing: '-0.04em' } }, site.name),
    el(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: 28, width: 820 } },
      el(
        'div',
        {
          style: {
            fontSize: title.length > 48 ? 68 : 84,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '-0.04em',
          },
        },
        title,
      ),
      el('div', { style: { fontSize: 30 } }, footnote),
    ),
    el('img', {
      src: penguin,
      width: 300,
      height: 274,
      style: { position: 'absolute', right: 48, bottom: -24 },
    }),
  );
  const svg = await satori(card, { width: 1200, height: 630, fonts: await fonts });
  return sharp(Buffer.from(svg)).png().toBuffer();
}
