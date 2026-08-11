import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getBannerById } from '@/lib/banners/banner.service';
import { updateBannerAction } from '@/app/actions/banners';
import { BannerForm } from '@/components/admin/BannerForm';

export const metadata: Metadata = {
  title: 'Edit Banner',
  robots: { index: false, follow: false },
};

export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bannerId = Number(id);
  if (Number.isNaN(bannerId)) notFound();

  const banner = await getBannerById(bannerId);
  if (!banner) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/banners"
          className="text-muted hover:text-midnight inline-flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Banners
        </Link>
        <h1 className="font-heading text-midnight mt-2 text-2xl font-bold">Edit Banner</h1>
        <p className="text-muted mt-1 text-sm">{banner.title}</p>
      </div>

      <BannerForm
        action={updateBannerAction}
        submitLabel="Save Changes"
        initialValues={{
          id: banner.id,
          title: banner.title,
          image: banner.image,
          linkUrl: banner.linkUrl ?? '',
          displayOrder: banner.displayOrder,
          isActive: banner.isActive,
        }}
      />
    </div>
  );
}
