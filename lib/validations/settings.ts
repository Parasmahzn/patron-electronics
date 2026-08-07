import { z } from 'zod';

export const siteSettingsSchema = z.object({
  businessName: z.string().trim().min(2, { error: 'Business name is required' }).max(150),
  phone: z.string().trim().min(5, { error: 'Phone number is required' }).max(30),
  address: z.string().trim().min(5, { error: 'Address is required' }).max(300),
  facebookUrl: z.url({ error: 'Enter a valid URL' }).max(300).optional().or(z.literal('')),
  announcementText: z.string().trim().max(200).optional().or(z.literal('')),
  heroHeading: z.string().trim().min(2, { error: 'Hero heading is required' }).max(150),
  heroSubheading: z.string().trim().min(2, { error: 'Hero subheading is required' }).max(300),
  aboutText: z.string().trim().max(2000).optional().or(z.literal('')),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
