import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

function getPageList(current: number, total: number): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = [];
  const window = 1;
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - current) <= window) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== 'ellipsis') {
      pages.push('ellipsis');
    }
  }
  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  buildHref,
}: {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages = getPageList(currentPage, totalPages);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      <Link
        href={buildHref(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        className={cn(
          'border-border text-midnight hover:bg-surface flex h-9 w-9 items-center justify-center rounded-md border',
          currentPage === 1 && 'pointer-events-none opacity-40',
        )}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Link>

      {pages.map((p, index) =>
        p === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="text-muted px-2">
            &hellip;
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            aria-current={p === currentPage ? 'page' : undefined}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium',
              p === currentPage
                ? 'bg-primary text-white'
                : 'border-border text-midnight hover:bg-surface border',
            )}
          >
            {p}
          </Link>
        ),
      )}

      <Link
        href={buildHref(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        className={cn(
          'border-border text-midnight hover:bg-surface flex h-9 w-9 items-center justify-center rounded-md border',
          currentPage === totalPages && 'pointer-events-none opacity-40',
        )}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Link>
    </nav>
  );
}
