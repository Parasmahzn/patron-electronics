import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/settings/settings.service';
import { SettingsForm } from '@/components/admin/SettingsForm';

export const metadata: Metadata = { title: 'Settings', robots: { index: false, follow: false } };

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-midnight text-2xl font-bold">Settings</h1>
        <p className="text-muted mt-1 text-sm">
          Manage the storefront&apos;s business information and homepage content.
        </p>
      </div>

      <SettingsForm
        initialValues={{
          businessName: settings.businessName,
          phone: settings.phone,
          address: settings.address,
          facebookUrl: settings.facebookUrl ?? '',
          announcementText: settings.announcementText ?? '',
          heroHeading: settings.heroHeading,
          heroSubheading: settings.heroSubheading,
          aboutText: settings.aboutText ?? '',
        }}
      />
    </div>
  );
}
