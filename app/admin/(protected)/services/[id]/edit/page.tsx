import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getServiceByIdForAdmin } from '@/lib/services/service.service';
import { updateServiceAction } from '@/app/actions/services';
import { ServiceForm } from '@/components/admin/ServiceForm';
import { toNumber } from '@/lib/utils/format-currency';

export const metadata: Metadata = {
  title: 'Edit Service',
  robots: { index: false, follow: false },
};

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const serviceId = Number(id);
  if (Number.isNaN(serviceId)) notFound();

  const service = await getServiceByIdForAdmin(serviceId);
  if (!service) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/services"
          className="text-muted hover:text-midnight inline-flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Services
        </Link>
        <h1 className="font-heading text-midnight mt-2 text-2xl font-bold">Edit Service</h1>
        <p className="text-muted mt-1 text-sm">{service.name}</p>
      </div>

      <ServiceForm
        action={updateServiceAction}
        submitLabel="Save Changes"
        initialValues={{
          id: service.id,
          name: service.name,
          slug: service.slug,
          shortDescription: service.shortDescription,
          description: service.description,
          image: service.image ?? '',
          startingPrice: service.startingPrice ? toNumber(service.startingPrice) : null,
          displayOrder: service.displayOrder,
          isActive: service.isActive,
        }}
      />
    </div>
  );
}
