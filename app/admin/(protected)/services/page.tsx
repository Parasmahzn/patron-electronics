import type { Metadata } from 'next';
import { Wrench, Plus, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { listServicesForAdmin } from '@/lib/services/service.service';
import {
  setServiceActiveAction,
  deleteServiceAction,
  moveServiceAction,
} from '@/app/actions/services';
import { Card } from '@/components/admin/Card';
import { LinkButton } from '@/components/admin/LinkButton';
import { ConfirmSubmitButton } from '@/components/admin/ConfirmSubmitButton';
import { ErrorBanner } from '@/components/admin/ErrorBanner';
import { Thumbnail } from '@/components/admin/Thumbnail';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/utils/format-currency';

export const metadata: Metadata = { title: 'Services', robots: { index: false, follow: false } };

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const services = await listServicesForAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-midnight text-2xl font-bold">Services</h1>
          <p className="text-muted mt-1 text-sm">
            {services.length.toLocaleString()} service{services.length === 1 ? '' : 's'} total
          </p>
        </div>
        <LinkButton href="/admin/services/new">
          <Plus className="h-4 w-4" /> New Service
        </LinkButton>
      </div>

      <ErrorBanner message={sp.error} />

      <Card className="p-0">
        {services.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Wrench}
              title="No services yet"
              description="Add a repair or maintenance service for customers to book."
              action={
                <LinkButton href="/admin/services/new" size="sm">
                  Add a Service
                </LinkButton>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-border bg-surface text-muted border-b text-left text-xs font-semibold tracking-wide uppercase">
                <tr>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Starting Price</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {services.map((service, index) => {
                  // Inline closures (not `.bind()`) — see note in
                  // products/[id]/edit/page.tsx.
                  async function moveUp() {
                    'use server';
                    await moveServiceAction(service.id, 'up');
                  }
                  async function moveDown() {
                    'use server';
                    await moveServiceAction(service.id, 'down');
                  }
                  async function toggleActive() {
                    'use server';
                    await setServiceActiveAction(service.id, !service.isActive);
                  }
                  async function deleteThisService() {
                    'use server';
                    await deleteServiceAction(service.id);
                  }

                  return (
                    <tr key={service.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Thumbnail src={service.image} alt={service.name} />
                          <div>
                            <p className="text-midnight font-medium">{service.name}</p>
                            <p className="text-muted text-xs">{service.shortDescription}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-muted px-4 py-3 whitespace-nowrap">
                        {service.startingPrice ? formatCurrency(service.startingPrice) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-muted w-6 text-center">{service.displayOrder}</span>
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
                              disabled={index === services.length - 1}
                              aria-label="Move down"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </Button>
                          </form>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={service.isActive ? 'success' : 'neutral'}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <LinkButton
                            href={`/admin/services/${service.id}/edit`}
                            variant="outline"
                            size="sm"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="sr-only">Edit</span>
                          </LinkButton>
                          <form action={toggleActive}>
                            <Button type="submit" variant="outline" size="sm">
                              {service.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                          </form>
                          <ConfirmSubmitButton
                            action={deleteThisService}
                            confirmMessage={`Delete "${service.name}"? This cannot be undone.`}
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
