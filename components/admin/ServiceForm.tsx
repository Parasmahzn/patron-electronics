'use client';

import { useActionState, useRef, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/admin/Card';
import { ErrorBanner } from '@/components/admin/ErrorBanner';
import { Thumbnail } from '@/components/admin/Thumbnail';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { deleteUploadedImageAction } from '@/app/actions/uploads';
import { extractStorageKeyFromUrl } from '@/lib/uploads/storage-key';
import { slugify } from '@/lib/utils/slugify';
import type { ServiceFormState } from '@/app/actions/services';

export type ServiceFormInitialValues = {
  id?: number;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  image: string;
  startingPrice: number | null;
  displayOrder: number;
  isActive: boolean;
};

export function ServiceForm({
  action,
  initialValues,
  submitLabel,
}: {
  action: (state: ServiceFormState, formData: FormData) => Promise<ServiceFormState>;
  initialValues?: ServiceFormInitialValues;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);
  const [name, setName] = useState(initialValues?.name ?? '');
  const [slug, setSlug] = useState(initialValues?.slug ?? '');
  const [image, setImage] = useState(initialValues?.image ?? '');
  const fieldErrors = state?.fieldErrors ?? {};

  const initialKeyRef = useRef(extractStorageKeyFromUrl(initialValues?.image));

  function handleImageUploaded(url: string) {
    const previousKey = extractStorageKeyFromUrl(image);
    if (previousKey && previousKey !== initialKeyRef.current) {
      void deleteUploadedImageAction(previousKey);
    }
    setImage(url);
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {initialValues?.id !== undefined && (
        <input type="hidden" name="id" value={initialValues.id} />
      )}
      {state?.error && <ErrorBanner message={state.error} />}

      <Card title="Service Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Name"
            name="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={fieldErrors.name}
          />
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="slug" className="text-midnight text-sm font-medium">
                Slug <span className="text-red-600">*</span>
              </label>
              <button
                type="button"
                onClick={() => setSlug(slugify(name))}
                className="text-primary text-xs font-medium hover:underline"
              >
                Generate from name
              </button>
            </div>
            <Input
              id="slug"
              name="slug"
              required
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              error={fieldErrors.slug}
            />
          </div>
          <Input
            label="Short Description"
            name="shortDescription"
            required
            defaultValue={initialValues?.shortDescription}
            error={fieldErrors.shortDescription}
            className="sm:col-span-2"
          />
          <div className="flex flex-col gap-1.5">
            <Input
              label="Image URL"
              name="image"
              value={image}
              onChange={(event) => setImage(event.target.value)}
              placeholder="/images/services/screen-repair.svg"
              error={fieldErrors.image}
            />
            <div className="flex items-center gap-3">
              <Thumbnail src={image} alt={name || 'Service image'} size={56} />
              <div className="min-w-[200px] flex-1">
                <ImageUpload
                  destination="services"
                  onUploaded={(m) => handleImageUploaded(m.url)}
                />
              </div>
            </div>
          </div>
          <Input
            label="Starting Price (Rs.)"
            name="startingPrice"
            type="number"
            min={0}
            step="0.01"
            defaultValue={initialValues?.startingPrice ?? undefined}
            hint="Optional"
            error={fieldErrors.startingPrice}
          />
          <Input
            label="Display Order"
            name="displayOrder"
            type="number"
            min={0}
            defaultValue={initialValues?.displayOrder ?? 0}
            hint="Lower numbers appear first"
            error={fieldErrors.displayOrder}
          />
          <label className="text-midnight flex items-center gap-2 self-end pb-3 text-sm font-medium">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={initialValues?.isActive ?? true}
              className="border-border text-primary focus:ring-primary h-4 w-4 rounded"
            />
            Active (visible on the storefront)
          </label>
        </div>
        <div className="mt-4">
          <Textarea
            label="Full Description"
            name="description"
            required
            rows={4}
            defaultValue={initialValues?.description}
            error={fieldErrors.description}
          />
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
