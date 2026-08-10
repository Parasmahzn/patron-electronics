import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { AdminUserMenu } from '@/components/admin/AdminUserMenu';

export function AdminTopbar({
  adminName,
  avatarUrl,
}: {
  adminName: string;
  avatarUrl: string | null;
}) {
  return (
    <header className="border-border flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6">
      <p className="text-muted text-sm">
        Welcome back, <span className="text-midnight font-medium">{adminName}</span>
      </p>
      <div className="flex items-center gap-2">
        <Link
          href="/"
          target="_blank"
          className="text-midnight hover:bg-surface flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium"
        >
          <ExternalLink aria-hidden="true" className="h-4 w-4" />
          <span className="hidden sm:inline">View Storefront</span>
        </Link>
        <AdminUserMenu name={adminName} avatarUrl={avatarUrl} />
      </div>
    </header>
  );
}
