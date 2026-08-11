'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/admin/Card';
import { ErrorBanner } from '@/components/admin/ErrorBanner';
import { updateSettingsAction, type SettingsFormState } from '@/app/actions/settings';
import { KNOWN_SOCIAL_PLATFORMS, getSocialPlatformLabel } from '@/lib/utils/social-icon';

type SocialLinkRow = { platform: string; url: string; isActive: boolean };

export type SettingsFormInitialValues = {
  businessName: string;
  phone: string;
  address: string;
  announcementText: string;
  heroHeading: string;
  heroSubheading: string;
  aboutText: string;
  socialLinks: SocialLinkRow[];
};

const OTHER_VALUE = '__other__';

export function SettingsForm({ initialValues }: { initialValues: SettingsFormInitialValues }) {
  const [state, formAction, isPending] = useActionState<SettingsFormState, FormData>(
    updateSettingsAction,
    undefined,
  );
  const [socialLinks, setSocialLinks] = useState<SocialLinkRow[]>(initialValues.socialLinks);
  const fieldErrors = state && 'fieldErrors' in state ? (state.fieldErrors ?? {}) : {};
  const error = state && 'error' in state ? state.error : undefined;

  function updateRow(index: number, patch: Partial<SocialLinkRow>) {
    setSocialLinks((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

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
        </div>
      </Card>

      <Card title="Social Media Links">
        <p className="text-muted -mt-2 mb-4 text-sm">
          Shown as icons in the footer. Leave the list empty to hide it entirely.
        </p>
        <div className="flex flex-col gap-3">
          {socialLinks.map((link, index) => {
            const isKnown = (KNOWN_SOCIAL_PLATFORMS as readonly string[]).includes(link.platform);
            const isOther = link.platform !== '' && !isKnown;
            return (
              <div key={index} className="border-border rounded-lg border p-3">
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <div className="flex flex-col gap-2">
                    <Select
                      aria-label="Platform"
                      value={isOther ? OTHER_VALUE : link.platform}
                      onChange={(event) => {
                        const value = event.target.value;
                        updateRow(index, { platform: value === OTHER_VALUE ? '' : value });
                      }}
                    >
                      <option value="">Select platform</option>
                      {KNOWN_SOCIAL_PLATFORMS.map((platform) => (
                        <option key={platform} value={platform}>
                          {getSocialPlatformLabel(platform)}
                        </option>
                      ))}
                      <option value={OTHER_VALUE}>Other…</option>
                    </Select>
                    {isOther && (
                      <Input
                        placeholder="Platform name"
                        value={link.platform}
                        onChange={(event) => updateRow(index, { platform: event.target.value })}
                      />
                    )}
                  </div>
                  <Input
                    placeholder="https://..."
                    type="url"
                    value={link.url}
                    onChange={(event) => updateRow(index, { url: event.target.value })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSocialLinks((rows) => rows.filter((_, i) => i !== index))}
                    aria-label="Remove social link"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <label className="text-muted mt-3 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={link.isActive}
                    onChange={(event) => updateRow(index, { isActive: event.target.checked })}
                    className="border-border text-primary focus:ring-primary h-4 w-4 rounded"
                  />
                  Visible in footer
                </label>
              </div>
            );
          })}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={() =>
              setSocialLinks((rows) => [...rows, { platform: '', url: '', isActive: true }])
            }
          >
            <Plus className="h-4 w-4" />
            Add Social Link
          </Button>
        </div>
        <input
          type="hidden"
          name="socialLinksJson"
          value={JSON.stringify(
            socialLinks.filter((link) => link.platform.trim() && link.url.trim()),
          )}
        />
        {fieldErrors.socialLinks && (
          <p className="mt-2 text-xs text-red-600">{fieldErrors.socialLinks}</p>
        )}
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
