import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

// Deterministic per-name palette instead of a real photo: no upload/storage
// dependency, zero network weight, and a stable color per reviewer between
// renders since it is derived from the name itself rather than random.
const PALETTE = [
  'bg-primary text-white',
  'bg-accent text-white',
  'bg-amber text-midnight',
  'bg-emerald-600 text-white',
  'bg-midnight text-white',
  'bg-indigo-600 text-white',
] as const;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

function paletteIndexForName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash % PALETTE.length;
}

export function Avatar({
  name,
  src,
  size = 40,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className={cn('shrink-0 rounded-full object-cover', className)}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      className={cn(
        'font-heading inline-flex shrink-0 items-center justify-center rounded-full font-bold',
        PALETTE[paletteIndexForName(name)],
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}
