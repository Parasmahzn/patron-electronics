import type { Metadata } from 'next';
import {
  Package,
  FolderTree,
  ShoppingCart,
  Clock,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  Wallet,
} from 'lucide-react';
import {
  getDashboardMetrics,
  getSalesOverTime,
  getOrdersOverTime,
  getBestSellingProducts,
  getSalesByCategory,
} from '@/lib/orders/order.service';
import { StatCard } from '@/components/admin/StatCard';
import { Card } from '@/components/admin/Card';
import { BarChart, HorizontalBarList } from '@/components/admin/BarChart';
import { formatCurrency } from '@/lib/utils/format-currency';

export const metadata: Metadata = { title: 'Dashboard', robots: { index: false, follow: false } };

function formatDayLabel(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' });
}

export default async function AdminDashboardPage() {
  const [metrics, salesOverTime, ordersOverTime, bestSellers, salesByCategory] = await Promise.all([
    getDashboardMetrics(),
    getSalesOverTime(7),
    getOrdersOverTime(7),
    getBestSellingProducts(5),
    getSalesByCategory(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-midnight text-2xl font-bold">Dashboard</h1>
        <p className="text-muted mt-1 text-sm">A live overview of Patron Electronics.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard
          label="Total Products"
          value={metrics.totalProducts.toLocaleString()}
          icon={Package}
        />
        <StatCard
          label="Categories"
          value={metrics.totalCategories.toLocaleString()}
          icon={FolderTree}
        />
        <StatCard
          label="Total Orders"
          value={metrics.totalOrders.toLocaleString()}
          icon={ShoppingCart}
        />
        <StatCard
          label="Pending Orders"
          value={metrics.pendingOrders.toLocaleString()}
          icon={Clock}
        />
        <StatCard
          label="Completed Orders"
          value={metrics.completedOrders.toLocaleString()}
          icon={CheckCircle2}
        />
        <StatCard
          label="Sales This Month"
          value={formatCurrency(metrics.monthSales)}
          icon={Wallet}
        />
        <StatCard
          label="Low Stock Products"
          value={metrics.lowStockCount.toLocaleString()}
          icon={AlertTriangle}
          tone="warning"
        />
        <StatCard
          label="Repair Requests"
          value={metrics.totalRepairRequests.toLocaleString()}
          icon={Wrench}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Sales — Last 7 Days">
          <BarChart
            data={salesOverTime.map((row) => ({
              label: formatDayLabel(row.day),
              value: row.total,
            }))}
            valueFormatter={formatCurrency}
          />
        </Card>
        <Card title="Orders — Last 7 Days">
          <BarChart
            data={ordersOverTime.map((row) => ({
              label: formatDayLabel(row.day),
              value: row.count,
            }))}
          />
        </Card>
        <Card title="Best-Selling Products">
          <HorizontalBarList
            items={bestSellers.map((row) => ({
              label: row.name,
              value: row.quantitySold,
              displayValue: `${row.quantitySold} sold`,
            }))}
          />
        </Card>
        <Card title="Sales by Category">
          <HorizontalBarList
            items={salesByCategory.map((row) => ({
              label: row.categoryName,
              value: row.total,
              displayValue: formatCurrency(row.total),
            }))}
          />
        </Card>
      </div>
    </div>
  );
}
