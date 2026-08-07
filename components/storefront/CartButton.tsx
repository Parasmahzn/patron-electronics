'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';

export function CartButton() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`}
      className="hover:bg-surface relative flex h-11 w-11 items-center justify-center rounded-md"
    >
      <ShoppingCart aria-hidden="true" className="text-midnight h-5 w-5" />
      {itemCount > 0 && (
        <span className="bg-primary absolute top-1 right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-semibold text-white">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
