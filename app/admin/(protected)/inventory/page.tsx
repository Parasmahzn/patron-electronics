import type { Metadata } from 'next';
import { AlertTriangle, PackageX, Pencil } from 'lucide-react';
import { getLowStockProducts, getOutOfStockProducts } from '@/lib/products/product.service';
import { Card } from '@/components/admin/Card';
import { LinkButton } from '@/components/admin/LinkButton';
import { EmptyState } from '@/components/ui/EmptyState';

export const metadata: Metadata = { title: 'Inventory', robots: { index: false, follow: false } };

export default async function AdminInventoryPage() {
  const [lowStock, outOfStock] = await Promise.all([
    getLowStockProducts(),
    getOutOfStockProducts(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-midnight text-2xl font-bold">Inventory</h1>
        <p className="text-muted mt-1 text-sm">
          Products that need restocking. Stock changes are made from a product&apos;s edit page.
        </p>
      </div>

      <Card title={`Out of Stock (${outOfStock.length})`}>
        {outOfStock.length === 0 ? (
          <EmptyState
            icon={PackageX}
            title="Nothing out of stock"
            description="Every active product currently has inventory."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-border text-muted border-b text-left text-xs font-semibold tracking-wide uppercase">
                <tr>
                  <th className="py-2">Product</th>
                  <th className="py-2">SKU</th>
                  <th className="py-2">Stock</th>
                  <th className="py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {outOfStock.map((product) => (
                  <tr key={product.id}>
                    <td className="text-midnight py-3 font-medium">{product.name}</td>
                    <td className="text-muted py-3 whitespace-nowrap">{product.sku}</td>
                    <td className="py-3 font-medium text-red-600">{product.stock}</td>
                    <td className="py-3 text-right">
                      <LinkButton
                        href={`/admin/products/${product.id}/edit`}
                        variant="outline"
                        size="sm"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Restock
                      </LinkButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title={`Low Stock (${lowStock.length})`}>
        {lowStock.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="No low-stock products"
            description="Every active product is above its low-stock threshold."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-border text-muted border-b text-left text-xs font-semibold tracking-wide uppercase">
                <tr>
                  <th className="py-2">Product</th>
                  <th className="py-2">SKU</th>
                  <th className="py-2">Stock</th>
                  <th className="py-2">Threshold</th>
                  <th className="py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {lowStock.map((product) => (
                  <tr key={product.id}>
                    <td className="text-midnight py-3 font-medium">{product.name}</td>
                    <td className="text-muted py-3 whitespace-nowrap">{product.sku}</td>
                    <td className="text-amber py-3 font-medium">{product.stock}</td>
                    <td className="text-muted py-3">{product.lowStockThreshold}</td>
                    <td className="py-3 text-right">
                      <LinkButton
                        href={`/admin/products/${product.id}/edit`}
                        variant="outline"
                        size="sm"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Restock
                      </LinkButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
