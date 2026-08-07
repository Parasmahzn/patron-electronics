import Link from 'next/link';
import { LogOut, ExternalLink } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';

export function AdminTopbar({ adminName }: { adminName: string }) {
  return (
    <header className="border-border flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6">
      <p className="text-muted text-sm">
        Signed in as <span className="text-midnight font-medium">{adminName}</span>
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
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-midnight hover:bg-surface flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium"
          >
            <LogOut aria-hidden="true" className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </form>
      </div>
    </header>
  );
}
