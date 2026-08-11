import { z } from 'zod';

// Always a real URL (unlike a Banner's linkUrl) — social links are always
// external profile pages, never a relative internal path.
export const socialLinkSchema = z.object({
  platform: z.string().trim().min(1, { error: 'Platform is required' }).max(50),
  url: z.url({ error: 'Enter a valid URL' }).max(300),
  isActive: z.boolean().default(true),
});

export type SocialLinkInput = z.infer<typeof socialLinkSchema>;

export const siteSettingsSchema = z.object({
  businessName: z.string().trim().min(2, { error: 'Business name is required' }).max(150),
  phone: z.string().trim().min(5, { error: 'Phone number is required' }).max(30),
  address: z.string().trim().min(5, { error: 'Address is required' }).max(300),
  announcementText: z.string().trim().max(200).optional().or(z.literal('')),
  heroHeading: z.string().trim().min(2, { error: 'Hero heading is required' }).max(150),
  heroSubheading: z.string().trim().min(2, { error: 'Hero subheading is required' }).max(300),
  aboutText: z.string().trim().max(2000).optional().or(z.literal('')),
  socialLinks: z.array(socialLinkSchema).default([]),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
