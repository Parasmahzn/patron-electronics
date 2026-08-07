import { z } from 'zod';

export const productSortValues = [
  'relevance',
  'newest',
  'oldest',
  'most-sold',
  'popular',
  'featured',
  'price-asc',
  'price-desc',
] as const;

export const productSearchSchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.string().trim().max(100).optional(),
  brand: z.string().trim().max(100).optional(),
  minPrice: z.coerce.number().nonnegative().optional().catch(undefined),
  maxPrice: z.coerce.number().nonnegative().optional().catch(undefined),
  availability: z.enum(['in-stock', 'out-of-stock']).optional(),
  type: z.enum(['MOBILE', 'LAPTOP', 'ACCESSORY', 'GADGET']).optional(),
  sort: z.enum(productSortValues).optional(),
  page: z.coerce.number().int().positive().optional().catch(undefined),
});

export type ProductSearchInput = z.infer<typeof productSearchSchema>;
