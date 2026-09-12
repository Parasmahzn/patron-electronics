'use server';

import { requireAdmin } from '@/lib/auth/session';
import {
  uploadImage,
  deleteUploadedImage,
  extractStorageKeyFromUrl,
  type UploadedImageMetadata,
} from '@/lib/uploads/upload.service';
import { UPLOAD_DESTINATIONS, type UploadDestination } from '@/lib/uploads/upload.constants';

export type UploadImageResult = { data: UploadedImageMetadata } | { error: string };

export async function uploadImageAction(
  destination: UploadDestination,
  formData: FormData,
): Promise<UploadImageResult> {
  // Deliberately outside the try/catch below: requireAdmin() redirects
  // unauthenticated requests via Next's redirect() signal, which must
  // propagate to the framework, not get swallowed as a generic error.
  await requireAdmin();

  if (!UPLOAD_DESTINATIONS.includes(destination)) {
    return { error: 'Invalid upload destination.' };
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return { error: 'No file provided.' };
  }

  try {
    const data = await uploadImage(file, destination);
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Upload failed.' };
  }
}

/**
 * Takes the raw stored `image`/`avatarUrl` string, not a pre-computed
 * storage key — the key extraction happens here, server-side, specifically
 * so the bucket's URL prefix never needs to be known by client code. A URL
 * that isn't one of our managed uploads (external, manually typed) safely
 * no-ops.
 */
export async function deleteUploadedImageAction(url: string): Promise<void> {
  const storageKey = extractStorageKeyFromUrl(url);
  if (!storageKey) return;
  await deleteUploadedImage(storageKey);
}
