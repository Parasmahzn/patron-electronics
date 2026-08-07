import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createCategoryAction } from '@/app/actions/categories';
import { CategoryForm } from '@/components/admin/CategoryForm';

export const metadata: Metadata = {
  title: 'New Category',
  robots: { index: false, follow: false },
};

export default function NewCategoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/categories"
          className="text-muted hover:text-midnight inline-flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Categories
        </Link>
        <h1 className="font-heading text-midnight mt-2 text-2xl font-bold">New Category</h1>
      </div>

      <CategoryForm action={createCategoryAction} submitLabel="Create Category" />
    </div>
  );
}
