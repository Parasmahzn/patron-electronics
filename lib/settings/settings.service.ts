import 'server-only';
import { prisma } from '@/lib/db/client';
import { requireAdmin } from '@/lib/auth/session';
import { siteSettingsSchema, type SiteSettingsInput } from '@/lib/validations/settings';

export async function getSiteSettings() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (settings) return settings;
  return prisma.siteSettings.create({ data: { id: 1 } });
}

export async function updateSiteSettings(input: SiteSettingsInput) {
  await requireAdmin();
  const data = siteSettingsSchema.parse(input);
  return prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {
      ...data,
      facebookUrl: data.facebookUrl || null,
      announcementText: data.announcementText || null,
      aboutText: data.aboutText || null,
    },
    create: {
      id: 1,
      ...data,
      facebookUrl: data.facebookUrl || null,
      announcementText: data.announcementText || null,
      aboutText: data.aboutText || null,
    },
  });
}
