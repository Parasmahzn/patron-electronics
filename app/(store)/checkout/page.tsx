import type { Metadata } from 'next';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your order with Cash on Delivery.',
};

export default function CheckoutPage() {
  return (
    <div className="container py-8 sm:py-10">
      <h1 className="font-heading text-midnight text-2xl font-bold sm:text-3xl">Checkout</h1>
      <div className="mt-8">
        <CheckoutForm />
      </div>
    </div>
  );
}
