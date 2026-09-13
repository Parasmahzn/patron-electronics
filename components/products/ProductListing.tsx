import Link from 'next/link';
import { PackageSearch } from 'lucide-react';
import { getProducts, getAvailableBrands } from '@/lib/products/discovery';
import { getActiveCategories } from '@/lib/products/category.service';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFilters } from '@/components/products/ProductFilters';
import { SortSelect } from '@/components/products/SortSelect';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import type { ProductSearchInput } from '@/lib/validations/search';

type RawSearchParams = Record<string, string | string[] | undefined>;

type Props = {
  filters: ProductSearchInput;
  rawSearchParams: RawSearchParams;
  basePath: string;
  lockedCategory?: { slug: string; name: string };
};

/**
 * The single reusable product-discovery listing UI powering /shop,
 * /search, and /categories/[slug] — filters, sorting, pagination, and the
 * grid are all defined once here rather than duplicated per page.
 */
export async function ProductListing({
  filters,
  rawSearchParams,
  basePath,
  lockedCategory,
}: Props) {
  const effectiveFilters: ProductSearchInput = lockedCategory
    ? { ...filters, category: lockedCategory.slug }
    : filters;

  const [{ products, totalCount, totalPages, page }, categories, brands] = await Promise.all([
    getProducts(effectiveFilters),
    lockedCategory ? Promise.resolve([]) : getActiveCategories(),
    getAvailableBrands(effectiveFilters.category),
  ]);

  const clearHref = filters.q ? `${basePath}?q=${encodeURIComponent(filters.q)}` : basePath;

  function buildPageHref(targetPage: number): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(rawSearchParams)) {
      if (key === 'page') continue;
      const resolved = Array.isArray(value) ? value[0] : value;
      if (resolved) params.set(key, resolved);
    }
    if (targetPage > 1) params.set('page', String(targetPage));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <ProductFilters
        categories={categories.map((category) => ({ slug: category.slug, name: category.name }))}
        brands={brands}
        hideCategory={!!lockedCategory}
      />

      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted text-sm">
            {totalCount} product{totalCount === 1 ? '' : 's'} found
          </p>
          <SortSelect />
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No products found"
            description="Try adjusting or clearing your filters to see more results."
            action={
              <Link href={clearHref}>
                <Button variant="outline">Clear filters</Button>
              </Link>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="mt-10">
              <Pagination currentPage={page} totalPages={totalPages} buildHref={buildPageHref} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
