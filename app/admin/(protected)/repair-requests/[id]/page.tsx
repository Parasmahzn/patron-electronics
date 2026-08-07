import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Lock } from 'lucide-react';
import { getRepairRequestByIdForAdmin } from '@/lib/repairs/repair.service';
import { updateRepairRequestAction } from '@/app/actions/repairs';
import { REPAIR_STATUS_META, REPAIR_STATUS_VALUES } from '@/lib/utils/status';
import { Card } from '@/components/admin/Card';
import { ErrorBanner } from '@/components/admin/ErrorBanner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

export const metadata: Metadata = {
  title: 'Repair Request',
  robots: { index: false, follow: false },
};

export default async function AdminRepairRequestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const requestId = Number(id);
  if (Number.isNaN(requestId)) notFound();

  const [request, sp] = await Promise.all([getRepairRequestByIdForAdmin(requestId), searchParams]);
  if (!request) notFound();
  const currentRequestId = request.id;

  // Inline closure (not `.bind()`) — see note in products/[id]/edit/page.tsx.
  async function updateThisRepairRequest(formData: FormData) {
    'use server';
    await updateRepairRequestAction(currentRequestId, formData);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/repair-requests"
          className="text-muted hover:text-midnight inline-flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Repair Requests
        </Link>
        <h1 className="font-heading text-midnight mt-2 text-2xl font-bold">
          {request.requestNumber}
        </h1>
        <p className="text-muted mt-1 text-sm">
          Submitted{' '}
          {request.createdAt.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
      </div>

      <ErrorBanner message={sp.error} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card title="Customer & Device">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-muted text-xs font-semibold tracking-wide uppercase">Name</dt>
                <dd className="text-midnight">{request.name}</dd>
              </div>
              <div>
                <dt className="text-muted text-xs font-semibold tracking-wide uppercase">Phone</dt>
                <dd className="text-midnight">{request.phone}</dd>
              </div>
              <div>
                <dt className="text-muted text-xs font-semibold tracking-wide uppercase">
                  Device Type
                </dt>
                <dd className="text-midnight">{request.deviceType}</dd>
              </div>
              <div>
                <dt className="text-muted text-xs font-semibold tracking-wide uppercase">
                  Brand & Model
                </dt>
                <dd className="text-midnight">
                  {request.brand} {request.model}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted text-xs font-semibold tracking-wide uppercase">
                  Problem
                </dt>
                <dd className="text-midnight">{request.problem}</dd>
              </div>
              {request.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-muted text-xs font-semibold tracking-wide uppercase">
                    Additional Notes
                  </dt>
                  <dd className="text-midnight">{request.notes}</dd>
                </div>
              )}
            </dl>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card title="Status">
            <div className="mb-3">
              <Badge
                tone={REPAIR_STATUS_META[request.status].tone}
                icon={REPAIR_STATUS_META[request.status].icon}
              >
                {REPAIR_STATUS_META[request.status].label}
              </Badge>
            </div>
            <form action={updateThisRepairRequest} className="flex flex-col gap-3">
              <Select name="status" defaultValue={request.status} aria-label="Repair status">
                {REPAIR_STATUS_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {REPAIR_STATUS_META[value].label}
                  </option>
                ))}
              </Select>
              <Textarea
                name="internalNotes"
                label="Internal Notes"
                hint="Staff-only — never shown to the customer."
                rows={5}
                defaultValue={request.internalNotes ?? ''}
              />
              <div className="text-muted flex items-center gap-1.5 text-xs">
                <Lock className="h-3.5 w-3.5" /> Visible to admins only
              </div>
              <Button type="submit" size="sm" className="self-start">
                Save
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
