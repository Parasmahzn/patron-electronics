'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { z } from 'zod';
import {
  createReview,
  updateReview,
  setReviewVisibility,
  deleteReview,
} from '@/lib/reviews/review.service';
import { reviewSchema } from '@/lib/validations/review';

export type ReviewFormState = { error: string; fieldErrors?: Record<string, string> } | undefined;

function readReviewForm(formData: FormData) {
  const rating = Number(formData.get('rating'));
  return {
    authorName: String(formData.get('authorName') ?? ''),
    rating: Number.isNaN(rating) ? 0 : rating,
    comment: String(formData.get('comment') ?? ''),
    isVisible: formData.get('isVisible') === 'on',
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

/** The homepage displays the live review average/count computed from this table. */
function revalidateReviewPaths() {
  revalidatePath('/admin/reviews');
  revalidatePath('/');
}

export async function createReviewAction(
  _prevState: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const parsed = reviewSchema.safeParse(readReviewForm(formData));
  if (!parsed.success) {
    return { error: 'Please fix the errors below.', fieldErrors: toFieldErrors(parsed.error) };
  }

  try {
    await createReview(parsed.data);
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not create review.' };
  }

  revalidateReviewPaths();
  redirect('/admin/reviews');
}

export async function updateReviewAction(
  _prevState: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  // The review id travels as a hidden form field, not a bound/closed-over
  // argument — see the note in app/actions/products.ts for why.
  const id = Number(formData.get('id'));
  const parsed = reviewSchema.safeParse(readReviewForm(formData));
  if (!parsed.success) {
    return { error: 'Please fix the errors below.', fieldErrors: toFieldErrors(parsed.error) };
  }

  try {
    await updateReview(id, parsed.data);
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not update review.' };
  }

  revalidateReviewPaths();
  redirect('/admin/reviews');
}

export async function setReviewVisibilityAction(id: number, isVisible: boolean) {
  await setReviewVisibility(id, isVisible);
  revalidateReviewPaths();
}

export async function deleteReviewAction(id: number) {
  await deleteReview(id);
  revalidateReviewPaths();
}
