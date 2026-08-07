'use client';

import { useActionState } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/admin/Card';
import { ErrorBanner } from '@/components/admin/ErrorBanner';
import { updateSettingsAction, type SettingsFormState } from '@/app/actions/settings';

export type SettingsFormInitialValues = {
  businessName: string;
  phone: string;
  address: string;
  facebookUrl: string;
  announcementText: string;
  heroHeading: string;
  heroSubheading: string;
  aboutText: string;
};

export function SettingsForm({ initialValues }: { initialValues: SettingsFormInitialValues }) {
  const [state, formAction, isPending] = useActionState<SettingsFormState, FormData>(
    updateSettingsAction,
    undefined,
  );
  const fieldErrors = state && 'fieldErrors' in state ? (state.fieldErrors ?? {}) : {};
  const error = state && 'error' in state ? state.error : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {error && <ErrorBanner message={error} />}
      {state?.success && (
        <p role="status" className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Settings saved. The storefront now reflects these changes.
        </p>
      )}

      <Card title="Business Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Business Name"
            name="businessName"
            required
            defaultValue={initialValues.businessName}
            error={fieldErrors.businessName}
          />
          <Input
            label="Phone"
            name="phone"
            required
            defaultValue={initialValues.phone}
            error={fieldErrors.phone}
          />
          <Input
            label="Address"
            name="address"
            required
            defaultValue={initialValues.address}
            error={fieldErrors.address}
            className="sm:col-span-2"
          />
          <Input
            label="Facebook URL"
            name="facebookUrl"
            type="url"
            defaultValue={initialValues.facebookUrl}
            error={fieldErrors.facebookUrl}
            className="sm:col-span-2"
          />
        </div>
      </Card>

      <Card title="Homepage Content">
        <div className="flex flex-col gap-4">
          <Input
            label="Announcement Bar Text"
            name="announcementText"
            defaultValue={initialValues.announcementText}
            hint="Shown in the sitewide announcement bar. Leave blank to hide it."
            error={fieldErrors.announcementText}
          />
          <Input
            label="Hero Heading"
            name="heroHeading"
            required
            defaultValue={initialValues.heroHeading}
            error={fieldErrors.heroHeading}
          />
          <Input
            label="Hero Subheading"
            name="heroSubheading"
            required
            defaultValue={initialValues.heroSubheading}
            error={fieldErrors.heroSubheading}
          />
          <Textarea
            label="About Text"
            name="aboutText"
            rows={5}
            defaultValue={initialValues.aboutText}
            error={fieldErrors.aboutText}
          />
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : 'Save Settings'}
        </Button>
      </div>
    </form>
  );
}
