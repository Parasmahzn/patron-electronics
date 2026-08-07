import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductListing } from '@/components/products/ProductListing';
import { getCategoryBySlug } from '@/lib/products/category.service';
import { productSearchSchema } from '@/lib/validations/search';

type PageParams = { slug: string };

type PageProps = {
  params: Promise<PageParams>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  // generateMetadata resolves before the page streams, so calling notFound()
  // here (rather than only inside the page body, which a sibling
  // loading.tsx wraps in a Suspense boundary) is what lets the response
  // actually carry a 404 status instead of committing to 200 first.
  if (!category) notFound();

  return {
    title: category.name,
    description: category.description ?? `Shop ${category.name} at Patron Electronics.`,
  };
}

export default async function CategoryDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const rawSearchParams = await searchParams;
  const parsedFilters = productSearchSchema.safeParse(rawSearchParams);
  const filters = parsedFilters.success ? parsedFilters.data : {};

  return (
    <div className="container py-8 sm:py-10">
      <h1 className="font-heading text-midnight text-2xl font-bold sm:text-3xl">{category.name}</h1>
      {category.description && (
        <p className="text-muted mt-1 max-w-2xl text-sm">{category.description}</p>
      )}

      <div className="mt-8">
        <ProductListing
          filters={filters}
          rawSearchParams={rawSearchParams}
          basePath={`/categories/${category.slug}`}
          lockedCategory={{ slug: category.slug, name: category.name }}
        />
      </div>
    </div>
  );
}
