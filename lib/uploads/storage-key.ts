import 'server-only';

// No longer imported by any client component — see app/actions/uploads.ts
// (deleteUploadedImageAction takes a raw URL and extracts the key here,
// server-side) and the admin forms that call it. Guarded with server-only
// so a future accidental client import fails the build loudly instead of
// silently reading an undefined env var.
const STORAGE_KEY_PATTERN =
  /^(products|categories|services|avatars|banners)\/\d{4}\/\d{2}\/[0-9a-f-]+\.webp$/;

const LOCAL_URL_PREFIX = '/uploads/';

export function isValidStorageKey(key: string): boolean {
  return STORAGE_KEY_PATTERN.test(key);
}

/**
 * Categories/Services/Banners/Admin avatars store only a single scalar
 * `image`/`avatarUrl` path (no metadata table) — if it matches the
 * `/uploads/` prefix every provider's `getUrl()` produces (local or S3 —
 * both are served through app/uploads/[...path]/route.ts), derive its
 * storageKey so it can still be cleaned up on replace/delete. Returns null
 * for external URLs or manually-typed paths, which are never touched — this
 * also includes any image saved under the old, pre-proxy S3 URL scheme
 * (a direct bucket URL), which simply won't be cleaned up automatically.
 */
export function extractStorageKeyFromUrl(url: string | null | undefined): string | null {
  if (!url || !url.startsWith(LOCAL_URL_PREFIX)) return null;

  const storageKey = url.slice(LOCAL_URL_PREFIX.length);
  return isValidStorageKey(storageKey) ? storageKey : null;
}
