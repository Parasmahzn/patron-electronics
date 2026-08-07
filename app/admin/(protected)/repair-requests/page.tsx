import type { Metadata } from 'next';
import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import { listRepairRequestsForAdmin } from '@/lib/repairs/repair.service';
import { REPAIR_STATUS_META, REPAIR_STATUS_VALUES } from '@/lib/utils/status';
import { buildAdminHref } from '@/components/admin/admin-query';
import { Card } from '@/components/admin/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import type { RepairStatus } from '@/lib/generated/prisma/client';

export const metadata: Metadata = {
  title: 'Repair Requests',
  robots: { index: false, follow: false },
};

export default async function AdminRepairRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const status = REPAIR_STATUS_VALUES.includes(sp.status as RepairStatus)
    ? (sp.status as RepairStatus)
    : undefined;
  const page = sp.page ? Number(sp.page) : 1;

  const {
    requests,
    totalCount,
    totalPages,
    page: currentPage,
  } = await listRepairRequestsForAdmin({ q, status, page });
  const buildHref = (targetPage: number) =>
    buildAdminHref('/admin/repair-requests', { q, status, page: targetPage });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-midnight text-2xl font-bold">Repair Requests</h1>
        <p className="text-muted mt-1 text-sm">
          {totalCount.toLocaleString()} request{totalCount === 1 ? '' : 's'} total
        </p>
      </div>

      <Card>
        <form className="flex flex-wrap items-end gap-3" action="/admin/repair-requests">
          <div className="min-w-48 flex-1">
            <Input
              name="q"
              defaultValue={q}
              placeholder="Request number, name, or phone..."
              aria-label="Search repair requests"
            />
          </div>
          <div className="w-full sm:w-56">
            <Select name="status" defaultValue={status ?? ''} aria-label="Filter by status">
              <option value="">All Statuses</option>
              {REPAIR_STATUS_VALUES.map((value) => (
                <option key={value} value={value}>
                  {REPAIR_STATUS_META[value].label}
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
        {requests.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={ClipboardList}
              title="No repair requests found"
              description="Try adjusting your search or filters."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-border bg-surface text-muted border-b text-left text-xs font-semibold tracking-wide uppercase">
                <tr>
                  <th className="px-4 py-3">Request</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Device</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-surface">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/repair-requests/${request.id}`}
                        className="text-primary font-medium hover:underline"
                      >
                        {request.requestNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-midnight">{request.name}</p>
                      <p className="text-muted text-xs">{request.phone}</p>
                    </td>
                    <td className="text-muted px-4 py-3 whitespace-nowrap">
                      {request.deviceType} — {request.brand} {request.model}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={REPAIR_STATUS_META[request.status].tone}>
                        {REPAIR_STATUS_META[request.status].label}
                      </Badge>
                    </td>
                    <td className="text-muted px-4 py-3 whitespace-nowrap">
                      {request.createdAt.toLocaleDateString('en-US', {
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
