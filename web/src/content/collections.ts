// NPOS Dynamic Routes for Astro
// Render markdown files as pages dynamically

import { defineCollection } from 'astro:content';
import { glob } from 'astro:io';

// Framework collection
export const framework = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'D:/ObsidianVault/networkfunk-production-os/Framework' }),
  schema: ({ image }) => ({
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional()
  })
});

// Knowledge collection
export const knowledge = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'D:/ObsidianVault/networkfunk-production-os/Knowledge' }),
  schema: ({ image }) => ({
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional()
  })
});

// Presets collection
export const presets = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'D:/ObsidianVault/networkfunk-production-os/Presets' }),
  schema: ({ image }) => ({
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional()
  })
});
