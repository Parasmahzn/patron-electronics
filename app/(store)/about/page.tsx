import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getSiteSettings } from '@/lib/settings/settings.service';
import { ABOUT_CAPABILITIES } from '@/config/storefront-content';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about Patron Electronics — a trusted mobile and laptop store and repair centre.',
};

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <div className="container py-8 sm:py-10">
      <h1 className="font-heading text-midnight text-2xl font-bold sm:text-3xl">
        About {settings.businessName}
      </h1>

      <div className="text-muted mt-4 max-w-3xl text-sm leading-relaxed">
        {settings.aboutText ? (
          <p className="whitespace-pre-line">{settings.aboutText}</p>
        ) : (
          <p>
            {settings.businessName} is a mobile and laptop store and repair centre serving customers
            with quality devices, accessories, and dependable repair services.
          </p>
        )}
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {ABOUT_CAPABILITIES.map((item) => (
          <div key={item.title} className="border-border rounded-lg border bg-white p-5">
            <item.icon aria-hidden="true" className="text-primary h-7 w-7" />
            <h2 className="font-heading text-midnight mt-3 text-base font-semibold">
              {item.title}
            </h2>
            <p className="text-muted mt-1.5 text-sm">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="border-border bg-surface mt-10 flex flex-col gap-4 rounded-lg border p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <MapPin aria-hidden="true" className="text-primary mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="text-midnight text-sm font-semibold">Visit us</p>
            <p className="text-muted text-sm">{settings.address}</p>
          </div>
        </div>
        <Link href="/contact">
          <Button variant="outline">Contact Us</Button>
        </Link>
      </div>
    </div>
  );
}
