import 'server-only';
import { prisma } from '@/lib/db/client';
import { Prisma } from '@/lib/generated/prisma/client';
import { requireAdmin } from '@/lib/auth/session';
import { bannerSchema, type BannerInput } from '@/lib/validations/banner';
import {
  deleteUploadedImageInternal,
  extractStorageKeyFromUrl,
} from '@/lib/uploads/upload.service';

export async function getActiveBanners() {
  return prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
  });
}

export async function listBannersForAdmin() {
  return prisma.banner.findMany({ orderBy: { displayOrder: 'asc' } });
}

export async function getBannerById(id: number) {
  return prisma.banner.findUnique({ where: { id } });
}

export async function createBanner(input: BannerInput) {
  await requireAdmin();
  const data = bannerSchema.parse(input);
  try {
    return await prisma.banner.create({
      data: { ...data, linkUrl: data.linkUrl || null },
    });
  } catch (error) {
    const key = extractStorageKeyFromUrl(data.image);
    if (key) await deleteUploadedImageInternal(key);
    throw error;
  }
}

export async function updateBanner(id: number, input: BannerInput) {
  await requireAdmin();
  const data = bannerSchema.parse(input);

  const existing = await prisma.banner.findUnique({ where: { id }, select: { image: true } });
  const previousKey = extractStorageKeyFromUrl(existing?.image);
  const nextKey = extractStorageKeyFromUrl(data.image);

  const updated = await prisma.banner.update({
    where: { id },
    data: { ...data, linkUrl: data.linkUrl || null },
  });

  // Only clean up the old file after the new reference is durably saved,
  // and only if it was actually replaced (not the same managed image).
  if (previousKey && previousKey !== nextKey) {
    await deleteUploadedImageInternal(previousKey);
  }

  return updated;
}

export async function setBannerActive(id: number, isActive: boolean) {
  await requireAdmin();
  return prisma.banner.update({ where: { id }, data: { isActive } });
}

/** Banners have no child records, so unlike categories/products there's no archive-instead-of-delete guard. */
export async function deleteBanner(id: number) {
  await requireAdmin();

  const existing = await prisma.banner.findUnique({ where: { id }, select: { image: true } });
  const deleted = await prisma.banner.delete({ where: { id } });

  const key = extractStorageKeyFromUrl(existing?.image);
  if (key) await deleteUploadedImageInternal(key);

  return deleted;
}

export async function reorderBanners(orderedIds: number[]) {
  await requireAdmin();
  if (orderedIds.length === 0) return;

  // A single UPDATE ... CASE statement instead of N transactional round
  // trips: the shared MySQL tier is slow enough that N sequential updates
  // inside prisma.$transaction() can exceed its 5s interactive timeout.
  const cases = Prisma.join(
    orderedIds.map((id, index) => Prisma.sql`WHEN ${id} THEN ${index}`),
    ' ',
  );
  const ids = Prisma.join(orderedIds);

  await prisma.$executeRaw`UPDATE Banner SET displayOrder = CASE id ${cases} END WHERE id IN (${ids})`;
}
