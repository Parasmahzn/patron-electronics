import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getActiveCategories } from '@/lib/products/category.service';
import { createProductAction } from '@/app/actions/products';
import { ProductForm } from '@/components/admin/ProductForm';

export const metadata: Metadata = { title: 'New Product', robots: { index: false, follow: false } };

export default async function NewProductPage() {
  const categories = await getActiveCategories();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/products"
          className="text-muted hover:text-midnight inline-flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Products
        </Link>
        <h1 className="font-heading text-midnight mt-2 text-2xl font-bold">New Product</h1>
      </div>

      <ProductForm
        action={createProductAction}
        categories={categories.map((category) => ({ id: category.id, name: category.name }))}
        submitLabel="Create Product"
      />
    </div>
  );
}
