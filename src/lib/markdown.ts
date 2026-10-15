import { rehypeHeadingIds, unified } from '@astrojs/markdown-remark';
import { transformerMetaHighlight } from '@shikijs/transformers';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import type { AstroUserConfig } from 'astro';
import type { ShikiTransformer } from 'shiki';

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

type Node = { type: string; url?: string; alt?: string | null; children?: Node[] };

// a picture with no words is a blank to anyone on a screen reader, so the build won't have it
const altText = () => (tree: Node, file: { path?: string }) => {
  const check = (node: Node) => {
    if (node.type === 'image' && !node.alt?.trim()) {
      throw new Error(`${file.path}: ${node.url} needs alt text, like ![what's in it](...)`);
    }
    node.children?.forEach(check);
  };
  check(tree);
};

export const markdown: AstroUserConfig['markdown'] = {
  processor: unified({
    remarkPlugins: [altText],
    // Astro adds heading ids after our plugins, so they have to be in place before the links
    rehypePlugins: [rehypeHeadingIds, [rehypeAutolinkHeadings, { behavior: 'wrap' }]],
  }),
  shikiConfig: {
    theme: 'css-variables',
    // ```ts {2,4-5} lights up those lines
    transformers: [transformerMetaHighlight(), unsearched, fileName],
  },
};
