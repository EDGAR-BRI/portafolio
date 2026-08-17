import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const proyectos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/proyectos' }),
  schema: z.object({
    lang: z.enum(['es', 'en']),
    title: z.string(),
    subtitle: z.string(),
    description: z.string(),
    stack: z.array(z.string()),
    repo: z.string().url(),
    demo: z.string().url().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(99),
    year: z.string().optional(),
  }),
});

export const collections = { proyectos };