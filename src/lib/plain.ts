const alerts = { note: 'NOTE', tip: 'TIP', warning: 'WARNING', danger: 'CAUTION' };
const charts = ['Chart', 'Waffle', 'Breakdown', 'Dots', 'Funnel', 'Heatmap', 'Scatter', 'Matrix'];

// a prop's value, whether it's a "string" or an {expression}, minus any .src on the end
const prop = (props: string, name: string) =>
  props
    .match(new RegExp(`\\b${name}=(?:"([^"]*)"|\\{(\\w+)(?:\\.src)?\\})`))
    ?.slice(1)
    .find(Boolean);

// anything else gets out of the way, keeping the words it wraps, from the inside out
const unwrap = (text: string): string => {
  const next = text
    .replace(/<([A-Z][\w.]*)[^>]*?\/>/g, '')
    .replace(/<([A-Z][\w.]*)[^>]*>((?:(?!<\1[\s>])[\s\S])*?)<\/\1>/g, '$2');
  return next === text ? text : unwrap(next);
};

const quote = (text: string) =>
  text
    .trim()
    .split('\n')
    .map((line) => `> ${line.trim()}`.trimEnd())
    .join('\n');

// turns an MDX body back into plain Markdown, so the .md copies read fine on their own.
// Given picture(n), the nth chart also shows as that picture
export function plainMarkdown(body: string, files: string, picture?: (chart: number) => string) {
  let drawn = 0;
  const imported = new Map(
    [...body.matchAll(/^import (\w+) from '\.\/(.+?)';$/gm)].map(([, name, file]) => [
      name,
      files + file,
    ]),
  );
  const link = (props: string, name: string) => {
    const value = prop(props, name) ?? '';
    return imported.get(value) ?? value;
  };

  // code fences sit at the odd indexes, and the examples in them stay exactly as written
  return body
    .split(/^(```[\s\S]*?^```)$/m)
    .map((part, index) =>
      index % 2
        ? part
        : part
            .replace(/^import .+\n/gm, '')
            .replace(/(\]\(|src=")\.\//g, `$1${files}`)
            .replace(/<Callout([^>]*)>([\s\S]*?)<\/Callout>/g, (_, props, text) => {
              const type = (prop(props, 'type') ?? 'note') as keyof typeof alerts;
              const title = prop(props, 'title');
              return quote(`[!${alerts[type]}]\n${title ? `**${title}**\n` : ''}${text}`);
            })
            .replace(
              /<Figure([^>]*)>([\s\S]*?)<\/Figure>/g,
              (_, props, caption) =>
                `![${prop(props, 'alt')}](${link(props, 'src')})\n\n_${caption.trim()}_`,
            )
            .replace(/<Video([^>]*?)\/>/g, (_, props) => {
              const youtube = prop(props, 'youtube');
              const url = youtube
                ? `https://www.youtube.com/watch?v=${youtube}`
                : link(props, 'src');
              return `[Video: ${prop(props, 'title')}](${url})`;
            })
            .replace(
              new RegExp(`<(${charts.join('|')})\\b([^>]*?)(?:/>|>([\\s\\S]*?)</\\1>)`, 'g'),
              (_, _name, props, caption = '') => {
                const data = imported.get(prop(props, 'data') ?? '');
                const name = prop(props, 'title');
                const image = picture ? `![${name}](${picture(++drawn)})\n\n` : '';
                const title = `${image}**${name}**${data ? ` ([the data](${data}))` : ''}`;
                return caption.trim() ? `${title}\n\n_${caption.trim()}_` : title;
              },
            )
            .replace(/<Quote([^>]*)>([\s\S]*?)<\/Quote>/g, (_, props, text) => {
              const by = prop(props, 'by');
              const href = prop(props, 'href');
              return quote(`${text.trim()}\n\n- ${href ? `[${by}](${href})` : by}`);
            }),
    )
    .map((part, index) => (index % 2 ? part : unwrap(part)))
    .join('')
    .trim();
}
