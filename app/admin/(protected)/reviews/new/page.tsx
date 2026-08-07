import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createReviewAction } from '@/app/actions/reviews';
import { ReviewForm } from '@/components/admin/ReviewForm';

export const metadata: Metadata = { title: 'Add Review', robots: { index: false, follow: false } };

export default function NewReviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/reviews"
          className="text-muted hover:text-midnight inline-flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Reviews
        </Link>
        <h1 className="font-heading text-midnight mt-2 text-2xl font-bold">Add Review</h1>
        <p className="text-muted mt-1 text-sm">Add a review on behalf of a customer.</p>
      </div>

      <ReviewForm action={createReviewAction} submitLabel="Add Review" />
    </div>
  );
}
