import type { Metadata } from 'next';
import { OrderTrackingForm } from '@/components/orders/OrderTrackingForm';

export const metadata: Metadata = {
  title: 'Track Your Order',
  description: 'Track your Patron Electronics order using your order number and phone number.',
};

export default function OrderStatusPage() {
  return (
    <div className="container max-w-2xl py-8 sm:py-10">
      <h1 className="font-heading text-midnight text-2xl font-bold sm:text-3xl">
        Track Your Order
      </h1>
      <p className="text-muted mt-1 text-sm">
        Enter your order number and the phone number used at checkout to see your order status.
      </p>

      <div className="mt-8">
        <OrderTrackingForm />
      </div>
    </div>
  );
}
