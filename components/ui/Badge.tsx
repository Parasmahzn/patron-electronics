import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type BadgeTone = 'primary' | 'accent' | 'amber' | 'success' | 'danger' | 'neutral';

// Soft-tone pills (tinted background + matching text/icon) instead of solid
// fills: keeps status colors distinguishable at a glance without the higher
// visual weight of a solid badge repeated down a table of rows.
const toneClasses: Record<BadgeTone, string> = {
  primary: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20',
  accent: 'bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-600/20',
  amber: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/20',
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
  danger: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
  neutral: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20',
};

export function Badge({
  tone = 'neutral',
  icon: Icon,
  className,
  children,
}: {
  tone?: BadgeTone;
  icon?: LucideIcon;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase',
        toneClasses[tone],
        className,
      )}
    >
      {Icon && <Icon aria-hidden="true" className="h-3 w-3 shrink-0" />}
      {children}
    </span>
  );
}
