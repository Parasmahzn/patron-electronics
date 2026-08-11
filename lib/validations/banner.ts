import { z } from 'zod';

export const bannerSchema = z.object({
  title: z.string().trim().min(2, { error: 'Title is required' }).max(150),
  image: z.string().trim().min(1, { error: 'Image is required' }).max(500),
  // Not z.url() — this needs to accept relative internal paths
  // (/products/foo, /shop?category=bar) as well as full external URLs.
  linkUrl: z.string().trim().max(500).optional().or(z.literal('')),
  displayOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type BannerInput = z.infer<typeof bannerSchema>;
