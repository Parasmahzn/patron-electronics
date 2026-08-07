import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createServiceAction } from '@/app/actions/services';
import { ServiceForm } from '@/components/admin/ServiceForm';

export const metadata: Metadata = { title: 'New Service', robots: { index: false, follow: false } };

export default function NewServicePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/services"
          className="text-muted hover:text-midnight inline-flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Services
        </Link>
        <h1 className="font-heading text-midnight mt-2 text-2xl font-bold">New Service</h1>
      </div>

      <ServiceForm action={createServiceAction} submitLabel="Create Service" />
    </div>
  );
}
