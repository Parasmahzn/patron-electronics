'use server';

import { revalidatePath } from 'next/cache';
import type { z } from 'zod';
import { updateSiteSettings } from '@/lib/settings/settings.service';
import { siteSettingsSchema } from '@/lib/validations/settings';

export type SettingsFormState =
  | { error: string; fieldErrors?: Record<string, string>; success?: false }
  | { success: true }
  | undefined;

function readSocialLinks(formData: FormData): unknown[] {
  const raw = formData.get('socialLinksJson');
  if (typeof raw !== 'string') return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readSettingsForm(formData: FormData) {
  return {
    businessName: String(formData.get('businessName') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    address: String(formData.get('address') ?? ''),
    announcementText: String(formData.get('announcementText') ?? ''),
    heroHeading: String(formData.get('heroHeading') ?? ''),
    heroSubheading: String(formData.get('heroSubheading') ?? ''),
    aboutText: String(formData.get('aboutText') ?? ''),
    socialLinks: readSocialLinks(formData),
  };
}

function toFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}

export async function updateSettingsAction(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const parsed = siteSettingsSchema.safeParse(readSettingsForm(formData));
  if (!parsed.success) {
    return { error: 'Please fix the errors below.', fieldErrors: toFieldErrors(parsed.error) };
  }

  try {
    await updateSiteSettings(parsed.data);
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not save settings.' };
  }

  // Site settings feed the homepage hero/announcement bar and the about/contact pages;
  // social links render in the Footer, which is part of the (store) layout on every
  // storefront page — invalidate the whole layout tree, not just individual pages.
  revalidatePath('/', 'layout');
  revalidatePath('/admin/settings');

  return { success: true };
}
