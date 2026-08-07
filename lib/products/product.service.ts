import 'server-only';
import { prisma } from '@/lib/db/client';
import { requireAdmin } from '@/lib/auth/session';
import { productSchema, type ProductInput } from '@/lib/validations/product';
import { deleteUploadedImageInternal } from '@/lib/uploads/upload.service';
import { DEFAULT_PAGE_SIZE } from '@/config/site';

function toImageRowData(image: ProductInput['images'][number], index: number) {
  return {
    url: image.url,
    alt: image.alt,
    sortOrder: index,
    isPrimary: image.isPrimary,
    storageKey: image.storageKey ?? null,
    originalName: image.originalName ?? null,
    mimeType: image.mimeType ?? null,
    fileSize: image.fileSize ?? null,
    width: image.width ?? null,
    height: image.height ?? null,
    format: image.format ?? null,
  };
}

function extractKeys(images: { storageKey?: string }[]): Set<string> {
  return new Set(
    images.map((image) => image.storageKey).filter((key): key is string => Boolean(key)),
  );
}

export async function createProduct(input: ProductInput) {
  await requireAdmin();
  const data = productSchema.parse(input);
  const { images, specifications, ...rest } = data;

  try {
    return await prisma.product.create({
      data: {
        ...rest,
        discountPrice: rest.discountPrice ?? null,
        warranty: rest.warranty || null,
        tags: rest.tags || null,
        images: {
          create: images.map((image, index) => toImageRowData(image, index)),
        },
        specifications: {
          create: specifications.map((spec, index) => ({
            label: spec.label,
            value: spec.value,
            displayOrder: index,
          })),
        },
      },
    });
  } catch (error) {
    // The DB write failed — clean up any files uploaded for this attempt so
    // nothing sits on disk unreferenced by any record.
    const uploadedKeys = extractKeys(images);
    await Promise.allSettled([...uploadedKeys].map((key) => deleteUploadedImageInternal(key)));
    throw error;
  }
}

export async function updateProduct(id: number, input: ProductInput) {
  await requireAdmin();
  const data = productSchema.parse(input);
  const { images, specifications, ...rest } = data;

  const existingImages = await prisma.productImage.findMany({
    where: { productId: id },
    select: { storageKey: true },
  });
  const previousKeys = extractKeys(
    existingImages.map((image) => ({ storageKey: image.storageKey ?? undefined })),
  );
  const nextKeys = extractKeys(images);

  let product;
  try {
    product = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id },
        data: {
          ...rest,
          discountPrice: rest.discountPrice ?? null,
          warranty: rest.warranty || null,
          tags: rest.tags || null,
        },
      });

      await tx.productImage.deleteMany({ where: { productId: id } });
      if (images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((image, index) => ({ productId: id, ...toImageRowData(image, index) })),
        });
      }

      await tx.productSpecification.deleteMany({ where: { productId: id } });
      if (specifications.length > 0) {
        await tx.productSpecification.createMany({
          data: specifications.map((spec, index) => ({
            productId: id,
            label: spec.label,
            value: spec.value,
            displayOrder: index,
          })),
        });
      }

      return updated;
    });
  } catch (error) {
    // Transaction rolled back — the DB still references the previous image
    // set. Clean up newly-uploaded files from this attempt that never
    // became referenced by anything (never touch the previous set here).
    const orphanedNewKeys = [...nextKeys].filter((key) => !previousKeys.has(key));
    await Promise.allSettled(orphanedNewKeys.map((key) => deleteUploadedImageInternal(key)));
    throw error;
  }

  // Only now — after the DB durably references the new image set — is it
  // safe to delete files for images that were replaced or removed.
  const removedKeys = [...previousKeys].filter((key) => !nextKeys.has(key));
  await Promise.allSettled(removedKeys.map((key) => deleteUploadedImageInternal(key)));

  return product;
}

export async function setProductActive(id: number, isActive: boolean) {
  await requireAdmin();
  return prisma.product.update({ where: { id }, data: { isActive } });
}

/** Products referenced by past orders are never hard-deleted — archive instead. */
export async function deleteProduct(id: number) {
  await requireAdmin();
  const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });
  if (orderItemCount > 0) {
    throw new Error(
      'This product appears in past orders and cannot be deleted. Archive it instead.',
    );
  }

  const existingImages = await prisma.productImage.findMany({
    where: { productId: id },
    select: { storageKey: true },
  });

  // ProductImage rows cascade-delete with the product; the DB is the
  // source of truth, so files are only cleaned up after this succeeds.
  const deleted = await prisma.product.delete({ where: { id } });

  const keysToClean = existingImages
    .map((image) => image.storageKey)
    .filter((key): key is string => Boolean(key));
  await Promise.allSettled(keysToClean.map((key) => deleteUploadedImageInternal(key)));

  return deleted;
}

export async function getProductByIdForAdmin(id: number) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      specifications: { orderBy: { displayOrder: 'asc' } },
      category: { select: { id: true, name: true } },
    },
  });
}

export type AdminProductListParams = {
  q?: string;
  categoryId?: number;
  status?: 'active' | 'archived';
  page?: number;
};

export async function listProductsForAdmin(params: AdminProductListParams) {
  const page = params.page ?? 1;
  const take = DEFAULT_PAGE_SIZE;
  const skip = (page - 1) * take;

  const where = {
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q } },
            { sku: { contains: params.q } },
            { brand: { contains: params.q } },
          ],
        }
      : {}),
    ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    ...(params.status ? { isActive: params.status === 'active' } : {}),
  };

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        category: { select: { name: true } },
        images: { where: { isPrimary: true }, take: 1, select: { url: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { products, totalCount, totalPages: Math.max(1, Math.ceil(totalCount / take)), page };
}

export async function getLowStockProducts() {
  return prisma.$queryRaw<
    Array<{ id: number; name: string; sku: string; stock: number; lowStockThreshold: number }>
  >`
    SELECT id, name, sku, stock, lowStockThreshold
    FROM Product
    WHERE isActive = true AND stock > 0 AND stock <= lowStockThreshold
    ORDER BY stock ASC
  `;
}

export async function getOutOfStockProducts() {
  return prisma.product.findMany({
    where: { isActive: true, stock: { lte: 0 } },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, name: true, sku: true, stock: true },
  });
}
