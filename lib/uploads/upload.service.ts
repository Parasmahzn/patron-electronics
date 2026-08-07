import 'server-only';
import { randomUUID } from 'node:crypto';
import { requireAdmin } from '@/lib/auth/session';
import { imageStorage } from './storage';
import { validateAndProcessImage } from './upload.validation';
import { UPLOAD_DESTINATIONS, type UploadDestination } from './upload.constants';
import { isValidStorageKey } from './storage-key';

export { extractStorageKeyFromUrl } from './storage-key';

export type UploadedImageMetadata = {
  storageKey: string;
  url: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  width: number;
  height: number;
  format: string;
};

function buildStorageKey(destination: UploadDestination): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${destination}/${year}/${month}/${randomUUID()}.webp`;
}

export async function uploadImage(
  file: File,
  destination: UploadDestination,
): Promise<UploadedImageMetadata> {
  await requireAdmin();

  if (!UPLOAD_DESTINATIONS.includes(destination)) {
    throw new Error('Invalid upload destination.');
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const processed = await validateAndProcessImage(inputBuffer, file.type);

  const storageKey = buildStorageKey(destination);
  await imageStorage.upload(processed.buffer, storageKey);

  return {
    storageKey,
    url: imageStorage.getUrl(storageKey),
    // Stored only as inert display metadata — never used for paths or checks.
    originalName: file.name,
    mimeType: 'image/webp',
    fileSize: processed.sizeBytes,
    width: processed.width,
    height: processed.height,
    format: processed.format,
  };
}

/**
 * Best-effort cleanup for images superseded by a replace/remove/delete, or
 * uploaded but never persisted because the owning save failed. Never
 * throws — a failed cleanup must not block the admin's actual save action.
 * Failures are logged loudly (not silently ignored) so they're at least
 * visible in server logs as the "mechanism for cleanup" for the rare case a
 * file can't be removed; a background sweep is not implemented (documented
 * limitation, not solved here).
 */
export async function deleteUploadedImage(storageKey: string): Promise<void> {
  await requireAdmin();
  await deleteUploadedImageInternal(storageKey);
}

/** Same as deleteUploadedImage but for internal server-to-server calls that already checked auth (e.g. inside a service function that itself calls requireAdmin()). */
export async function deleteUploadedImageInternal(storageKey: string): Promise<void> {
  if (!isValidStorageKey(storageKey)) {
    return;
  }

  try {
    await imageStorage.delete(storageKey);
  } catch (error) {
    console.error(`Failed to clean up uploaded image "${storageKey}":`, error);
  }
}
