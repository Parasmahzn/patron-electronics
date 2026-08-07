import { z } from 'zod';

export const reviewSchema = z.object({
  authorName: z.string().trim().min(2, { error: 'Name is required' }).max(100),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(5, { error: 'Comment is too short' }).max(1000),
  isVisible: z.boolean().default(true),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
