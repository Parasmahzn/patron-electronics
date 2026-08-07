import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, PackageSearch, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ClearCartOnMount } from '@/components/cart/ClearCartOnMount';

export const metadata: Metadata = {
  title: 'Order Confirmed',
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function OrderConfirmationPage({ searchParams }: PageProps) {
  const { order } = await searchParams;
  const orderNumber = Array.isArray(order) ? order[0] : order;

  return (
    <div className="container flex flex-col items-center px-4 py-16 text-center sm:py-20">
      <ClearCartOnMount />
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 aria-hidden="true" className="h-8 w-8 text-emerald-600" />
      </div>
      <h1 className="font-heading text-midnight mt-6 text-2xl font-bold sm:text-3xl">
        Thank you for your order!
      </h1>
      <p className="text-muted mt-2 max-w-md text-sm">
        Your order has been placed successfully. Our team will contact you shortly to confirm
        delivery details.
      </p>

      {orderNumber && (
        <div className="border-border bg-surface mt-6 rounded-lg border px-6 py-4">
          <p className="text-muted text-xs font-medium tracking-wide uppercase">Order Number</p>
          <p className="font-heading text-primary mt-1 text-xl font-bold">{orderNumber}</p>
        </div>
      )}

      <p className="text-muted mt-6 text-sm">
        Payment method: <span className="text-midnight font-medium">Cash on Delivery</span>
      </p>
      <p className="text-muted mt-1 max-w-md text-sm">
        Keep your order number and phone number handy — you&rsquo;ll need both to track your order.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/order-status">
          <Button variant="outline">
            <PackageSearch aria-hidden="true" className="h-4 w-4" />
            Track Your Order
          </Button>
        </Link>
        <Link href="/shop">
          <Button>
            <ShoppingBag aria-hidden="true" className="h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
