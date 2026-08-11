import 'server-only';
import { prisma } from '@/lib/db/client';
import { requireAdmin } from '@/lib/auth/session';
import { siteSettingsSchema, type SiteSettingsInput } from '@/lib/validations/settings';

export async function getSiteSettings() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (settings) return settings;
  return prisma.siteSettings.create({ data: { id: 1 } });
}

/** Footer-facing: active social links only, in admin-configured order. */
export async function getActiveSocialLinks() {
  return prisma.socialLink.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
  });
}

/** Settings-page-facing: every social link (including hidden ones), so the admin can edit them all. */
export async function listSocialLinksForAdmin() {
  return prisma.socialLink.findMany({ orderBy: { displayOrder: 'asc' } });
}

export async function updateSiteSettings(input: SiteSettingsInput) {
  await requireAdmin();
  const { socialLinks, ...data } = siteSettingsSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const settings = await tx.siteSettings.upsert({
      where: { id: 1 },
      update: {
        ...data,
        announcementText: data.announcementText || null,
        aboutText: data.aboutText || null,
      },
      create: {
        id: 1,
        ...data,
        announcementText: data.announcementText || null,
        aboutText: data.aboutText || null,
      },
    });

    // Social links are a flat, admin-managed list independent of any single
    // settings field — replaced wholesale on every save, same pattern as
    // ProductSpecification rows in product.service.ts.
    await tx.socialLink.deleteMany({});
    if (socialLinks.length > 0) {
      await tx.socialLink.createMany({
        data: socialLinks.map((link, index) => ({
          platform: link.platform.trim().toLowerCase(),
          url: link.url,
          isActive: link.isActive,
          displayOrder: index,
        })),
      });
    }

    return settings;
  });
}
