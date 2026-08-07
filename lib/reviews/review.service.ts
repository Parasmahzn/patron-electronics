import 'server-only';
import { prisma } from '@/lib/db/client';
import { requireAdmin } from '@/lib/auth/session';
import { reviewSchema, type ReviewInput } from '@/lib/validations/review';

export async function getVisibleReviews(limit = 6) {
  return prisma.review.findMany({
    where: { isVisible: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/** Real, computed from the Review table — never a hardcoded statistic. */
export async function getReviewStats() {
  const result = await prisma.review.aggregate({
    where: { isVisible: true },
    _avg: { rating: true },
    _count: true,
  });

  return {
    averageRating: result._avg.rating ? Math.round(result._avg.rating * 10) / 10 : 0,
    reviewCount: result._count,
  };
}

export async function listReviewsForAdmin() {
  await requireAdmin();
  return prisma.review.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function getReviewByIdForAdmin(id: number) {
  await requireAdmin();
  return prisma.review.findUnique({ where: { id } });
}

export async function createReview(input: ReviewInput) {
  await requireAdmin();
  const data = reviewSchema.parse(input);
  return prisma.review.create({ data });
}

export async function updateReview(id: number, input: ReviewInput) {
  await requireAdmin();
  const data = reviewSchema.parse(input);
  return prisma.review.update({ where: { id }, data });
}

export async function setReviewVisibility(id: number, isVisible: boolean) {
  await requireAdmin();
  return prisma.review.update({ where: { id }, data: { isVisible } });
}

export async function deleteReview(id: number) {
  await requireAdmin();
  return prisma.review.delete({ where: { id } });
}
