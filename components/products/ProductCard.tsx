import Link from 'next/link';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import { formatCurrency, toNumber } from '@/lib/utils/format-currency';
import { ProductBadges } from '@/components/products/ProductBadges';
import { AddToCartButton } from '@/components/products/AddToCartButton';
import type { ProductCard as ProductCardData } from '@/lib/products/discovery';

/**
 * Shared card used by every listing/rail (shop, search, categories,
 * homepage rails). Stays a Server Component; only the Add to Cart
 * affordance needs client interactivity.
 */
export function ProductCard({ product }: { product: ProductCardData }) {
  const price = toNumber(product.price);
  const discountPrice = product.discountPrice ? toNumber(product.discountPrice) : null;
  const effectivePrice = discountPrice ?? price;
  const discountPercent = discountPrice
    ? Math.round(((price - discountPrice) / price) * 100)
    : null;
  const inStock = product.stock > 0;
  const image = product.images[0];

  return (
    <div className="group border-border flex flex-col overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-md">
      <Link
        href={`/products/${product.slug}`}
        className="bg-surface relative block aspect-square overflow-hidden"
        aria-label={product.name}
      >
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageOff aria-hidden="true" className="text-muted h-8 w-8" />
          </div>
        )}
        {(product.isNew ||
          product.isFeatured ||
          product.isBestSeller ||
          product.isTopSale ||
          product.isOnSale) && (
          <div className="absolute top-2 left-2">
            <ProductBadges flags={product} max={1} />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <p className="text-muted text-xs font-medium tracking-wide uppercase">{product.brand}</p>
        <Link
          href={`/products/${product.slug}`}
          className="font-heading text-midnight hover:text-primary line-clamp-2 text-sm font-semibold"
        >
          {product.name}
        </Link>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="font-heading text-midnight text-base font-bold">
            {formatCurrency(effectivePrice)}
          </span>
          {discountPrice && (
            <span className="text-muted text-xs line-through">{formatCurrency(price)}</span>
          )}
          {discountPercent && discountPercent > 0 && (
            <span className="text-xs font-semibold text-emerald-600">-{discountPercent}%</span>
          )}
        </div>

        <p className={inStock ? 'text-xs text-emerald-600' : 'text-xs text-red-600'}>
          {inStock
            ? product.stock <= 5
              ? `Only ${product.stock} left`
              : 'In Stock'
            : 'Out of Stock'}
        </p>

        <div className="mt-auto pt-2">
          <AddToCartButton
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              image: image?.url ?? '',
              price: effectivePrice,
              originalPrice: price,
              maxStock: product.stock,
            }}
          />
        </div>
      </div>
    </div>
  );
}
