import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getReviewByIdForAdmin } from '@/lib/reviews/review.service';
import { updateReviewAction } from '@/app/actions/reviews';
import { ReviewForm } from '@/components/admin/ReviewForm';

export const metadata: Metadata = { title: 'Edit Review', robots: { index: false, follow: false } };

export default async function EditReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reviewId = Number(id);
  if (Number.isNaN(reviewId)) notFound();

  const review = await getReviewByIdForAdmin(reviewId);
  if (!review) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/reviews"
          className="text-muted hover:text-midnight inline-flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Reviews
        </Link>
        <h1 className="font-heading text-midnight mt-2 text-2xl font-bold">Edit Review</h1>
        <p className="text-muted mt-1 text-sm">{review.authorName}</p>
      </div>

      <ReviewForm
        action={updateReviewAction}
        submitLabel="Save Changes"
        initialValues={{
          id: review.id,
          authorName: review.authorName,
          rating: review.rating,
          comment: review.comment,
          isVisible: review.isVisible,
        }}
      />
    </div>
  );
}
