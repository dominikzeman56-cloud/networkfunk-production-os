import { z } from 'zod';
// NPOS Content Collections
// Defines Astro content collections for markdown files from the project vault

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { paths } from '../lib/config';

const markdownSchema = ({ z }: { z: any }) => z.object({
  title: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional()
});

// Framework collection
export const framework = defineCollection({
  loader: glob({ pattern: '**/*.md', base: paths.framework }),
  schema: markdownSchema
});

// Knowledge collection
export const knowledge = defineCollection({
  loader: glob({ pattern: '**/*.md', base: paths.knowledge }),
  schema: markdownSchema
});

// Presets collection
export const presets = defineCollection({
  loader: glob({ pattern: '**/*.md', base: paths.presets }),
  schema: markdownSchema
});

export const collections = { framework, knowledge, presets };
