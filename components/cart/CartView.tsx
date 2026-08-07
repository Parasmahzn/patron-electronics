'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ImageOff, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { QuantitySelector } from '@/components/products/QuantitySelector';
import { formatCurrency } from '@/lib/utils/format-currency';
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from '@/config/site';

export function CartView() {
  const { items, subtotal, hydrated, removeItem, increment, decrement } = useCart();

  // Cart data only exists in localStorage, read after mount — render nothing
  // meaningful until hydrated to avoid a server/client empty-cart flash.
  if (!hydrated) {
    return <div className="bg-surface h-64 animate-pulse rounded-lg" />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Browse our catalog and add products to get started."
        action={
          <Link href="/shop">
            <Button>Start Shopping</Button>
          </Link>
        }
      />
    );
  }

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const estimatedTotal = subtotal + deliveryFee;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li
            key={item.productId}
            className="border-border flex gap-4 rounded-lg border bg-white p-4"
          >
            <div className="bg-surface relative h-20 w-20 shrink-0 overflow-hidden rounded-md">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageOff aria-hidden="true" className="text-muted h-6 w-6" />
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={`/products/${item.slug}`}
                  className="font-heading text-midnight hover:text-primary text-sm font-semibold"
                >
                  {item.name}
                </Link>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  aria-label={`Remove ${item.name} from cart`}
                  className="text-muted hover:text-red-600"
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-midnight text-sm font-semibold">
                  {formatCurrency(item.price)}
                </span>
                {item.originalPrice > item.price && (
                  <span className="text-muted text-xs line-through">
                    {formatCurrency(item.originalPrice)}
                  </span>
                )}
              </div>

              <div className="mt-auto flex items-center justify-between">
                <QuantitySelector
                  quantity={item.quantity}
                  max={item.maxStock}
                  onChange={(next) => {
                    if (next > item.quantity) increment(item.productId);
                    else decrement(item.productId);
                  }}
                />
                <span className="text-midnight text-sm font-semibold">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="border-border h-fit rounded-lg border bg-white p-5">
        <h2 className="font-heading text-midnight text-base font-semibold">Order Summary</h2>
        <div className="mt-4 flex flex-col gap-2 text-sm">
          <div className="text-muted flex justify-between">
            <span>Subtotal</span>
            <span className="text-midnight">{formatCurrency(subtotal)}</span>
          </div>
          <div className="text-muted flex justify-between">
            <span>Delivery</span>
            <span className="text-midnight">
              {deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}
            </span>
          </div>
          {deliveryFee > 0 && (
            <p className="text-muted text-xs">
              Free delivery on orders over {formatCurrency(FREE_DELIVERY_THRESHOLD)}.
            </p>
          )}
          <div className="border-border text-midnight mt-2 flex justify-between border-t pt-2 text-base font-semibold">
            <span>Estimated Total</span>
            <span>{formatCurrency(estimatedTotal)}</span>
          </div>
          <p className="text-muted text-xs">Final total is recalculated securely at checkout.</p>
        </div>

        <Link href="/checkout" className="mt-5 block">
          <Button className="w-full">
            Proceed to Checkout
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
