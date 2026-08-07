import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Ban } from 'lucide-react';
import { getOrderByIdForAdmin } from '@/lib/orders/order.service';
import {
  updateOrderStatusAction,
  updatePaymentStatusAction,
  cancelOrderAction,
} from '@/app/actions/orders';
import {
  ORDER_STATUS_META,
  ORDER_STATUS_VALUES,
  PAYMENT_STATUS_META,
  PAYMENT_STATUS_VALUES,
} from '@/lib/utils/status';
import { Card } from '@/components/admin/Card';
import { ErrorBanner } from '@/components/admin/ErrorBanner';
import { ConfirmSubmitButton } from '@/components/admin/ConfirmSubmitButton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { formatCurrency } from '@/lib/utils/format-currency';

export const metadata: Metadata = {
  title: 'Order Details',
  robots: { index: false, follow: false },
};

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);
  if (Number.isNaN(orderId)) notFound();

  const [order, sp] = await Promise.all([getOrderByIdForAdmin(orderId), searchParams]);
  if (!order) notFound();

  const canCancel = order.orderStatus !== 'CANCELLED' && order.orderStatus !== 'DELIVERED';
  const currentOrderId = order.id;

  // Inline closures (not `.bind()`) — see note in products/[id]/edit/page.tsx.
  async function cancelThisOrder() {
    'use server';
    await cancelOrderAction(currentOrderId);
  }
  async function updateThisOrderStatus(formData: FormData) {
    'use server';
    await updateOrderStatusAction(currentOrderId, formData);
  }
  async function updateThisPaymentStatus(formData: FormData) {
    'use server';
    await updatePaymentStatusAction(currentOrderId, formData);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/orders"
            className="text-muted hover:text-midnight inline-flex items-center gap-1 text-sm"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Orders
          </Link>
          <h1 className="font-heading text-midnight mt-2 text-2xl font-bold">
            {order.orderNumber}
          </h1>
          <p className="text-muted mt-1 text-sm">
            Placed{' '}
            {order.createdAt.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>
        {canCancel && (
          <ConfirmSubmitButton
            action={cancelThisOrder}
            confirmMessage="Cancel this order? Inventory will be restocked."
            variant="danger"
          >
            <Ban className="h-4 w-4" /> Cancel Order
          </ConfirmSubmitButton>
        )}
      </div>

      <ErrorBanner message={sp.error} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card title="Items">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-border text-muted border-b text-left text-xs font-semibold tracking-wide uppercase">
                  <tr>
                    <th className="py-2">Product</th>
                    <th className="py-2">Qty</th>
                    <th className="py-2">Unit Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="text-midnight py-3 font-medium">{item.productName}</td>
                      <td className="text-muted py-3">{item.quantity}</td>
                      <td className="text-muted py-3">{formatCurrency(item.unitPrice)}</td>
                      <td className="text-midnight py-3 text-right font-medium">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-border mt-4 flex flex-col gap-1 border-t pt-4 text-sm">
              <div className="text-muted flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="text-muted flex justify-between">
                <span>Discount</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
              <div className="text-muted flex justify-between">
                <span>Delivery Fee</span>
                <span>{formatCurrency(order.deliveryFee)}</span>
              </div>
              <div className="border-border text-midnight flex justify-between border-t pt-2 text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </Card>

          <Card title="Customer & Shipping">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-muted text-xs font-semibold tracking-wide uppercase">Name</dt>
                <dd className="text-midnight">{order.customerName}</dd>
              </div>
              <div>
                <dt className="text-muted text-xs font-semibold tracking-wide uppercase">Phone</dt>
                <dd className="text-midnight">{order.customerPhone}</dd>
              </div>
              {order.customerEmail && (
                <div>
                  <dt className="text-muted text-xs font-semibold tracking-wide uppercase">
                    Email
                  </dt>
                  <dd className="text-midnight">{order.customerEmail}</dd>
                </div>
              )}
              <div>
                <dt className="text-muted text-xs font-semibold tracking-wide uppercase">
                  Payment Method
                </dt>
                <dd className="text-midnight">{order.paymentMethod}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted text-xs font-semibold tracking-wide uppercase">
                  Address
                </dt>
                <dd className="text-midnight">
                  {order.address}
                  {order.area ? `, ${order.area}` : ''}
                  {order.city ? `, ${order.city}` : ''}
                </dd>
              </div>
              {order.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-muted text-xs font-semibold tracking-wide uppercase">
                    Customer Notes
                  </dt>
                  <dd className="text-midnight">{order.notes}</dd>
                </div>
              )}
            </dl>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card title="Order Status">
            <div className="mb-3">
              <Badge
                tone={ORDER_STATUS_META[order.orderStatus].tone}
                icon={ORDER_STATUS_META[order.orderStatus].icon}
              >
                {ORDER_STATUS_META[order.orderStatus].label}
              </Badge>
            </div>
            <form action={updateThisOrderStatus} className="flex flex-col gap-3">
              <Select name="orderStatus" defaultValue={order.orderStatus} aria-label="Order status">
                {ORDER_STATUS_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {ORDER_STATUS_META[value].label}
                  </option>
                ))}
              </Select>
              <Button type="submit" variant="outline" size="sm" className="self-start">
                Update Status
              </Button>
            </form>
          </Card>

          <Card title="Payment Status">
            <div className="mb-3">
              <Badge
                tone={PAYMENT_STATUS_META[order.paymentStatus].tone}
                icon={PAYMENT_STATUS_META[order.paymentStatus].icon}
              >
                {PAYMENT_STATUS_META[order.paymentStatus].label}
              </Badge>
            </div>
            <form action={updateThisPaymentStatus} className="flex flex-col gap-3">
              <Select
                name="paymentStatus"
                defaultValue={order.paymentStatus}
                aria-label="Payment status"
              >
                {PAYMENT_STATUS_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {PAYMENT_STATUS_META[value].label}
                  </option>
                ))}
              </Select>
              <Button type="submit" variant="outline" size="sm" className="self-start">
                Update Payment
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
