'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { PRODUCT_TYPE_LABELS } from '@/config/site';

type CategoryOption = { slug: string; name: string };

type Props = {
  categories: CategoryOption[];
  brands: string[];
  hideCategory?: boolean;
};

const PRODUCT_TYPES = Object.entries(PRODUCT_TYPE_LABELS) as [string, string][];

/**
 * Filter UI shared by /shop, /search, and /categories/[slug]. All filter
 * changes navigate via the URL query string (never client-only state) so
 * results stay shareable, bookmarkable, and server-rendered per the spec.
 * Renders once as a desktop sidebar and once inside a mobile drawer.
 */
export function ProductFilters({ categories, brands, hideCategory }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const [drawerOpen, setDrawerOpen] = useState(false);

  function hrefFor(key: string, value: string | undefined): string {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function isActive(key: string, value: string): boolean {
    return (searchParams.get(key) ?? '') === value;
  }

  const clearHref = (() => {
    const q = searchParams.get('q');
    return q ? `${pathname}?q=${encodeURIComponent(q)}` : pathname;
  })();

  const hasActiveFilters = [
    'category',
    'brand',
    'minPrice',
    'maxPrice',
    'availability',
    'type',
  ].some((key) => searchParams.get(key));

  function applyPriceRange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const min = String(formData.get('minPrice') ?? '').trim();
    const max = String(formData.get('maxPrice') ?? '').trim();

    const params = new URLSearchParams(searchParams.toString());
    if (min) params.set('minPrice', min);
    else params.delete('minPrice');
    if (max) params.set('maxPrice', max);
    else params.delete('maxPrice');
    params.delete('page');
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
    setDrawerOpen(false);
  }

  const panel = (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-midnight text-sm font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Link href={clearHref} className="text-primary text-xs font-medium hover:underline">
            Clear all
          </Link>
        )}
      </div>

      {!hideCategory && categories.length > 0 && (
        <FilterGroup label="Category">
          <FilterOption
            href={hrefFor('category', undefined)}
            active={!searchParams.get('category')}
          >
            All Categories
          </FilterOption>
          {categories.map((category) => (
            <FilterOption
              key={category.slug}
              href={hrefFor('category', category.slug)}
              active={isActive('category', category.slug)}
            >
              {category.name}
            </FilterOption>
          ))}
        </FilterGroup>
      )}

      {brands.length > 0 && (
        <FilterGroup label="Brand">
          <FilterOption href={hrefFor('brand', undefined)} active={!searchParams.get('brand')}>
            All Brands
          </FilterOption>
          {brands.map((brand) => (
            <FilterOption
              key={brand}
              href={hrefFor('brand', brand)}
              active={isActive('brand', brand)}
            >
              {brand}
            </FilterOption>
          ))}
        </FilterGroup>
      )}

      <FilterGroup label="Product Type">
        <FilterOption href={hrefFor('type', undefined)} active={!searchParams.get('type')}>
          All Types
        </FilterOption>
        {PRODUCT_TYPES.map(([value, label]) => (
          <FilterOption key={value} href={hrefFor('type', value)} active={isActive('type', value)}>
            {label}
          </FilterOption>
        ))}
      </FilterGroup>

      <FilterGroup label="Availability">
        <FilterOption
          href={hrefFor('availability', undefined)}
          active={!searchParams.get('availability')}
        >
          All
        </FilterOption>
        <FilterOption
          href={hrefFor('availability', 'in-stock')}
          active={isActive('availability', 'in-stock')}
        >
          In Stock
        </FilterOption>
        <FilterOption
          href={hrefFor('availability', 'out-of-stock')}
          active={isActive('availability', 'out-of-stock')}
        >
          Out of Stock
        </FilterOption>
      </FilterGroup>

      <div>
        <p className="text-muted mb-2 text-xs font-semibold tracking-wide uppercase">Price (Rs.)</p>
        <form
          key={`${searchParams.get('minPrice')}-${searchParams.get('maxPrice')}`}
          onSubmit={applyPriceRange}
          className="flex items-center gap-2"
        >
          <label className="sr-only" htmlFor="minPrice">
            Minimum price
          </label>
          <input
            id="minPrice"
            name="minPrice"
            type="number"
            min={0}
            inputMode="numeric"
            defaultValue={searchParams.get('minPrice') ?? ''}
            placeholder="Min"
            className="border-border text-midnight placeholder:text-muted focus:border-primary focus:outline-primary/30 h-10 w-full rounded-md border bg-white px-3 text-sm focus:outline-2 focus:outline-offset-1"
          />
          <span className="text-muted">–</span>
          <label className="sr-only" htmlFor="maxPrice">
            Maximum price
          </label>
          <input
            id="maxPrice"
            name="maxPrice"
            type="number"
            min={0}
            inputMode="numeric"
            defaultValue={searchParams.get('maxPrice') ?? ''}
            placeholder="Max"
            className="border-border text-midnight placeholder:text-muted focus:border-primary focus:outline-primary/30 h-10 w-full rounded-md border bg-white px-3 text-sm focus:outline-2 focus:outline-offset-1"
          />
          <Button type="submit" size="sm" variant="outline" className="shrink-0">
            Go
          </Button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block">
        <div className="border-border rounded-lg border bg-white p-5">{panel}</div>
      </aside>

      <div className="lg:hidden">
        <Button
          type="button"
          variant="outline"
          onClick={() => setDrawerOpen(true)}
          className="w-full sm:w-auto"
        >
          <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
          Filters
          {hasActiveFilters && <span className="bg-primary ml-1 h-2 w-2 rounded-full" />}
        </Button>

        <AnimatePresence>
          {drawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                className="bg-midnight/40 fixed inset-0 z-50"
                onClick={() => setDrawerOpen(false)}
              />
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Filter products"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: reduceMotion ? 0 : 0.25, ease: 'easeOut' }}
                className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] overflow-y-auto bg-white p-6 shadow-xl"
              >
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-heading text-midnight text-lg font-bold">Filters</span>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    aria-label="Close filters"
                    className="hover:bg-surface flex h-10 w-10 items-center justify-center rounded-md"
                  >
                    <X aria-hidden="true" className="h-5 w-5" />
                  </button>
                </div>
                {panel}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-muted mb-2 text-xs font-semibold tracking-wide uppercase">{label}</p>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function FilterOption({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'rounded-md px-2.5 py-1.5 text-left text-sm transition-colors',
        active ? 'bg-primary/10 text-primary font-medium' : 'text-midnight hover:bg-surface',
      )}
    >
      {children}
    </Link>
  );
}
