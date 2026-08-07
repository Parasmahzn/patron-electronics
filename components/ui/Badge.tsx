import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export type BadgeTone = 'primary' | 'accent' | 'amber' | 'success' | 'danger' | 'neutral';

const toneClasses: Record<BadgeTone, string> = {
  primary: 'bg-primary text-white',
  accent: 'bg-accent text-white',
  amber: 'bg-amber text-midnight',
  success: 'bg-emerald-600 text-white',
  danger: 'bg-red-600 text-white',
  neutral: 'border border-border bg-surface text-midnight',
};

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
