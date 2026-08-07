export const UPLOAD_MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

export const UPLOAD_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
] as const;

export type UploadAllowedMimeType = (typeof UPLOAD_ALLOWED_MIME_TYPES)[number];

// Guards against decompression-bomb-style files (small on disk, enormous
// once decoded) on top of sharp's own built-in pixel ceiling.
export const MAX_IMAGE_DIMENSION_PX = 8000;
export const MAX_IMAGE_PIXELS = 40_000_000; // ~40 megapixels

export const UPLOAD_DESTINATIONS = ['products', 'categories', 'services'] as const;

export type UploadDestination = (typeof UPLOAD_DESTINATIONS)[number];
