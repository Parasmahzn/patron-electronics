'use client';

import { useActionState, useRef, useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/admin/Card';
import { ErrorBanner } from '@/components/admin/ErrorBanner';
import { Thumbnail } from '@/components/admin/Thumbnail';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { deleteUploadedImageAction } from '@/app/actions/uploads';
import { slugify } from '@/lib/utils/slugify';
import { formatFileSize } from '@/lib/utils/format-file-size';
import type { UploadedImageMetadata } from '@/lib/uploads/upload.service';
import type { ProductFormState } from '@/app/actions/products';

type CategoryOption = { id: number; name: string };
type ImageRow = {
  url: string;
  alt: string;
  isPrimary: boolean;
  storageKey?: string;
  originalName?: string;
  mimeType?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  format?: string;
};
type SpecRow = { label: string; value: string };

export type ProductFormInitialValues = {
  id?: number;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  categoryId: number;
  productType: string;
  description: string;
  shortDescription: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  lowStockThreshold: number;
  warranty: string;
  tags: string;
  isActive: boolean;
  isNew: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isTopSale: boolean;
  isRecommended: boolean;
  isOnSale: boolean;
  images: ImageRow[];
  specifications: SpecRow[];
};

const FLAG_FIELDS: { name: keyof ProductFormInitialValues; label: string }[] = [
  { name: 'isNew', label: 'New' },
  { name: 'isFeatured', label: 'Featured' },
  { name: 'isBestSeller', label: 'Best Seller' },
  { name: 'isTopSale', label: 'Top Sale' },
  { name: 'isRecommended', label: 'Recommended' },
  { name: 'isOnSale', label: 'On Sale' },
];

export function ProductForm({
  action,
  categories,
  initialValues,
  submitLabel,
}: {
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  categories: CategoryOption[];
  initialValues?: ProductFormInitialValues;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);
  const [name, setName] = useState(initialValues?.name ?? '');
  const [slug, setSlug] = useState(initialValues?.slug ?? '');
  const [images, setImages] = useState<ImageRow[]>(
    initialValues?.images.length ? initialValues.images : [{ url: '', alt: '', isPrimary: true }],
  );
  const [specifications, setSpecifications] = useState<SpecRow[]>(
    initialValues?.specifications ?? [],
  );

  // Images already saved to this product when the form loaded. Anything
  // uploaded during this session that ISN'T in this set was never
  // referenced by any DB row, so it's safe to delete immediately if the
  // admin removes it before saving — no risk of orphaning a live reference.
  const savedStorageKeysRef = useRef(
    new Set(initialValues?.images.map((image) => image.storageKey).filter(Boolean)),
  );

  const fieldErrors = state?.fieldErrors ?? {};

  function handleImageUploaded(index: number, metadata: UploadedImageMetadata) {
    setImages((rows) =>
      rows.map((row, i) =>
        i === index
          ? {
              ...row,
              url: metadata.url,
              alt: row.alt || metadata.originalName.replace(/\.[^/.]+$/, ''),
              storageKey: metadata.storageKey,
              originalName: metadata.originalName,
              mimeType: metadata.mimeType,
              fileSize: metadata.fileSize,
              width: metadata.width,
              height: metadata.height,
              format: metadata.format,
            }
          : row,
      ),
    );
  }

  function removeImage(index: number) {
    const removed = images[index];
    setImages((rows) => {
      const next = rows.filter((_, i) => i !== index);
      if (removed.isPrimary && next.length > 0 && !next.some((row) => row.isPrimary)) {
        next[0] = { ...next[0], isPrimary: true };
      }
      return next;
    });
    if (removed.storageKey && !savedStorageKeysRef.current.has(removed.storageKey)) {
      void deleteUploadedImageAction(removed.storageKey);
    }
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((rows) => {
      const target = index + direction;
      if (target < 0 || target >= rows.length) return rows;
      const next = [...rows];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function setPrimaryImage(index: number) {
    setImages((rows) => rows.map((row, i) => ({ ...row, isPrimary: i === index })));
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {initialValues?.id !== undefined && (
        <input type="hidden" name="id" value={initialValues.id} />
      )}
      {state?.error && <ErrorBanner message={state.error} />}

      <Card title="Basic Information">
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
            label="SKU"
            name="sku"
            required
            defaultValue={initialValues?.sku}
            error={fieldErrors.sku}
          />
          <Input
            label="Brand"
            name="brand"
            required
            defaultValue={initialValues?.brand}
            error={fieldErrors.brand}
          />
          <Select
            label="Category"
            name="categoryId"
            required
            defaultValue={initialValues?.categoryId ?? ''}
            error={fieldErrors.categoryId}
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <Select
            label="Product Type"
            name="productType"
            required
            defaultValue={initialValues?.productType ?? 'MOBILE'}
            error={fieldErrors.productType}
          >
            <option value="MOBILE">Mobile</option>
            <option value="LAPTOP">Laptop</option>
            <option value="ACCESSORY">Accessory</option>
            <option value="GADGET">Gadget</option>
          </Select>
        </div>
      </Card>

      <Card title="Description">
        <div className="flex flex-col gap-4">
          <Input
            label="Short Description"
            name="shortDescription"
            required
            defaultValue={initialValues?.shortDescription}
            hint="Shown on product cards and search results"
            error={fieldErrors.shortDescription}
          />
          <Textarea
            label="Full Description"
            name="description"
            required
            rows={5}
            defaultValue={initialValues?.description}
            error={fieldErrors.description}
          />
        </div>
      </Card>

      <Card title="Pricing & Stock">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Price (Rs.)"
            name="price"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={initialValues?.price}
            error={fieldErrors.price}
          />
          <Input
            label="Discount Price (Rs.)"
            name="discountPrice"
            type="number"
            min={0}
            step="0.01"
            defaultValue={initialValues?.discountPrice ?? undefined}
            hint="Optional — must be lower than price"
            error={fieldErrors.discountPrice}
          />
          <Input
            label="Warranty"
            name="warranty"
            defaultValue={initialValues?.warranty}
            placeholder="e.g. 1 Year"
            error={fieldErrors.warranty}
          />
          <Input
            label="Stock"
            name="stock"
            type="number"
            min={0}
            required
            defaultValue={initialValues?.stock}
            error={fieldErrors.stock}
          />
          <Input
            label="Low Stock Threshold"
            name="lowStockThreshold"
            type="number"
            min={0}
            defaultValue={initialValues?.lowStockThreshold ?? 5}
            error={fieldErrors.lowStockThreshold}
          />
          <Input
            label="Tags"
            name="tags"
            defaultValue={initialValues?.tags}
            placeholder="comma, separated, tags"
            error={fieldErrors.tags}
          />
        </div>
      </Card>

      <Card title="Flags & Visibility">
        <label className="text-midnight mb-4 flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={initialValues?.isActive ?? true}
            className="border-border text-primary focus:ring-primary h-4 w-4 rounded"
          />
          Active (visible on the storefront)
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FLAG_FIELDS.map((flag) => (
            <label key={flag.name} className="text-midnight flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name={flag.name}
                defaultChecked={Boolean(initialValues?.[flag.name])}
                className="border-border text-primary focus:ring-primary h-4 w-4 rounded"
              />
              {flag.label}
            </label>
          ))}
        </div>
      </Card>

      <Card title="Images">
        <div className="flex flex-col gap-4">
          {images.map((image, index) => (
            <div key={index} className="border-border flex flex-col gap-3 rounded-md border p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder="Image URL (or upload below)"
                  value={image.url}
                  onChange={(event) =>
                    setImages((rows) =>
                      rows.map((row, i) =>
                        i === index ? { ...row, url: event.target.value } : row,
                      ),
                    )
                  }
                />
                <Input
                  placeholder="Alt text"
                  value={image.alt}
                  onChange={(event) =>
                    setImages((rows) =>
                      rows.map((row, i) =>
                        i === index ? { ...row, alt: event.target.value } : row,
                      ),
                    )
                  }
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Thumbnail src={image.url} alt={image.alt || 'Product image'} size={56} />
                <div className="min-w-[220px] flex-1">
                  <ImageUpload
                    destination="products"
                    onUploaded={(metadata) => handleImageUploaded(index, metadata)}
                  />
                </div>
                <Button
                  type="button"
                  variant={image.isPrimary ? 'primary' : 'outline'}
                  size="sm"
                  disabled={image.isPrimary}
                  onClick={() => setPrimaryImage(index)}
                >
                  {image.isPrimary ? 'Primary' : 'Set as primary'}
                </Button>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => moveImage(index, -1)}
                    aria-label="Move image up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={index === images.length - 1}
                    onClick={() => moveImage(index, 1)}
                    aria-label="Move image down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeImage(index)}
                  aria-label="Remove image"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {image.width && image.height && (
                <p className="text-muted text-[11px]">
                  {image.format?.toUpperCase()} · {image.width}×{image.height}
                  {image.fileSize ? ` · ${formatFileSize(image.fileSize)}` : ''}
                </p>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={() =>
              setImages((rows) => [...rows, { url: '', alt: '', isPrimary: rows.length === 0 }])
            }
          >
            <Plus className="h-4 w-4" />
            Add Image
          </Button>
        </div>
        <input
          type="hidden"
          name="imagesJson"
          value={JSON.stringify(images.filter((image) => image.url.trim() && image.alt.trim()))}
        />
        {fieldErrors.images && <p className="mt-2 text-xs text-red-600">{fieldErrors.images}</p>}
      </Card>

      <Card title="Specifications">
        <div className="flex flex-col gap-3">
          {specifications.map((spec, index) => (
            <div key={index} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <Input
                placeholder="Label (e.g. Display)"
                value={spec.label}
                onChange={(event) =>
                  setSpecifications((rows) =>
                    rows.map((row, i) =>
                      i === index ? { ...row, label: event.target.value } : row,
                    ),
                  )
                }
              />
              <Input
                placeholder="Value (e.g. 6.5-inch AMOLED)"
                value={spec.value}
                onChange={(event) =>
                  setSpecifications((rows) =>
                    rows.map((row, i) =>
                      i === index ? { ...row, value: event.target.value } : row,
                    ),
                  )
                }
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSpecifications((rows) => rows.filter((_, i) => i !== index))}
                aria-label="Remove specification"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={() => setSpecifications((rows) => [...rows, { label: '', value: '' }])}
          >
            <Plus className="h-4 w-4" />
            Add Specification
          </Button>
        </div>
        <input
          type="hidden"
          name="specificationsJson"
          value={JSON.stringify(
            specifications.filter((spec) => spec.label.trim() && spec.value.trim()),
          )}
        />
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
