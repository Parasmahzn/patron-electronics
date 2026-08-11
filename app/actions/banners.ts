'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { z } from 'zod';
import {
  createBanner,
  updateBanner,
  setBannerActive,
  deleteBanner,
  reorderBanners,
  listBannersForAdmin,
} from '@/lib/banners/banner.service';
import { bannerSchema } from '@/lib/validations/banner';

export type BannerFormState = { error: string; fieldErrors?: Record<string, string> } | undefined;

function readBannerForm(formData: FormData) {
  const displayOrder = Number(formData.get('displayOrder'));
  return {
    title: String(formData.get('title') ?? ''),
    image: String(formData.get('image') ?? ''),
    linkUrl: String(formData.get('linkUrl') ?? ''),
    displayOrder: Number.isNaN(displayOrder) ? 0 : displayOrder,
    isActive: formData.get('isActive') === 'on',
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

function revalidateBannerPaths() {
  revalidatePath('/admin/banners');
  revalidatePath('/');
}

export async function createBannerAction(
  _prevState: BannerFormState,
  formData: FormData,
): Promise<BannerFormState> {
  const parsed = bannerSchema.safeParse(readBannerForm(formData));
  if (!parsed.success) {
    return { error: 'Please fix the errors below.', fieldErrors: toFieldErrors(parsed.error) };
  }

  try {
    await createBanner(parsed.data);
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not create banner.' };
  }

  revalidateBannerPaths();
  redirect('/admin/banners');
}

export async function updateBannerAction(
  _prevState: BannerFormState,
  formData: FormData,
): Promise<BannerFormState> {
  // The banner id travels as a hidden form field, not a bound/closed-over
  // argument — see the note in app/actions/products.ts for why.
  const id = Number(formData.get('id'));
  const parsed = bannerSchema.safeParse(readBannerForm(formData));
  if (!parsed.success) {
    return { error: 'Please fix the errors below.', fieldErrors: toFieldErrors(parsed.error) };
  }

  try {
    await updateBanner(id, parsed.data);
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not update banner.' };
  }

  revalidateBannerPaths();
  redirect('/admin/banners');
}

export async function setBannerActiveAction(id: number, isActive: boolean) {
  await setBannerActive(id, isActive);
  revalidateBannerPaths();
}

export async function deleteBannerAction(id: number) {
  await deleteBanner(id);
  revalidateBannerPaths();
}

/** Swaps the given banner with its neighbor and persists the new displayOrder for every row. */
export async function moveBannerAction(id: number, direction: 'up' | 'down') {
  const banners = await listBannersForAdmin();
  const ids = banners.map((banner) => banner.id);
  const index = ids.indexOf(id);
  const targetIndex = direction === 'up' ? index - 1 : index + 1;

  if (index === -1 || targetIndex < 0 || targetIndex >= ids.length) return;

  [ids[index], ids[targetIndex]] = [ids[targetIndex], ids[index]];
  await reorderBanners(ids);
  revalidateBannerPaths();
}
