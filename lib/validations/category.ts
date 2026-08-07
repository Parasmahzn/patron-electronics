import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().trim().min(2, { error: 'Name is required' }).max(100),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, { error: 'Use lowercase letters, numbers, and hyphens only' }),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  image: z.string().trim().max(500).optional().or(z.literal('')),
  displayOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type CategoryInput = z.infer<typeof categorySchema>;
