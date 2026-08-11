'use client';

import { useActionState, useRef, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/admin/Card';
import { ErrorBanner } from '@/components/admin/ErrorBanner';
import { Thumbnail } from '@/components/admin/Thumbnail';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { deleteUploadedImageAction } from '@/app/actions/uploads';
import { extractStorageKeyFromUrl } from '@/lib/uploads/storage-key';
import type { BannerFormState } from '@/app/actions/banners';

export type BannerFormInitialValues = {
  id?: number;
  title: string;
  image: string;
  linkUrl: string;
  displayOrder: number;
  isActive: boolean;
};

export function BannerForm({
  action,
  initialValues,
  submitLabel,
}: {
  action: (state: BannerFormState, formData: FormData) => Promise<BannerFormState>;
  initialValues?: BannerFormInitialValues;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);
  const [image, setImage] = useState(initialValues?.image ?? '');
  const fieldErrors = state?.fieldErrors ?? {};

  // The image this form loaded with. Replacing it with a new upload before
  // saving is safe to clean up immediately — nothing in the DB references
  // the superseded upload from this session yet.
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

      <Card title="Banner Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Title"
            name="title"
            required
            defaultValue={initialValues?.title}
            hint="Shown to admins in the list, and used as the slide's alt text."
            error={fieldErrors.title}
            className="sm:col-span-2"
          />
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Input
              label="Image"
              name="image"
              required
              value={image}
              onChange={(event) => setImage(event.target.value)}
              placeholder="/images/banners/..."
              hint="Recommended: a 2:1 landscape image (e.g. 1920x960px) — the homepage slider fits the whole image without cropping, so a different ratio will show as letterboxing instead of filling the slot."
              error={fieldErrors.image}
            />
            <div className="flex items-center gap-3">
              <Thumbnail src={image} alt={initialValues?.title || 'Banner image'} size={56} />
              <div className="min-w-[220px] flex-1">
                <ImageUpload destination="banners" onUploaded={(m) => handleImageUploaded(m.url)} />
              </div>
            </div>
          </div>
          <Input
            label="Link URL"
            name="linkUrl"
            defaultValue={initialValues?.linkUrl}
            placeholder="/products/some-product or https://..."
            hint="Where clicking the slide goes. A relative path (/shop, /products/...) or a full URL. Leave blank for a non-clickable slide."
            error={fieldErrors.linkUrl}
            className="sm:col-span-2"
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
            Active (visible on the homepage)
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
