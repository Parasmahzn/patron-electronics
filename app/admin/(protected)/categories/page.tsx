import type { Metadata } from 'next';
import { FolderTree, Plus, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { listCategoriesForAdmin } from '@/lib/products/category.service';
import {
  setCategoryActiveAction,
  deleteCategoryAction,
  moveCategoryAction,
} from '@/app/actions/categories';
import { Card } from '@/components/admin/Card';
import { LinkButton } from '@/components/admin/LinkButton';
import { ConfirmSubmitButton } from '@/components/admin/ConfirmSubmitButton';
import { ErrorBanner } from '@/components/admin/ErrorBanner';
import { Thumbnail } from '@/components/admin/Thumbnail';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export const metadata: Metadata = { title: 'Categories', robots: { index: false, follow: false } };

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const categories = await listCategoriesForAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-midnight text-2xl font-bold">Categories</h1>
          <p className="text-muted mt-1 text-sm">
            {categories.length.toLocaleString()} categor{categories.length === 1 ? 'y' : 'ies'}{' '}
            total
          </p>
        </div>
        <LinkButton href="/admin/categories/new">
          <Plus className="h-4 w-4" /> New Category
        </LinkButton>
      </div>

      <ErrorBanner message={sp.error} />

      <Card className="p-0">
        {categories.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={FolderTree}
              title="No categories yet"
              description="Create your first category to start organizing products."
              action={
                <LinkButton href="/admin/categories/new" size="sm">
                  Add a Category
                </LinkButton>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-border bg-surface text-muted border-b text-left text-xs font-semibold tracking-wide uppercase">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Products</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {categories.map((category, index) => {
                  // Inline closures (not `.bind()`) so Next.js applies its
                  // closed-over-variable encryption correctly — `fn.bind(null, id)`
                  // was found to break session/cookie handling for the action.
                  async function moveUp() {
                    'use server';
                    await moveCategoryAction(category.id, 'up');
                  }
                  async function moveDown() {
                    'use server';
                    await moveCategoryAction(category.id, 'down');
                  }
                  async function toggleActive() {
                    'use server';
                    await setCategoryActiveAction(category.id, !category.isActive);
                  }
                  async function deleteThisCategory() {
                    'use server';
                    await deleteCategoryAction(category.id);
                  }

                  return (
                    <tr key={category.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Thumbnail src={category.image} alt={category.name} />
                          <p className="text-midnight font-medium">{category.name}</p>
                        </div>
                      </td>
                      <td className="text-muted px-4 py-3 whitespace-nowrap">{category.slug}</td>
                      <td className="text-muted px-4 py-3 whitespace-nowrap">
                        {category._count.products}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-muted w-6 text-center">
                            {category.displayOrder}
                          </span>
                          <form action={moveUp}>
                            <Button
                              type="submit"
                              variant="ghost"
                              size="sm"
                              disabled={index === 0}
                              aria-label="Move up"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </Button>
                          </form>
                          <form action={moveDown}>
                            <Button
                              type="submit"
                              variant="ghost"
                              size="sm"
                              disabled={index === categories.length - 1}
                              aria-label="Move down"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </Button>
                          </form>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={category.isActive ? 'success' : 'neutral'}>
                          {category.isActive ? 'Active' : 'Archived'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <LinkButton
                            href={`/admin/categories/${category.id}/edit`}
                            variant="outline"
                            size="sm"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="sr-only">Edit</span>
                          </LinkButton>
                          <form action={toggleActive}>
                            <Button type="submit" variant="outline" size="sm">
                              {category.isActive ? 'Archive' : 'Restore'}
                            </Button>
                          </form>
                          <ConfirmSubmitButton
                            action={deleteThisCategory}
                            confirmMessage={`Delete "${category.name}"? This cannot be undone.`}
                            disabled={category._count.products > 0}
                            title={
                              category._count.products > 0
                                ? 'Categories with products cannot be deleted — archive it instead.'
                                : undefined
                            }
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
    </div>
  );
}
