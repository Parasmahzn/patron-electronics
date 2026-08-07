'use client';

import { useActionState } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/admin/Card';
import { ErrorBanner } from '@/components/admin/ErrorBanner';
import type { ReviewFormState } from '@/app/actions/reviews';

export type ReviewFormInitialValues = {
  id?: number;
  authorName: string;
  rating: number;
  comment: string;
  isVisible: boolean;
};

export function ReviewForm({
  action,
  initialValues,
  submitLabel,
}: {
  action: (state: ReviewFormState, formData: FormData) => Promise<ReviewFormState>;
  initialValues?: ReviewFormInitialValues;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);
  const fieldErrors = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {initialValues?.id !== undefined && (
        <input type="hidden" name="id" value={initialValues.id} />
      )}
      {state?.error && <ErrorBanner message={state.error} />}

      <Card title="Review Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Author Name"
            name="authorName"
            required
            defaultValue={initialValues?.authorName}
            error={fieldErrors.authorName}
          />
          <Select
            label="Rating"
            name="rating"
            required
            defaultValue={initialValues?.rating ?? 5}
            error={fieldErrors.rating}
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} / 5
              </option>
            ))}
          </Select>
          <div className="sm:col-span-2">
            <Textarea
              label="Comment"
              name="comment"
              required
              rows={4}
              defaultValue={initialValues?.comment}
              error={fieldErrors.comment}
            />
          </div>
          <label className="text-midnight flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="isVisible"
              defaultChecked={initialValues?.isVisible ?? true}
              className="border-border text-primary focus:ring-primary h-4 w-4 rounded"
            />
            Visible on the storefront
          </label>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
