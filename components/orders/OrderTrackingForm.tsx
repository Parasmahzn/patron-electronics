'use client';

import { useActionState } from 'react';
import { PackageSearch } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils/format-currency';
import { ORDER_STATUS_META, PAYMENT_STATUS_META } from '@/lib/utils/status';
import { trackOrderAction } from '@/app/actions/order-tracking';

export function OrderTrackingForm() {
  const [state, action, pending] = useActionState(trackOrderAction, undefined);

  return (
    <div className="flex flex-col gap-8">
      <form
        action={action}
        className="border-border flex flex-col gap-4 rounded-lg border bg-white p-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Order Number" name="orderNumber" required placeholder="PE-2026-000001" />
          <Input
            label="Phone Number"
            name="phone"
            required
            autoComplete="tel"
            placeholder="9843012697"
          />
        </div>

        {state?.error && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={pending} className="sm:w-fit">
          <PackageSearch aria-hidden="true" className="h-4 w-4" />
          {pending ? 'Tracking...' : 'Track Order'}
        </Button>
      </form>

      {state?.order && (
        <div className="border-border rounded-lg border bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-muted text-xs font-medium tracking-wide uppercase">Order</p>
              <p className="font-heading text-midnight text-lg font-bold">
                {state.order.orderNumber}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge tone={ORDER_STATUS_META[state.order.orderStatus].tone}>
                {ORDER_STATUS_META[state.order.orderStatus].label}
              </Badge>
              <Badge tone={PAYMENT_STATUS_META[state.order.paymentStatus].tone}>
                Payment: {PAYMENT_STATUS_META[state.order.paymentStatus].label}
              </Badge>
            </div>
          </div>

          <p className="text-muted mt-3 text-sm">
            Placed on{' '}
            {new Date(state.order.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}{' '}
            by <span className="text-midnight">{state.order.customerName}</span>
          </p>
          <p className="text-muted text-sm">
            Delivering to <span className="text-midnight">{state.order.address}</span>
            {state.order.area ? `, ${state.order.area}` : ''}
            {state.order.city ? `, ${state.order.city}` : ''}
          </p>

          <ul className="divide-border border-border mt-4 divide-y border-t">
            {state.order.items.map((item, index) => (
              <li key={index} className="flex justify-between gap-3 py-2.5 text-sm">
                <span className="text-midnight">
                  {item.productName} × {item.quantity}
                </span>
                <span className="text-muted">{formatCurrency(item.total)}</span>
              </li>
            ))}
          </ul>

          <div className="border-border mt-3 flex flex-col gap-1 border-t pt-3 text-sm">
            <div className="text-muted flex justify-between">
              <span>Subtotal</span>
              <span className="text-midnight">{formatCurrency(state.order.subtotal)}</span>
            </div>
            {state.order.discount > 0 && (
              <div className="text-muted flex justify-between">
                <span>Discount</span>
                <span className="text-midnight">-{formatCurrency(state.order.discount)}</span>
              </div>
            )}
            <div className="text-muted flex justify-between">
              <span>Delivery Fee</span>
              <span className="text-midnight">
                {state.order.deliveryFee === 0 ? 'Free' : formatCurrency(state.order.deliveryFee)}
              </span>
            </div>
            <div className="border-border text-midnight mt-1 flex justify-between border-t pt-2 text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(state.order.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
