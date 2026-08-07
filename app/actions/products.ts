'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { z } from 'zod';
import {
  createProduct,
  updateProduct,
  setProductActive,
  deleteProduct,
} from '@/lib/products/product.service';
import { productSchema } from '@/lib/validations/product';

export type ProductFormState = { error: string; fieldErrors?: Record<string, string> } | undefined;

function readProductForm(formData: FormData) {
  const num = (key: string): number | undefined => {
    const value = formData.get(key);
    if (value === null || value === '') return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  let images: { url: string; alt: string }[] = [];
  let specifications: { label: string; value: string }[] = [];
  try {
    images = JSON.parse(String(formData.get('imagesJson') ?? '[]'));
    specifications = JSON.parse(String(formData.get('specificationsJson') ?? '[]'));
  } catch {
    // Malformed JSON from a tampered client falls back to empty arrays;
    // zod will reject the request if images/specifications were required.
  }

  return {
    name: String(formData.get('name') ?? ''),
    slug: String(formData.get('slug') ?? ''),
    sku: String(formData.get('sku') ?? ''),
    brand: String(formData.get('brand') ?? ''),
    categoryId: num('categoryId') ?? 0,
    productType: String(formData.get('productType') ?? ''),
    description: String(formData.get('description') ?? ''),
    shortDescription: String(formData.get('shortDescription') ?? ''),
    price: num('price') ?? 0,
    discountPrice: num('discountPrice') ?? null,
    stock: num('stock') ?? 0,
    lowStockThreshold: num('lowStockThreshold') ?? 5,
    warranty: String(formData.get('warranty') ?? ''),
    tags: String(formData.get('tags') ?? ''),
    isActive: formData.get('isActive') === 'on',
    isNew: formData.get('isNew') === 'on',
    isFeatured: formData.get('isFeatured') === 'on',
    isBestSeller: formData.get('isBestSeller') === 'on',
    isTopSale: formData.get('isTopSale') === 'on',
    isRecommended: formData.get('isRecommended') === 'on',
    isOnSale: formData.get('isOnSale') === 'on',
    images,
    specifications,
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

/** Products are shown on the homepage, shop, category, and detail pages. */
function revalidateProductPaths(slug?: string) {
  revalidatePath('/admin/products');
  revalidatePath('/admin/inventory');
  revalidatePath('/admin/dashboard');
  revalidatePath('/');
  revalidatePath('/shop');
  revalidatePath('/categories');
  if (slug) revalidatePath(`/products/${slug}`);
}

export async function createProductAction(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const parsed = productSchema.safeParse(readProductForm(formData));
  if (!parsed.success) {
    return { error: 'Please fix the errors below.', fieldErrors: toFieldErrors(parsed.error) };
  }

  let slug: string;
  try {
    const product = await createProduct(parsed.data);
    slug = product.slug;
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not create product.' };
  }

  revalidateProductPaths(slug);
  redirect('/admin/products');
}

export async function updateProductAction(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  // The product id travels as a hidden form field rather than a bound/closed-over
  // argument — Server Actions combined with `useActionState` were found to lose
  // the admin session when the action was wrapped in a `.bind()` or a per-item
  // inline closure. Reading every value straight out of `formData` keeps this
  // action's shape identical to the (verified-working) unbound action pattern.
  const id = Number(formData.get('id'));
  const parsed = productSchema.safeParse(readProductForm(formData));
  if (!parsed.success) {
    return { error: 'Please fix the errors below.', fieldErrors: toFieldErrors(parsed.error) };
  }

  let slug: string;
  try {
    const product = await updateProduct(id, parsed.data);
    slug = product.slug;
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not update product.' };
  }

  revalidateProductPaths(slug);
  redirect('/admin/products');
}

export async function setProductActiveAction(id: number, isActive: boolean) {
  await setProductActive(id, isActive);
  revalidateProductPaths();
}

export async function deleteProductAction(id: number) {
  try {
    await deleteProduct(id);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not delete product.';
    redirect(`/admin/products?error=${encodeURIComponent(message)}`);
  }
  revalidateProductPaths();
  redirect('/admin/products');
}
