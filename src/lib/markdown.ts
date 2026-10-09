import { unified } from '@astrojs/markdown-remark';
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
        properties: { className: ['code'] },
        children: [caption, ...root.children.filter((node) => node.type === 'element')],
      },
    ];
  },
};

export const markdown: AstroUserConfig['markdown'] = {
  processor: unified({
    rehypePlugins: [[rehypeAutolinkHeadings, { behavior: 'wrap' }]],
  }),
  shikiConfig: {
    theme: 'css-variables',
    // ```ts {2,4-5} lights up those lines
    transformers: [transformerMetaHighlight(), fileName],
  },
};
