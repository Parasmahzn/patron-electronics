import type { Metadata } from 'next';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { listOrdersForAdmin } from '@/lib/orders/order.service';
import { ORDER_STATUS_META, ORDER_STATUS_VALUES, PAYMENT_STATUS_META } from '@/lib/utils/status';
import { buildAdminHref } from '@/components/admin/admin-query';
import { Card } from '@/components/admin/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/utils/format-currency';
import type { OrderStatus } from '@/lib/generated/prisma/client';

export const metadata: Metadata = { title: 'Orders', robots: { index: false, follow: false } };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const status = ORDER_STATUS_VALUES.includes(sp.status as OrderStatus)
    ? (sp.status as OrderStatus)
    : undefined;
  const page = sp.page ? Number(sp.page) : 1;

  const {
    orders,
    totalCount,
    totalPages,
    page: currentPage,
  } = await listOrdersForAdmin({ q, status, page });
  const buildHref = (targetPage: number) =>
    buildAdminHref('/admin/orders', { q, status, page: targetPage });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-midnight text-2xl font-bold">Orders</h1>
        <p className="text-muted mt-1 text-sm">
          {totalCount.toLocaleString()} order{totalCount === 1 ? '' : 's'} total
        </p>
      </div>

      <Card>
        <form className="flex flex-wrap items-end gap-3" action="/admin/orders">
          <div className="min-w-48 flex-1">
            <Input
              name="q"
              defaultValue={q}
              placeholder="Order number, name, or phone..."
              aria-label="Search orders"
            />
          </div>
          <div className="w-full sm:w-56">
            <Select name="status" defaultValue={status ?? ''} aria-label="Filter by status">
              <option value="">All Statuses</option>
              {ORDER_STATUS_VALUES.map((value) => (
                <option key={value} value={value}>
                  {ORDER_STATUS_META[value].label}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" variant="outline">
            Filter
          </Button>
        </form>
      </Card>

      <Card className="p-0">
        {orders.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={ShoppingCart}
              title="No orders found"
              description="Try adjusting your search or filters."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-border bg-surface text-muted border-b text-left text-xs font-semibold tracking-wide uppercase">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Order Status</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-primary font-medium hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                      <p className="text-muted text-xs">{order.items.length} item(s)</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-midnight">{order.customerName}</p>
                      <p className="text-muted text-xs">{order.customerPhone}</p>
                    </td>
                    <td className="text-midnight px-4 py-3 font-medium whitespace-nowrap">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        tone={ORDER_STATUS_META[order.orderStatus].tone}
                        icon={ORDER_STATUS_META[order.orderStatus].icon}
                      >
                        {ORDER_STATUS_META[order.orderStatus].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        tone={PAYMENT_STATUS_META[order.paymentStatus].tone}
                        icon={PAYMENT_STATUS_META[order.paymentStatus].icon}
                      >
                        {PAYMENT_STATUS_META[order.paymentStatus].label}
                      </Badge>
                    </td>
                    <td className="text-muted px-4 py-3 whitespace-nowrap">
                      {order.createdAt.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Pagination currentPage={currentPage} totalPages={totalPages} buildHref={buildHref} />
    </div>
  );
}
