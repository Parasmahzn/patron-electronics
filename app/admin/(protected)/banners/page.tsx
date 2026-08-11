import type { Metadata } from 'next';
import { Image as ImageIcon, Plus, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { listBannersForAdmin } from '@/lib/banners/banner.service';
import { setBannerActiveAction, deleteBannerAction, moveBannerAction } from '@/app/actions/banners';
import { Card } from '@/components/admin/Card';
import { LinkButton } from '@/components/admin/LinkButton';
import { ConfirmSubmitButton } from '@/components/admin/ConfirmSubmitButton';
import { Thumbnail } from '@/components/admin/Thumbnail';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export const metadata: Metadata = { title: 'Banners', robots: { index: false, follow: false } };

export default async function AdminBannersPage() {
  const banners = await listBannersForAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-midnight text-2xl font-bold">Banners</h1>
          <p className="text-muted mt-1 text-sm">
            {banners.length.toLocaleString()} banner{banners.length === 1 ? '' : 's'} total — these
            drive the homepage hero carousel
          </p>
        </div>
        <LinkButton href="/admin/banners/new">
          <Plus className="h-4 w-4" /> New Banner
        </LinkButton>
      </div>

      <Card className="p-0">
        {banners.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={ImageIcon}
              title="No banners yet"
              description="Add a banner to show a sliding hero carousel on the homepage. Without any, the homepage falls back to the default hero."
              action={
                <LinkButton href="/admin/banners/new" size="sm">
                  Add a Banner
                </LinkButton>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-border bg-surface text-muted border-b text-left text-xs font-semibold tracking-wide uppercase">
                <tr>
                  <th className="px-4 py-3">Banner</th>
                  <th className="px-4 py-3">Link</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {banners.map((banner, index) => {
                  // Inline closures (not `.bind()`) so Next.js applies its
                  // closed-over-variable encryption correctly — `fn.bind(null, id)`
                  // was found to break session/cookie handling for the action.
                  async function moveUp() {
                    'use server';
                    await moveBannerAction(banner.id, 'up');
                  }
                  async function moveDown() {
                    'use server';
                    await moveBannerAction(banner.id, 'down');
                  }
                  async function toggleActive() {
                    'use server';
                    await setBannerActiveAction(banner.id, !banner.isActive);
                  }
                  async function deleteThisBanner() {
                    'use server';
                    await deleteBannerAction(banner.id);
                  }

                  return (
                    <tr key={banner.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Thumbnail src={banner.image} alt={banner.title} />
                          <p className="text-midnight font-medium">{banner.title}</p>
                        </div>
                      </td>
                      <td className="text-muted px-4 py-3 whitespace-nowrap">
                        {banner.linkUrl || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-muted w-6 text-center">{banner.displayOrder}</span>
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
                              disabled={index === banners.length - 1}
                              aria-label="Move down"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </Button>
                          </form>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={banner.isActive ? 'success' : 'neutral'}>
                          {banner.isActive ? 'Active' : 'Hidden'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <LinkButton
                            href={`/admin/banners/${banner.id}/edit`}
                            variant="outline"
                            size="sm"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="sr-only">Edit</span>
                          </LinkButton>
                          <form action={toggleActive}>
                            <Button type="submit" variant="outline" size="sm">
                              {banner.isActive ? 'Hide' : 'Show'}
                            </Button>
                          </form>
                          <ConfirmSubmitButton
                            action={deleteThisBanner}
                            confirmMessage={`Delete "${banner.title}"? This cannot be undone.`}
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
