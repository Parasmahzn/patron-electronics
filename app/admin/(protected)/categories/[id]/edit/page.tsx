import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getCategoryById } from '@/lib/products/category.service';
import { updateCategoryAction } from '@/app/actions/categories';
import { CategoryForm } from '@/components/admin/CategoryForm';

export const metadata: Metadata = {
  title: 'Edit Category',
  robots: { index: false, follow: false },
};

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const categoryId = Number(id);
  if (Number.isNaN(categoryId)) notFound();

  const category = await getCategoryById(categoryId);
  if (!category) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/categories"
          className="text-muted hover:text-midnight inline-flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Categories
        </Link>
        <h1 className="font-heading text-midnight mt-2 text-2xl font-bold">Edit Category</h1>
        <p className="text-muted mt-1 text-sm">{category.name}</p>
      </div>

      <CategoryForm
        action={updateCategoryAction}
        submitLabel="Save Changes"
        initialValues={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description ?? '',
          image: category.image ?? '',
          displayOrder: category.displayOrder,
          isActive: category.isActive,
        }}
      />
    </div>
  );
}
