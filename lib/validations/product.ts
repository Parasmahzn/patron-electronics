import { z } from 'zod';

export const productTypeSchema = z.enum(['MOBILE', 'LAPTOP', 'ACCESSORY', 'GADGET']);

export const productSchema = z
  .object({
    name: z.string().trim().min(2, { error: 'Name is required' }).max(200),
    slug: z
      .string()
      .trim()
      .min(2)
      .max(200)
      .regex(/^[a-z0-9-]+$/, { error: 'Use lowercase letters, numbers, and hyphens only' }),
    sku: z.string().trim().min(2, { error: 'SKU is required' }).max(60),
    brand: z.string().trim().min(1, { error: 'Brand is required' }).max(80),
    categoryId: z.number().int().positive({ error: 'Select a category' }),
    productType: productTypeSchema,
    description: z.string().trim().min(10, { error: 'Description is too short' }),
    shortDescription: z.string().trim().min(5).max(200),
    price: z.number().positive({ error: 'Price must be greater than 0' }),
    discountPrice: z.number().positive().nullable().optional(),
    stock: z.number().int().min(0, { error: 'Stock cannot be negative' }),
    lowStockThreshold: z.number().int().min(0).default(5),
    warranty: z.string().trim().max(100).optional().or(z.literal('')),
    tags: z.string().trim().max(300).optional().or(z.literal('')),
    isActive: z.boolean().default(true),
    isNew: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
    isBestSeller: z.boolean().default(false),
    isTopSale: z.boolean().default(false),
    isRecommended: z.boolean().default(false),
    isOnSale: z.boolean().default(false),
    images: z
      .array(
        z.object({
          url: z.string().trim().min(1),
          alt: z.string().trim().min(1),
          isPrimary: z.boolean().default(false),
          storageKey: z.string().trim().min(1).optional(),
          originalName: z.string().trim().optional(),
          mimeType: z.string().trim().optional(),
          fileSize: z.number().int().positive().optional(),
          width: z.number().int().positive().optional(),
          height: z.number().int().positive().optional(),
          format: z.string().trim().optional(),
        }),
      )
      .default([]),
    specifications: z
      .array(
        z.object({
          label: z.string().trim().min(1),
          value: z.string().trim().min(1),
        }),
      )
      .default([]),
  })
  .refine((data) => !data.discountPrice || data.discountPrice < data.price, {
    error: 'Discount price must be less than the regular price',
    path: ['discountPrice'],
  });

export type ProductInput = z.infer<typeof productSchema>;
