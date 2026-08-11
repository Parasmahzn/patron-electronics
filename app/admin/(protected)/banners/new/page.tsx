import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createBannerAction } from '@/app/actions/banners';
import { BannerForm } from '@/components/admin/BannerForm';

export const metadata: Metadata = {
  title: 'New Banner',
  robots: { index: false, follow: false },
};

export default function NewBannerPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/banners"
          className="text-muted hover:text-midnight inline-flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Banners
        </Link>
        <h1 className="font-heading text-midnight mt-2 text-2xl font-bold">New Banner</h1>
      </div>

      <BannerForm action={createBannerAction} submitLabel="Create Banner" />
    </div>
  );
}
