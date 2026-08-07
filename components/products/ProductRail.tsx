import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import type { ProductCard as ProductCardData } from '@/lib/products/discovery';

type Props = {
  title: string;
  subtitle?: string;
  products: ProductCardData[];
  viewAllHref?: string;
};

/** A titled row of product cards for the homepage. Renders nothing if there are no products to show. */
export function ProductRail({ title, subtitle, products, viewAllHref }: Props) {
  if (products.length === 0) return null;

  return (
    <section className="container py-10 sm:py-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-midnight text-xl font-bold sm:text-2xl">{title}</h2>
          {subtitle && <p className="text-muted mt-1 text-sm">{subtitle}</p>}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
          >
            View all
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
