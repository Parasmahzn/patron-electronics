import type { Metadata } from 'next';
import { CartView } from '@/components/cart/CartView';

export const metadata: Metadata = {
  title: 'Your Cart',
  description: 'Review the items in your cart before checkout.',
};

export default function CartPage() {
  return (
    <div className="container py-8 sm:py-10">
      <h1 className="font-heading text-midnight text-2xl font-bold sm:text-3xl">Your Cart</h1>
      <div className="mt-8">
        <CartView />
      </div>
    </div>
  );
}
