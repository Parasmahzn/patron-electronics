import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { ProductGallery } from '@/components/products/ProductGallery';
import { ProductActions } from '@/components/products/ProductActions';
import { ProductBadges } from '@/components/products/ProductBadges';
import { RelatedProducts } from '@/components/products/RelatedProducts';
import { getProductBySlug } from '@/lib/products/discovery';
import { formatCurrency, toNumber } from '@/lib/utils/format-currency';
import { SITE_URL } from '@/config/site';

type PageParams = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  // generateMetadata resolves before the page streams, so calling notFound()
  // here (rather than only inside the page body, which a sibling
  // loading.tsx wraps in a Suspense boundary) is what lets the response
  // actually carry a 404 status instead of committing to 200 first.
  if (!product) notFound();

  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
    },
    alternates: { canonical: `${SITE_URL}/products/${product.slug}` },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<PageParams> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const price = toNumber(product.price);
  const discountPrice = product.discountPrice ? toNumber(product.discountPrice) : null;
  const effectivePrice = discountPrice ?? price;
  const discountPercent = discountPrice
    ? Math.round(((price - discountPrice) / price) * 100)
    : null;
  const inStock = product.stock > 0;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.sku,
    brand: { '@type': 'Brand', name: product.brand },
    description: product.shortDescription,
    image: product.images.map((image) => `${SITE_URL}${image.url}`),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'NPR',
      price: effectivePrice.toFixed(2),
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/products/${product.slug}`,
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Shop', item: `${SITE_URL}/shop` },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.category.name,
        item: `${SITE_URL}/categories/${product.category.slug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `${SITE_URL}/products/${product.slug}`,
      },
    ],
  };

  return (
    <div className="container py-8 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="text-muted mb-6 flex items-center gap-1.5 text-sm">
        <Link href="/shop" className="hover:text-primary">
          Shop
        </Link>
        <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
        <Link href={`/categories/${product.category.slug}`} className="hover:text-primary">
          {product.category.name}
        </Link>
        <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
        <span className="text-midnight truncate">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery
          images={product.images.map((image) => ({ url: image.url, alt: image.alt }))}
          productName={product.name}
        />

        <div>
          <p className="text-muted text-sm font-medium tracking-wide uppercase">{product.brand}</p>
          <h1 className="font-heading text-midnight mt-1 text-2xl font-bold sm:text-3xl">
            {product.name}
          </h1>
          <p className="text-muted mt-1 text-xs">SKU: {product.sku}</p>

          <div className="mt-3">
            <ProductBadges flags={product} max={4} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="font-heading text-midnight text-3xl font-bold">
              {formatCurrency(effectivePrice)}
            </span>
            {discountPrice && (
              <span className="text-muted text-base line-through">{formatCurrency(price)}</span>
            )}
            {discountPercent && discountPercent > 0 && (
              <span className="text-sm font-semibold text-emerald-600">
                Save {discountPercent}%
              </span>
            )}
          </div>

          <p
            className={
              inStock
                ? 'mt-2 text-sm font-medium text-emerald-600'
                : 'mt-2 text-sm font-medium text-red-600'
            }
          >
            {inStock
              ? product.stock <= 5
                ? `Only ${product.stock} left in stock`
                : 'In Stock'
              : 'Out of Stock'}
          </p>

          <div className="mt-6">
            <ProductActions
              product={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                image: product.images[0]?.url ?? '',
                price: effectivePrice,
                originalPrice: price,
                maxStock: product.stock,
              }}
            />
          </div>

          <p className="text-midnight mt-6 text-sm leading-relaxed">{product.shortDescription}</p>

          {product.warranty && (
            <p className="text-muted mt-3 text-sm">
              <span className="text-midnight font-medium">Warranty:</span> {product.warranty}
            </p>
          )}
        </div>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-heading text-midnight text-lg font-semibold">Description</h2>
          <p className="text-muted mt-3 text-sm leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {product.specifications.length > 0 && (
          <div>
            <h2 className="font-heading text-midnight text-lg font-semibold">Specifications</h2>
            <dl className="divide-border border-border mt-3 divide-y rounded-lg border">
              {product.specifications.map((spec) => (
                <div key={spec.id} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
                  <dt className="text-muted">{spec.label}</dt>
                  <dd className="text-midnight text-right font-medium">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

      <RelatedProducts categoryId={product.categoryId} excludeProductId={product.id} />
    </div>
  );
}
