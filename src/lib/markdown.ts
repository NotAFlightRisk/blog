import { rehypeHeadingIds, unified } from '@astrojs/markdown-remark';
import { transformerMetaHighlight } from '@shikijs/transformers';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import type { AstroUserConfig } from 'astro';
import type { ShikiTransformer } from 'shiki';
import { site } from '../site';

// ```ts title="hello.ts" puts the file name on top of the block
const fileName: ShikiTransformer = {
  name: 'file-name',
  root(root) {
    const name = this.options.meta?.__raw?.match(/title="([^"]+)"/)?.[1];
    if (!name) return;
    const caption = {
      type: 'element' as const,
      tagName: 'figcaption',
      properties: {},
      children: [{ type: 'text' as const, value: name }],
    };
    root.children = [
      {
        type: 'element',
        tagName: 'figure',
        properties: { className: ['code'], dataPagefindIgnore: '' },
        children: [caption, ...root.children.filter((node) => node.type === 'element')],
      },
    ];
  },
};

// code makes for unreadable search snippets, so Pagefind skips it
const unsearched: ShikiTransformer = {
  name: 'unsearched',
  pre(pre) {
    pre.properties.dataPagefindIgnore = '';
  },
};

type Node = {
  type: string;
  url?: string;
  alt?: string | null;
  properties?: { href?: string; target?: string };
  children?: Node[];
};

const walk = (node: Node, visit: (node: Node) => void) => {
  visit(node);
  node.children?.forEach((child) => walk(child, visit));
};

// a picture with no words is a blank to anyone on a screen reader, so the build won't have it
const altText = () => (tree: Node, file: { path?: string }) =>
  walk(tree, (node) => {
    if (node.type === 'image' && !node.alt?.trim()) {
      throw new Error(`${file.path}: ${node.url} needs alt text, like ![what's in it](...)`);
    }
  });

const home = new URL(site.url).origin;

// links off the blog open in a new tab, so the post's still there when you're back
const newTab = () => (tree: Node) =>
  walk(tree, ({ properties }) => {
    if (!properties?.href) return;
    const url = URL.parse(properties.href, home);
    if (url && url.origin !== home && /^https?:$/.test(url.protocol)) {
      properties.target = '_blank';
    }
  });

export const markdown: AstroUserConfig['markdown'] = {
  processor: unified({
    remarkPlugins: [altText],
    // Astro adds heading ids after our plugins, so they have to be in place before the links
    rehypePlugins: [rehypeHeadingIds, [rehypeAutolinkHeadings, { behavior: 'wrap' }], newTab],
  }),
  shikiConfig: {
    theme: 'css-variables',
    // ```ts {2,4-5} lights up those lines
    transformers: [transformerMetaHighlight(), unsearched, fileName],
  },
};
