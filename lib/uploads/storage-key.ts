// Pure helpers with no server-only side effects, so they're safe to import
// from client components too (e.g. to decide whether to fire an immediate
// best-effort cleanup call for a file uploaded earlier in the same session).
const STORAGE_KEY_PATTERN = /^(products|categories|services)\/\d{4}\/\d{2}\/[0-9a-f-]+\.webp$/;

export function isValidStorageKey(key: string): boolean {
  return STORAGE_KEY_PATTERN.test(key);
}

/**
 * Categories/Services store only a single scalar `image` path (no metadata
 * table) — if it matches our own managed-upload convention, derive its
 * storageKey so it can still be cleaned up on replace/delete. Returns null
 * for external URLs or manually-typed paths, which are never touched.
 */
export function extractStorageKeyFromUrl(url: string | null | undefined): string | null {
  if (!url || !url.startsWith('/images/')) return null;
  const storageKey = url.slice('/images/'.length);
  return isValidStorageKey(storageKey) ? storageKey : null;
}
