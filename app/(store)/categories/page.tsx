import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutGrid } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { getActiveCategories } from '@/lib/products/category.service';

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Browse all product categories at Patron Electronics.',
};

export default async function CategoriesPage() {
  const categories = await getActiveCategories();

  return (
    <div className="container py-8 sm:py-10">
      <h1 className="font-heading text-midnight text-2xl font-bold sm:text-3xl">Categories</h1>
      <p className="text-muted mt-1 text-sm">
        Browse our full range of mobiles, laptops, and electronics.
      </p>

      {categories.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={LayoutGrid}
            title="No categories available"
            description="Please check back soon."
          />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group border-border flex flex-col items-center gap-3 rounded-lg border bg-white p-6 text-center transition-shadow hover:shadow-md"
            >
              <div className="bg-surface relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full">
                {category.image ? (
                  <Image src={category.image} alt="" fill className="object-cover" />
                ) : (
                  <LayoutGrid aria-hidden="true" className="text-primary h-7 w-7" />
                )}
              </div>
              <span className="text-midnight group-hover:text-primary text-sm font-medium">
                {category.name}
              </span>
              {category.description && (
                <p className="text-muted line-clamp-2 text-xs">{category.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
