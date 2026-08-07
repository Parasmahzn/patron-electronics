import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export function Card({
  title,
  action,
  className,
  children,
}: {
  title?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('border-border rounded-xl border bg-white p-5', className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && <h2 className="font-heading text-midnight text-base font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
