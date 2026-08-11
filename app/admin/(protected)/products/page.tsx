import type { Metadata } from 'next';
import { Package, Plus, Pencil, Trash2 } from 'lucide-react';
import { listProductsForAdmin } from '@/lib/products/product.service';
import { getActiveCategories } from '@/lib/products/category.service';
import { setProductActiveAction, deleteProductAction } from '@/app/actions/products';
import { Card } from '@/components/admin/Card';
import { LinkButton } from '@/components/admin/LinkButton';
import { ConfirmSubmitButton } from '@/components/admin/ConfirmSubmitButton';
import { ErrorBanner } from '@/components/admin/ErrorBanner';
import { StockIndicator } from '@/components/admin/StockIndicator';
import { Thumbnail } from '@/components/admin/Thumbnail';
import { buildAdminHref } from '@/components/admin/admin-query';
import { AdminFilterBar } from '@/components/admin/AdminFilterBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/utils/format-currency';

export const metadata: Metadata = { title: 'Products', robots: { index: false, follow: false } };

type SearchParams = {
  q?: string;
  categoryId?: string;
  status?: string;
  page?: string;
  error?: string;
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const categoryId = sp.categoryId ? Number(sp.categoryId) : undefined;
  const status = sp.status === 'active' || sp.status === 'archived' ? sp.status : undefined;
  const page = sp.page ? Number(sp.page) : 1;

  const [{ products, totalCount, totalPages, page: currentPage }, categories] = await Promise.all([
    listProductsForAdmin({ q, categoryId, status, page }),
    getActiveCategories(),
  ]);

  const buildHref = (targetPage: number) =>
    buildAdminHref('/admin/products', { q, categoryId, status, page: targetPage });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-midnight text-2xl font-bold">Products</h1>
          <p className="text-muted mt-1 text-sm">
            {totalCount.toLocaleString()} product{totalCount === 1 ? '' : 's'} total
          </p>
        </div>
        <LinkButton href="/admin/products/new">
          <Plus className="h-4 w-4" /> New Product
        </LinkButton>
      </div>

      <ErrorBanner message={sp.error} />

      <Card>
        <AdminFilterBar
          searchPlaceholder="Search name, SKU, brand..."
          searchAriaLabel="Search products"
          searchDefaultValue={q}
          selects={[
            {
              name: 'categoryId',
              ariaLabel: 'Filter by category',
              allLabel: 'All Categories',
              defaultValue: categoryId ? String(categoryId) : '',
              options: categories.map((category) => ({
                value: String(category.id),
                label: category.name,
              })),
            },
            {
              name: 'status',
              ariaLabel: 'Filter by status',
              allLabel: 'All Statuses',
              defaultValue: status ?? '',
              options: [
                { value: 'active', label: 'Active' },
                { value: 'archived', label: 'Archived' },
              ],
            },
          ]}
        />
      </Card>

      <Card className="p-0">
        {products.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Package}
              title="No products found"
              description="Try adjusting your search or filters, or add a new product."
              action={
                <LinkButton href="/admin/products/new" size="sm">
                  Add a Product
                </LinkButton>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-border bg-surface text-muted border-b text-left text-xs font-semibold tracking-wide uppercase">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {products.map((product) => {
                  // Inline closures (not `.bind()`) so Next.js applies its
                  // closed-over-variable encryption correctly — `fn.bind(null, id)`
                  // was found to break session/cookie handling for the action.
                  async function toggleActive() {
                    'use server';
                    await setProductActiveAction(product.id, !product.isActive);
                  }
                  async function deleteThisProduct() {
                    'use server';
                    await deleteProductAction(product.id);
                  }

                  return (
                    <tr key={product.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Thumbnail src={product.images[0]?.url} alt={product.name} />
                          <div>
                            <p className="text-midnight font-medium">{product.name}</p>
                            <p className="text-muted text-xs">{product.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-muted px-4 py-3 whitespace-nowrap">{product.sku}</td>
                      <td className="text-muted px-4 py-3 whitespace-nowrap">
                        {product.category.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-midnight font-medium">
                          {formatCurrency(product.discountPrice ?? product.price)}
                        </p>
                        {product.discountPrice && (
                          <p className="text-muted text-xs line-through">
                            {formatCurrency(product.price)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StockIndicator
                          stock={product.stock}
                          threshold={product.lowStockThreshold}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={product.isActive ? 'success' : 'neutral'}>
                          {product.isActive ? 'Active' : 'Archived'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <LinkButton
                            href={`/admin/products/${product.id}/edit`}
                            variant="outline"
                            size="sm"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="sr-only">Edit</span>
                          </LinkButton>
                          <form action={toggleActive}>
                            <Button type="submit" variant="outline" size="sm">
                              {product.isActive ? 'Archive' : 'Restore'}
                            </Button>
                          </form>
                          <ConfirmSubmitButton
                            action={deleteThisProduct}
                            confirmMessage={`Delete "${product.name}"? This cannot be undone.`}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="sr-only">Delete</span>
                          </ConfirmSubmitButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Pagination currentPage={currentPage} totalPages={totalPages} buildHref={buildHref} />
    </div>
  );
}
