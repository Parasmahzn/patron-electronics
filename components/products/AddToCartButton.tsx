'use client';

import { useState } from 'react';
import { Check, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import type { CartItem } from '@/types/cart';

type Props = {
  product: Omit<CartItem, 'quantity'>;
  quantity?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

/**
 * Small, focused client component so the surrounding product card/detail
 * layout can stay a Server Component. Only plain numbers are accepted for
 * price/stock — callers must convert Prisma Decimal values before this
 * crosses the server/client boundary.
 */
export function AddToCartButton({ product, quantity = 1, size = 'sm', className }: Props) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const outOfStock = product.maxStock <= 0;

  function handleClick() {
    addItem({ ...product, quantity });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <Button
      type="button"
      size={size}
      variant={outOfStock ? 'outline' : 'primary'}
      disabled={outOfStock}
      onClick={handleClick}
      className={cn('w-full', className)}
    >
      {justAdded ? (
        <Check aria-hidden="true" className="h-4 w-4" />
      ) : (
        <ShoppingCart aria-hidden="true" className="h-4 w-4" />
      )}
      {outOfStock ? 'Out of Stock' : justAdded ? 'Added' : 'Add to Cart'}
    </Button>
  );
}
