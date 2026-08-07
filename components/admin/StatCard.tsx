import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'default',
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: 'default' | 'warning';
}) {
  return (
    <div className="border-border rounded-xl border bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-muted text-sm">{label}</p>
        <Icon
          aria-hidden="true"
          className={cn('h-5 w-5', tone === 'warning' ? 'text-amber' : 'text-primary')}
        />
      </div>
      <p className="font-heading text-midnight mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
