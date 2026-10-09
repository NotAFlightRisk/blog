import { readdirSync } from 'node:fs';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const kebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// a post can't borrow the address of a page that's already there
const taken = readdirSync('src/pages').map((name) => name.replace(/\.\w+$/, ''));

function slugOf({ entry }: { entry: string }) {
  const [slug] = entry.split('/');
  if (!kebab.test(slug) || taken.includes(slug)) {
    throw new Error(`posts/${slug} wants a lowercase-and-hyphens name that isn't already a page`);
  }
  return slug;
}

const posts = defineCollection({
  loader: glob({ pattern: '*/index.{md,mdx}', base: './posts', generateId: slugOf }),
  schema: ({ image }) =>
    z
      .strictObject({
        title: z.string().min(1).max(90),
        // long enough to say something, short enough that Google doesn't chop it
        description: z.string().min(50).max(160),
        date: z.coerce.date(),
        updated: z.coerce.date().optional(),
        tags: z.array(z.string().regex(kebab, 'tags are lowercase-and-hyphens')).min(1).max(6),
        draft: z.boolean().default(false),
        cover: z.strictObject({ src: image(), alt: z.string().min(1) }).optional(),
      })
      .refine(({ date, updated }) => !updated || updated >= date, {
        message: "updated can't be before date",
        path: ['updated'],
      }),
});

export const collections = { posts };
