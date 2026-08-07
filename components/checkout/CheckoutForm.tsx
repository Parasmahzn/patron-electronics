'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Truck } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/utils/format-currency';
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from '@/config/site';
import { checkoutAction } from '@/app/actions/checkout';

export function CheckoutForm() {
  const { items, subtotal, hydrated } = useCart();
  const [state, action, pending] = useActionState(checkoutAction, undefined);

  if (!hydrated) {
    return <div className="bg-surface h-64 animate-pulse rounded-lg" />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Add some products to your cart before checking out."
        action={
          <Link href="/shop">
            <Button>Go to Shop</Button>
          </Link>
        }
      />
    );
  }

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;
  const cartItemsPayload = JSON.stringify(
    items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <form action={action} className="flex flex-col gap-5">
        <input type="hidden" name="items" value={cartItemsPayload} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Full Name"
            name="fullName"
            required
            autoComplete="name"
            placeholder="Your full name"
          />
          <Input label="Phone" name="phone" required autoComplete="tel" placeholder="98XXXXXXXX" />
        </div>
        <Input
          label="Email (optional)"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
        />
        <Input
          label="Delivery Address"
          name="address"
          required
          autoComplete="street-address"
          placeholder="House no., street, ward"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="City (optional)"
            name="city"
            autoComplete="address-level2"
            placeholder="Kathmandu"
          />
          <Input label="Area (optional)" name="area" placeholder="Gokarneshwor" />
        </div>
        <Textarea
          label="Order Notes (optional)"
          name="notes"
          placeholder="Delivery instructions, landmark, etc."
        />

        <div className="border-border bg-surface rounded-lg border p-4">
          <div className="text-midnight flex items-center gap-2 text-sm font-medium">
            <Truck aria-hidden="true" className="text-primary h-4 w-4" />
            Payment Method
          </div>
          <p className="text-muted mt-1 text-sm">Cash on Delivery — pay when your order arrives.</p>
          <p className="text-muted mt-1 text-xs">
            Online payment (eSewa, Khalti, bank transfer) is coming soon.
          </p>
        </div>

        {state?.error && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending ? 'Placing Order...' : 'Place Order'}
        </Button>
      </form>

      <div className="border-border h-fit rounded-lg border bg-white p-5">
        <h2 className="font-heading text-midnight text-base font-semibold">Order Summary</h2>
        <ul className="mt-4 flex flex-col gap-2 text-sm">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-3">
              <span className="text-midnight">
                {item.name} × {item.quantity}
              </span>
              <span className="text-muted shrink-0">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="border-border mt-4 flex flex-col gap-2 border-t pt-3 text-sm">
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
          <div className="border-border text-midnight mt-1 flex justify-between border-t pt-2 text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
        <p className="text-muted mt-3 text-xs">
          Final prices, stock, and totals are verified securely on our server.
        </p>
      </div>
    </div>
  );
}
