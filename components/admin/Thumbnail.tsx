import Image from 'next/image';
import { ImageOff } from 'lucide-react';

/**
 * Admin image fields accept either a managed upload (a local `/images/...`
 * path produced by the upload pipeline) or a manually-entered external URL,
 * kept for backward compatibility with pre-upload/legacy entries. `next/image`
 * only optimizes local paths and hosts allowlisted in next.config.ts's
 * remotePatterns, so external URLs fall back to a plain <img>.
 */
export function Thumbnail({
  src,
  alt,
  size = 48,
}: {
  src?: string | null;
  alt: string;
  size?: number;
}) {
  if (!src) {
    return (
      <div
        style={{ width: size, height: size }}
        className="border-border bg-surface flex items-center justify-center rounded-md border"
      >
        <ImageOff aria-hidden="true" className="text-muted h-4 w-4" />
      </div>
    );
  }

  if (src.startsWith('/')) {
    return (
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="border-border rounded-md border object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- arbitrary external URL not covered by next/image remotePatterns
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="border-border rounded-md border object-cover"
      style={{ width: size, height: size }}
    />
  );
}
