import 'server-only';
import { prisma } from '@/lib/db/client';
import { requireAdmin } from '@/lib/auth/session';
import { categorySchema, type CategoryInput } from '@/lib/validations/category';
import {
  deleteUploadedImageInternal,
  extractStorageKeyFromUrl,
} from '@/lib/uploads/upload.service';

export async function getActiveCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findFirst({ where: { slug, isActive: true } });
}

export async function listCategoriesForAdmin() {
  return prisma.category.findMany({
    orderBy: { displayOrder: 'asc' },
    include: { _count: { select: { products: true } } },
  });
}

export async function getCategoryById(id: number) {
  return prisma.category.findUnique({ where: { id } });
}

export async function createCategory(input: CategoryInput) {
  await requireAdmin();
  const data = categorySchema.parse(input);
  try {
    return await prisma.category.create({
      data: { ...data, description: data.description || null, image: data.image || null },
    });
  } catch (error) {
    const key = extractStorageKeyFromUrl(data.image);
    if (key) await deleteUploadedImageInternal(key);
    throw error;
  }
}

export async function updateCategory(id: number, input: CategoryInput) {
  await requireAdmin();
  const data = categorySchema.parse(input);

  const existing = await prisma.category.findUnique({ where: { id }, select: { image: true } });
  const previousKey = extractStorageKeyFromUrl(existing?.image);
  const nextKey = extractStorageKeyFromUrl(data.image);

  const updated = await prisma.category.update({
    where: { id },
    data: { ...data, description: data.description || null, image: data.image || null },
  });

  // Only clean up the old file after the new reference is durably saved,
  // and only if it was actually replaced (not the same managed image).
  if (previousKey && previousKey !== nextKey) {
    await deleteUploadedImageInternal(previousKey);
  }

  return updated;
}

/** Categories referenced by products are never hard-deleted — only archived. */
export async function archiveCategory(id: number) {
  await requireAdmin();
  return prisma.category.update({ where: { id }, data: { isActive: false } });
}

export async function setCategoryActive(id: number, isActive: boolean) {
  await requireAdmin();
  return prisma.category.update({ where: { id }, data: { isActive } });
}

export async function deleteCategory(id: number) {
  await requireAdmin();
  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    throw new Error('This category has products assigned to it. Archive it instead of deleting.');
  }

  const existing = await prisma.category.findUnique({ where: { id }, select: { image: true } });
  const deleted = await prisma.category.delete({ where: { id } });

  const key = extractStorageKeyFromUrl(existing?.image);
  if (key) await deleteUploadedImageInternal(key);

  return deleted;
}

export async function reorderCategories(orderedIds: number[]) {
  await requireAdmin();
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.category.update({ where: { id }, data: { displayOrder: index } }),
    ),
  );
}
