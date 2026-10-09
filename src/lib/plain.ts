const alerts = { note: 'NOTE', tip: 'TIP', warning: 'WARNING', danger: 'CAUTION' };

// a prop's value, whether it's a "string" or an {expression}, minus any .src on the end
const prop = (props: string, name: string) =>
  props
    .match(new RegExp(`\\b${name}=(?:"([^"]*)"|\\{(\\w+)(?:\\.src)?\\})`))
    ?.slice(1)
    .find(Boolean);

const quote = (text: string) =>
  text
    .trim()
    .split('\n')
    .map((line) => `> ${line.trim()}`.trimEnd())
    .join('\n');

// turns an MDX body back into plain Markdown, so the .md copies read fine on their own
export function plainMarkdown(body: string, files: string) {
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
            }),
    )
    .join('')
    .trim();
}
