import { Star } from 'lucide-react';

export function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.round(rating);
        return (
          <Star
            key={i}
            width={size}
            height={size}
            aria-hidden="true"
            className={filled ? 'fill-amber text-amber' : 'text-border fill-transparent'}
          />
        );
      })}
    </div>
  );
}
