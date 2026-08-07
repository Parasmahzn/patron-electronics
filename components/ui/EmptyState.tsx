import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="border-border bg-surface flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
      <Icon aria-hidden="true" className="text-muted h-10 w-10" />
      <h3 className="font-heading text-midnight text-lg font-semibold">{title}</h3>
      {description && <p className="text-muted max-w-sm text-sm">{description}</p>}
      {action}
    </div>
  );
}
