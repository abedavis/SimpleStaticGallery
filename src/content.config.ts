import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Every .md / .mdx file under src/content/gallery becomes one subpage.
// Images and videos can live next to the markdown file.
const gallery = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/gallery' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      // Shown under the link on the landing page.
      description: z.string(),
      author: z.string().optional(),
      date: z.coerce.date().optional(),
      // Optional preview image for the landing page (path relative to the md file).
      thumbnail: image().optional(),
      // Drafts are excluded from the build.
      draft: z.boolean().default(false),
      // Optional short summary shown in a callout at the very top of the page.
      // Supports `code`, **bold**, and *italic*.
      tldr: z.string().optional(),
    }),
});

export const collections = { gallery };
