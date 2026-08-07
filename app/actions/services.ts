'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { z } from 'zod';
import {
  createService,
  updateService,
  setServiceActive,
  deleteService,
  reorderServices,
  listServicesForAdmin,
} from '@/lib/services/service.service';
import { serviceSchema } from '@/lib/validations/service';

export type ServiceFormState = { error: string; fieldErrors?: Record<string, string> } | undefined;

function readServiceForm(formData: FormData) {
  const displayOrder = Number(formData.get('displayOrder'));
  const startingPriceRaw = formData.get('startingPrice');
  const startingPrice =
    startingPriceRaw === null || startingPriceRaw === '' ? null : Number(startingPriceRaw);

  return {
    name: String(formData.get('name') ?? ''),
    slug: String(formData.get('slug') ?? ''),
    shortDescription: String(formData.get('shortDescription') ?? ''),
    description: String(formData.get('description') ?? ''),
    image: String(formData.get('image') ?? ''),
    startingPrice: startingPrice === null || Number.isNaN(startingPrice) ? null : startingPrice,
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

function revalidateServicePaths(slug?: string) {
  revalidatePath('/admin/services');
  revalidatePath('/');
  revalidatePath('/services');
  if (slug) revalidatePath(`/services/${slug}`);
}

export async function createServiceAction(
  _prevState: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const parsed = serviceSchema.safeParse(readServiceForm(formData));
  if (!parsed.success) {
    return { error: 'Please fix the errors below.', fieldErrors: toFieldErrors(parsed.error) };
  }

  let slug: string;
  try {
    const service = await createService(parsed.data);
    slug = service.slug;
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not create service.' };
  }

  revalidateServicePaths(slug);
  redirect('/admin/services');
}

export async function updateServiceAction(
  _prevState: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  // The service id travels as a hidden form field, not a bound/closed-over
  // argument — see the note in app/actions/products.ts for why.
  const id = Number(formData.get('id'));
  const parsed = serviceSchema.safeParse(readServiceForm(formData));
  if (!parsed.success) {
    return { error: 'Please fix the errors below.', fieldErrors: toFieldErrors(parsed.error) };
  }

  let slug: string;
  try {
    const service = await updateService(id, parsed.data);
    slug = service.slug;
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not update service.' };
  }

  revalidateServicePaths(slug);
  redirect('/admin/services');
}

export async function setServiceActiveAction(id: number, isActive: boolean) {
  await setServiceActive(id, isActive);
  revalidateServicePaths();
}

export async function deleteServiceAction(id: number) {
  try {
    await deleteService(id);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not delete service.';
    redirect(`/admin/services?error=${encodeURIComponent(message)}`);
  }
  revalidateServicePaths();
  redirect('/admin/services');
}

export async function moveServiceAction(id: number, direction: 'up' | 'down') {
  const services = await listServicesForAdmin();
  const ids = services.map((service) => service.id);
  const index = ids.indexOf(id);
  const targetIndex = direction === 'up' ? index - 1 : index + 1;

  if (index === -1 || targetIndex < 0 || targetIndex >= ids.length) return;

  [ids[index], ids[targetIndex]] = [ids[targetIndex], ids[index]];
  await reorderServices(ids);
  revalidateServicePaths();
}
