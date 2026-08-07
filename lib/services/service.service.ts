import 'server-only';
import { prisma } from '@/lib/db/client';
import { Prisma } from '@/lib/generated/prisma/client';
import { requireAdmin } from '@/lib/auth/session';
import { serviceSchema, type ServiceInput } from '@/lib/validations/service';
import {
  deleteUploadedImageInternal,
  extractStorageKeyFromUrl,
} from '@/lib/uploads/upload.service';

export async function getActiveServices() {
  return prisma.service.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } });
}

export async function getServiceBySlug(slug: string) {
  return prisma.service.findFirst({ where: { slug, isActive: true } });
}

export async function listServicesForAdmin() {
  await requireAdmin();
  return prisma.service.findMany({ orderBy: { displayOrder: 'asc' } });
}

export async function getServiceByIdForAdmin(id: number) {
  await requireAdmin();
  return prisma.service.findUnique({ where: { id } });
}

export async function createService(input: ServiceInput) {
  await requireAdmin();
  const data = serviceSchema.parse(input);
  try {
    return await prisma.service.create({
      data: { ...data, image: data.image || null, startingPrice: data.startingPrice ?? null },
    });
  } catch (error) {
    const key = extractStorageKeyFromUrl(data.image);
    if (key) await deleteUploadedImageInternal(key);
    throw error;
  }
}

export async function updateService(id: number, input: ServiceInput) {
  await requireAdmin();
  const data = serviceSchema.parse(input);

  const existing = await prisma.service.findUnique({ where: { id }, select: { image: true } });
  const previousKey = extractStorageKeyFromUrl(existing?.image);
  const nextKey = extractStorageKeyFromUrl(data.image);

  const updated = await prisma.service.update({
    where: { id },
    data: { ...data, image: data.image || null, startingPrice: data.startingPrice ?? null },
  });

  if (previousKey && previousKey !== nextKey) {
    await deleteUploadedImageInternal(previousKey);
  }

  return updated;
}

export async function setServiceActive(id: number, isActive: boolean) {
  await requireAdmin();
  return prisma.service.update({ where: { id }, data: { isActive } });
}

export async function deleteService(id: number) {
  await requireAdmin();
  const existing = await prisma.service.findUnique({ where: { id }, select: { image: true } });
  const deleted = await prisma.service.delete({ where: { id } });

  const key = extractStorageKeyFromUrl(existing?.image);
  if (key) await deleteUploadedImageInternal(key);

  return deleted;
}

export async function reorderServices(orderedIds: number[]) {
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

  await prisma.$executeRaw`UPDATE Service SET displayOrder = CASE id ${cases} END WHERE id IN (${ids})`;
}
