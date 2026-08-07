import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { getAdminSession, requireAdmin } from '@/lib/auth/session';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';

export default async function AdminProtectedLayout({ children }: { children: ReactNode }) {
  // Server Actions re-render the current route's layout tree to produce
  // their response. Redirecting from here in that context intercepts the
  // action before it ever runs — the action's own `requireAdmin()` call
  // (inside the service function it delegates to) is the real gate for
  // mutations, so this layout only needs to *read* the session, not redirect,
  // when handling an action request. Normal page navigation (GET) still
  // gets the full authoritative redirect-on-missing-session check.
  const isServerActionRequest = (await headers()).has('next-action');
  const admin = isServerActionRequest ? await getAdminSession() : await requireAdmin();

  return (
    <div className="bg-surface flex min-h-screen">
      <aside className="bg-midnight hidden w-64 shrink-0 lg:flex lg:flex-col">
        <div className="flex h-16 items-center px-5">
          <span className="font-heading text-base font-bold text-white">Patron Admin</span>
        </div>
        <AdminSidebar />
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <AdminTopbar adminName={admin?.name ?? 'Admin'} />
        <div className="border-border bg-midnight border-b lg:hidden">
          <AdminSidebar variant="horizontal" />
        </div>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
