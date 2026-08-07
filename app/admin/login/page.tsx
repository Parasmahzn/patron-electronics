import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth/session';
import { LoginForm } from '@/components/admin/LoginForm';
import { SITE_NAME } from '@/config/site';

export const metadata: Metadata = {
  title: 'Admin Login',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const admin = await getAdminSession();
  if (admin) {
    redirect('/admin/dashboard');
  }

  return (
    <div className="bg-surface flex min-h-screen items-center justify-center px-4">
      <div className="border-border w-full max-w-sm rounded-xl border bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="font-heading text-midnight text-lg font-bold">{SITE_NAME}</p>
          <h1 className="text-muted mt-1 text-sm">Admin Portal Sign In</h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
