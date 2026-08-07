import 'server-only';
import type { ImageStorage } from './types';
import { LocalImageStorage } from './local-image-storage';

// The only provider-specific code path in the app. Swapping to S3/R2/Azure
// later means adding a new class here and extending STORAGE_PROVIDER — no
// other file needs to know which provider is active.
function createImageStorage(): ImageStorage {
  const provider = process.env.STORAGE_PROVIDER ?? 'local';
  switch (provider) {
    case 'local':
      return new LocalImageStorage();
    default:
      throw new Error(`Unsupported STORAGE_PROVIDER "${provider}" — only "local" is implemented.`);
  }
}

export const imageStorage = createImageStorage();
export type { ImageStorage } from './types';
