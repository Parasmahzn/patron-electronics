import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ProductListing } from '@/components/products/ProductListing';
import { productSearchSchema } from '@/lib/validations/search';

export const metadata: Metadata = {
  title: 'Search Results',
  description: 'Search Patron Electronics for mobiles, laptops, accessories, and gadgets.',
};

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const rawSearchParams = await searchParams;
  const parsedFilters = productSearchSchema.safeParse(rawSearchParams);
  const filters = parsedFilters.success ? parsedFilters.data : {};

  if (!filters.q) {
    redirect('/shop');
  }

  return (
    <div className="container py-8 sm:py-10">
      <h1 className="font-heading text-midnight text-2xl font-bold sm:text-3xl">Search Results</h1>
      <p className="text-muted mt-1 text-sm">Results for &ldquo;{filters.q}&rdquo;</p>

      <div className="mt-8">
        <ProductListing filters={filters} rawSearchParams={rawSearchParams} basePath="/search" />
      </div>
    </div>
  );
}
