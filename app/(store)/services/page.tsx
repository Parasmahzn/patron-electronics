import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Wrench } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { getActiveServices } from '@/lib/services/service.service';
import { formatCurrency } from '@/lib/utils/format-currency';

export const metadata: Metadata = {
  title: 'Repair Services',
  description: 'Professional mobile and laptop repair services at Patron Electronics.',
};

export default async function ServicesPage() {
  const services = await getActiveServices();

  return (
    <div className="container py-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-midnight text-2xl font-bold sm:text-3xl">
            Repair Services
          </h1>
          <p className="text-muted mt-1 max-w-xl text-sm">
            From screen replacements to water damage recovery, our technicians repair mobiles and
            laptops of every brand.
          </p>
        </div>
        <Link href="/repair">
          <Button size="lg">
            <Wrench aria-hidden="true" className="h-4 w-4" />
            Book a Repair
          </Button>
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={Wrench}
            title="No services available"
            description="Please check back soon."
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="border-border flex flex-col overflow-hidden rounded-lg border bg-white"
            >
              <div className="bg-surface relative flex aspect-[16/10] items-center justify-center">
                {service.image ? (
                  <Image src={service.image} alt={service.name} fill className="object-cover" />
                ) : (
                  <Wrench aria-hidden="true" className="text-primary h-10 w-10" />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <h2 className="font-heading text-midnight text-base font-semibold">
                  {service.name}
                </h2>
                <p className="text-muted text-sm">{service.shortDescription}</p>
                {service.startingPrice && (
                  <p className="text-primary mt-auto text-sm font-semibold">
                    Starting at {formatCurrency(service.startingPrice)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-border bg-surface mt-10 rounded-lg border p-6 text-center sm:p-8">
        <h2 className="font-heading text-midnight text-lg font-semibold">Need a repair?</h2>
        <p className="text-muted mt-1 text-sm">
          Tell us what&rsquo;s wrong and we&rsquo;ll get back to you with a diagnosis and quote.
        </p>
        <Link href="/repair" className="mt-4 inline-block">
          <Button size="lg">Book a Repair</Button>
        </Link>
      </div>
    </div>
  );
}
