import type { Metadata } from 'next';
import { ProductListing } from '@/components/products/ProductListing';
import { productSearchSchema } from '@/lib/validations/search';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Browse mobiles, laptops, accessories, and gadgets at Patron Electronics.',
};

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ShopPage({ searchParams }: PageProps) {
  const rawSearchParams = await searchParams;
  // Use safeParse rather than parse: a manually crafted/invalid query string
  // (e.g. an unknown sort value) must degrade to the default listing, never
  // throw and surface a stack trace to the customer.
  const parsedFilters = productSearchSchema.safeParse(rawSearchParams);
  const filters = parsedFilters.success ? parsedFilters.data : {};

  return (
    <div className="container py-8 sm:py-10">
      <h1 className="font-heading text-midnight text-2xl font-bold sm:text-3xl">
        Shop All Products
      </h1>
      <p className="text-muted mt-1 text-sm">
        Mobiles, laptops, accessories, and gadgets — all in one place.
      </p>

      <div className="mt-8">
        <ProductListing filters={filters} rawSearchParams={rawSearchParams} basePath="/shop" />
      </div>
    </div>
  );
}
