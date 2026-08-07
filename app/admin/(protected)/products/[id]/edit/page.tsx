import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getProductByIdForAdmin } from '@/lib/products/product.service';
import { getActiveCategories } from '@/lib/products/category.service';
import { updateProductAction } from '@/app/actions/products';
import { ProductForm } from '@/components/admin/ProductForm';
import { toNumber } from '@/lib/utils/format-currency';

export const metadata: Metadata = {
  title: 'Edit Product',
  robots: { index: false, follow: false },
};

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = Number(id);
  if (Number.isNaN(productId)) notFound();

  const [product, categories] = await Promise.all([
    getProductByIdForAdmin(productId),
    getActiveCategories(),
  ]);
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/products"
          className="text-muted hover:text-midnight inline-flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Products
        </Link>
        <h1 className="font-heading text-midnight mt-2 text-2xl font-bold">Edit Product</h1>
        <p className="text-muted mt-1 text-sm">{product.name}</p>
      </div>

      <ProductForm
        action={updateProductAction}
        categories={categories.map((category) => ({ id: category.id, name: category.name }))}
        submitLabel="Save Changes"
        initialValues={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          brand: product.brand,
          categoryId: product.categoryId,
          productType: product.productType,
          description: product.description,
          shortDescription: product.shortDescription,
          price: toNumber(product.price),
          discountPrice: product.discountPrice ? toNumber(product.discountPrice) : null,
          stock: product.stock,
          lowStockThreshold: product.lowStockThreshold,
          warranty: product.warranty ?? '',
          tags: product.tags ?? '',
          isActive: product.isActive,
          isNew: product.isNew,
          isFeatured: product.isFeatured,
          isBestSeller: product.isBestSeller,
          isTopSale: product.isTopSale,
          isRecommended: product.isRecommended,
          isOnSale: product.isOnSale,
          images: product.images.map((image) => ({
            url: image.url,
            alt: image.alt,
            isPrimary: image.isPrimary,
            storageKey: image.storageKey ?? undefined,
            originalName: image.originalName ?? undefined,
            mimeType: image.mimeType ?? undefined,
            fileSize: image.fileSize ?? undefined,
            width: image.width ?? undefined,
            height: image.height ?? undefined,
            format: image.format ?? undefined,
          })),
          specifications: product.specifications.map((spec) => ({
            label: spec.label,
            value: spec.value,
          })),
        }}
      />
    </div>
  );
}
