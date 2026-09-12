import 'server-only';
import type { ImageStorage } from './types';
import { S3ImageStorage } from './s3-image-storage';

let cachedStorage: ImageStorage | null = null;

// Lazy, not `export const imageStorage = new S3ImageStorage()`: this module
// is imported transitively by nearly every route (via upload.service.ts), so
// constructing eagerly would risk crashing the entire build the moment any
// page is prerendered if S3 env vars are ever missing — S3ImageStorage
// itself also defers real env-var validation into its own #getConfig(),
// called on first actual use, for the same reason.
export function getImageStorage(): ImageStorage {
  if (!cachedStorage) {
    cachedStorage = new S3ImageStorage();
  }
  return cachedStorage;
}

export type { ImageStorage } from './types';
