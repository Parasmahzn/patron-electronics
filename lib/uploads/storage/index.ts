import 'server-only';
import type { ImageStorage } from './types';
import { LocalImageStorage } from './local-image-storage';
import { S3ImageStorage } from './s3-image-storage';

// The only provider-specific code path in the app. Swapping to R2/Azure
// later means adding a new class here and extending STORAGE_PROVIDER — no
// other file needs to know which provider is active.
function createImageStorage(): ImageStorage {
  const provider = process.env.STORAGE_PROVIDER ?? 'local';
  switch (provider) {
    case 'local':
      return new LocalImageStorage();
    case 's3':
      return new S3ImageStorage();
    default:
      throw new Error(
        `Unsupported STORAGE_PROVIDER "${provider}" — only "local" and "s3" are implemented.`,
      );
  }
}

let cachedStorage: ImageStorage | null = null;

// Lazy, not `export const imageStorage = createImageStorage()`: this module
// is imported transitively by nearly every route (via upload.service.ts),
// so constructing eagerly would mean a bad/missing STORAGE_PROVIDER config
// crashes the entire build the moment any page is prerendered, not just the
// pages that actually touch image storage.
export function getImageStorage(): ImageStorage {
  if (!cachedStorage) {
    cachedStorage = createImageStorage();
  }
  return cachedStorage;
}

export type { ImageStorage } from './types';
