'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { z } from 'zod';
import {
  createCategory,
  updateCategory,
  setCategoryActive,
  archiveCategory,
  deleteCategory,
  reorderCategories,
  listCategoriesForAdmin,
} from '@/lib/products/category.service';
import { categorySchema } from '@/lib/validations/category';

export type CategoryFormState = { error: string; fieldErrors?: Record<string, string> } | undefined;

function readCategoryForm(formData: FormData) {
  const displayOrder = Number(formData.get('displayOrder'));
  return {
    name: String(formData.get('name') ?? ''),
    slug: String(formData.get('slug') ?? ''),
    description: String(formData.get('description') ?? ''),
    image: String(formData.get('image') ?? ''),
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

function revalidateCategoryPaths(slug?: string) {
  revalidatePath('/admin/categories');
  revalidatePath('/admin/products');
  revalidatePath('/admin/dashboard');
  revalidatePath('/');
  revalidatePath('/shop');
  revalidatePath('/categories');
  if (slug) revalidatePath(`/categories/${slug}`);
}

export async function createCategoryAction(
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const parsed = categorySchema.safeParse(readCategoryForm(formData));
  if (!parsed.success) {
    return { error: 'Please fix the errors below.', fieldErrors: toFieldErrors(parsed.error) };
  }

  let slug: string;
  try {
    const category = await createCategory(parsed.data);
    slug = category.slug;
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not create category.' };
  }

  revalidateCategoryPaths(slug);
  redirect('/admin/categories');
}

export async function updateCategoryAction(
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  // The category id travels as a hidden form field, not a bound/closed-over
  // argument — see the note in app/actions/products.ts for why.
  const id = Number(formData.get('id'));
  const parsed = categorySchema.safeParse(readCategoryForm(formData));
  if (!parsed.success) {
    return { error: 'Please fix the errors below.', fieldErrors: toFieldErrors(parsed.error) };
  }

  let slug: string;
  try {
    const category = await updateCategory(id, parsed.data);
    slug = category.slug;
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not update category.' };
  }

  revalidateCategoryPaths(slug);
  redirect('/admin/categories');
}

export async function setCategoryActiveAction(id: number, isActive: boolean) {
  await setCategoryActive(id, isActive);
  revalidateCategoryPaths();
}

export async function archiveCategoryAction(id: number) {
  await archiveCategory(id);
  revalidateCategoryPaths();
}

export async function deleteCategoryAction(id: number) {
  try {
    await deleteCategory(id);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not delete category.';
    redirect(`/admin/categories?error=${encodeURIComponent(message)}`);
  }
  revalidateCategoryPaths();
  redirect('/admin/categories');
}

/** Swaps the given category with its neighbor and persists the new displayOrder for every row. */
export async function moveCategoryAction(id: number, direction: 'up' | 'down') {
  const categories = await listCategoriesForAdmin();
  const ids = categories.map((category) => category.id);
  const index = ids.indexOf(id);
  const targetIndex = direction === 'up' ? index - 1 : index + 1;

  if (index === -1 || targetIndex < 0 || targetIndex >= ids.length) return;

  [ids[index], ids[targetIndex]] = [ids[targetIndex], ids[index]];
  await reorderCategories(ids);
  revalidateCategoryPaths();
}
