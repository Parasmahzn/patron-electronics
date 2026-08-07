import 'server-only';
import sharp from 'sharp';
import { fileTypeFromBuffer } from 'file-type';
import {
  UPLOAD_ALLOWED_MIME_TYPES,
  UPLOAD_MAX_SIZE_BYTES,
  MAX_IMAGE_DIMENSION_PX,
  MAX_IMAGE_PIXELS,
  type UploadAllowedMimeType,
} from './upload.constants';

export type ProcessedImage = {
  buffer: Buffer;
  width: number;
  height: number;
  format: 'webp';
  sizeBytes: number;
};

/**
 * Full validation + processing pipeline for an uploaded image. Never trusts
 * the browser-declared MIME type or the client's filename/extension — every
 * check re-derives the truth from the actual bytes. Throws a descriptive
 * Error for any failed check; callers surface `error.message` to the admin.
 */
export async function validateAndProcessImage(
  buffer: Buffer,
  declaredMimeType: string,
): Promise<ProcessedImage> {
  if (buffer.byteLength === 0) {
    throw new Error('The file is empty.');
  }
  if (buffer.byteLength > UPLOAD_MAX_SIZE_BYTES) {
    throw new Error(`File is too large — max ${UPLOAD_MAX_SIZE_BYTES / (1024 * 1024)}MB.`);
  }
  if (!UPLOAD_ALLOWED_MIME_TYPES.includes(declaredMimeType as UploadAllowedMimeType)) {
    throw new Error('Unsupported file type. Allowed: JPEG, PNG, WebP, GIF, AVIF.');
  }

  // Sniff the real type from the actual bytes — rejects a non-image file
  // renamed with a spoofed image extension/MIME type.
  const sniffed = await fileTypeFromBuffer(buffer);
  if (!sniffed || !UPLOAD_ALLOWED_MIME_TYPES.includes(sniffed.mime as UploadAllowedMimeType)) {
    throw new Error('File content does not match a supported image format.');
  }

  // Decoding with sharp is the real proof the bytes form a valid, complete
  // image — catches corrupted/truncated files that pass the byte sniff.
  // limitInputPixels also guards against decompression-bomb-style files.
  const metadata = await (async () => {
    try {
      return await sharp(buffer, { limitInputPixels: MAX_IMAGE_PIXELS }).metadata();
    } catch {
      throw new Error('The file could not be read as a valid image (corrupted or unsupported).');
    }
  })();

  const { width, height } = metadata;
  if (!width || !height) {
    throw new Error('Could not determine image dimensions.');
  }
  if (width > MAX_IMAGE_DIMENSION_PX || height > MAX_IMAGE_DIMENSION_PX) {
    throw new Error(`Image dimensions too large — max ${MAX_IMAGE_DIMENSION_PX}px per side.`);
  }
  if (width * height > MAX_IMAGE_PIXELS) {
    throw new Error('Image has too many total pixels.');
  }

  // Re-encode to WebP: strips metadata (sharp doesn't preserve EXIF unless
  // .withMetadata() is called), optimizes for storefront delivery, and
  // normalizes output so downstream code only ever handles one format.
  // Note: for animated GIFs this keeps only the first frame.
  const outputBuffer = await sharp(buffer, { limitInputPixels: MAX_IMAGE_PIXELS })
    .webp({ quality: 82 })
    .toBuffer();
  const outputMetadata = await sharp(outputBuffer).metadata();

  return {
    buffer: outputBuffer,
    width: outputMetadata.width ?? width,
    height: outputMetadata.height ?? height,
    format: 'webp',
    sizeBytes: outputBuffer.byteLength,
  };
}
