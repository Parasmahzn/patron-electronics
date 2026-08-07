import type { Metadata } from 'next';
import { Star, Plus, Pencil, Trash2 } from 'lucide-react';
import { listReviewsForAdmin } from '@/lib/reviews/review.service';
import { setReviewVisibilityAction, deleteReviewAction } from '@/app/actions/reviews';
import { Card } from '@/components/admin/Card';
import { LinkButton } from '@/components/admin/LinkButton';
import { ConfirmSubmitButton } from '@/components/admin/ConfirmSubmitButton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/ui/StarRating';
import { EmptyState } from '@/components/ui/EmptyState';

export const metadata: Metadata = { title: 'Reviews', robots: { index: false, follow: false } };

export default async function AdminReviewsPage() {
  const reviews = await listReviewsForAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-midnight text-2xl font-bold">Reviews</h1>
          <p className="text-muted mt-1 text-sm">
            {reviews.length.toLocaleString()} review{reviews.length === 1 ? '' : 's'} total
          </p>
        </div>
        <LinkButton href="/admin/reviews/new">
          <Plus className="h-4 w-4" /> Add Review
        </LinkButton>
      </div>

      <Card className="p-0">
        {reviews.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Star}
              title="No reviews yet"
              description="Add a review on behalf of a customer to get started."
              action={
                <LinkButton href="/admin/reviews/new" size="sm">
                  Add a Review
                </LinkButton>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-border bg-surface text-muted border-b text-left text-xs font-semibold tracking-wide uppercase">
                <tr>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Comment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {reviews.map((review) => {
                  // Inline closures (not `.bind()`) — see note in
                  // products/[id]/edit/page.tsx.
                  async function toggleVisible() {
                    'use server';
                    await setReviewVisibilityAction(review.id, !review.isVisible);
                  }
                  async function deleteThisReview() {
                    'use server';
                    await deleteReviewAction(review.id);
                  }

                  return (
                    <tr key={review.id}>
                      <td className="text-midnight px-4 py-3 font-medium whitespace-nowrap">
                        {review.authorName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StarRating rating={review.rating} size={14} />
                      </td>
                      <td className="text-muted max-w-xs truncate px-4 py-3" title={review.comment}>
                        {review.comment}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={review.isVisible ? 'success' : 'neutral'}>
                          {review.isVisible ? 'Visible' : 'Hidden'}
                        </Badge>
                      </td>
                      <td className="text-muted px-4 py-3 whitespace-nowrap">
                        {review.createdAt.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <LinkButton
                            href={`/admin/reviews/${review.id}/edit`}
                            variant="outline"
                            size="sm"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="sr-only">Edit</span>
                          </LinkButton>
                          <form action={toggleVisible}>
                            <Button type="submit" variant="outline" size="sm">
                              {review.isVisible ? 'Hide' : 'Show'}
                            </Button>
                          </form>
                          <ConfirmSubmitButton
                            action={deleteThisReview}
                            confirmMessage={`Delete this review by "${review.authorName}"? This cannot be undone.`}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="sr-only">Delete</span>
                          </ConfirmSubmitButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
