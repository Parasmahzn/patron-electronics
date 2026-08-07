'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Zap } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/Button';
import { QuantitySelector } from './QuantitySelector';
import { MAX_CART_QUANTITY } from '@/config/site';
import type { CartItem } from '@/types/cart';

type Props = {
  product: Omit<CartItem, 'quantity'>;
};

/** Add to Cart + Buy Now for the product detail page. Buy Now adds the item then navigates to checkout. */
export function ProductActions({ product }: Props) {
  const { addItem } = useCart();
  const router = useRouter();
  const maxQuantity = Math.max(0, Math.min(product.maxStock, MAX_CART_QUANTITY));
  const [quantity, setQuantity] = useState(1);
  const outOfStock = product.maxStock <= 0;

  if (outOfStock) {
    return (
      <Button type="button" size="lg" disabled className="w-full sm:w-auto">
        Out of Stock
      </Button>
    );
  }

  function handleAddToCart() {
    addItem({ ...product, quantity });
  }

  function handleBuyNow() {
    addItem({ ...product, quantity });
    router.push('/checkout');
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <QuantitySelector quantity={quantity} max={maxQuantity} onChange={setQuantity} />
      <div className="flex flex-1 gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleAddToCart}
          className="flex-1"
        >
          <ShoppingCart aria-hidden="true" className="h-4 w-4" />
          Add to Cart
        </Button>
        <Button type="button" size="lg" onClick={handleBuyNow} className="flex-1">
          <Zap aria-hidden="true" className="h-4 w-4" />
          Buy Now
        </Button>
      </div>
    </div>
  );
}
