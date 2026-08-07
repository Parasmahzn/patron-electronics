import { z } from 'zod';

export const serviceSchema = z.object({
  name: z.string().trim().min(2, { error: 'Name is required' }).max(150),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(150)
    .regex(/^[a-z0-9-]+$/, { error: 'Use lowercase letters, numbers, and hyphens only' }),
  shortDescription: z.string().trim().min(5).max(200),
  description: z.string().trim().min(10, { error: 'Description is too short' }),
  image: z.string().trim().max(500).optional().or(z.literal('')),
  startingPrice: z.number().positive().nullable().optional(),
  displayOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
