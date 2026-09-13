'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, Smartphone } from 'lucide-react';

type Category = {
  id: number;
  slug: string;
  name: string;
  image: string | null;
};

const SCROLL_EDGE_TOLERANCE_PX = 4;

/**
 * Horizontally-scrollable "Shop by Category" row. Native drag/touch scroll
 * works everywhere on its own; the chevron buttons are an explicit
 * affordance for mouse users and are hidden on mobile, where swipe is the
 * natural interaction.
 */
export function CategoryScroller({ categories }: { categories: Category[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateScrollState() {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > SCROLL_EDGE_TOLERANCE_PX);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - SCROLL_EDGE_TOLERANCE_PX);
  }

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [categories.length]);

  function scrollByPage(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
  }

  return (
    <section className="container py-5 sm:py-12">
      <div className="mb-4 flex items-end justify-between gap-3 sm:mb-6">
        <h2 className="font-heading text-midnight text-xl font-bold sm:text-2xl">
          Shop by Category
        </h2>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 sm:flex">
            <button
              type="button"
              onClick={() => scrollByPage(-1)}
              disabled={!canScrollLeft}
              aria-label="Scroll categories left"
              className="border-border text-midnight hover:bg-surface flex h-9 w-9 items-center justify-center rounded-full border bg-white disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollByPage(1)}
              disabled={!canScrollRight}
              aria-label="Scroll categories right"
              className="border-border text-midnight hover:bg-surface flex h-9 w-9 items-center justify-center rounded-full border bg-white disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
          <Link
            href="/categories"
            className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
          >
            View all
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div
        ref={scrollerRef}
        onScroll={updateScrollState}
        className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth pb-1"
      >
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group border-border flex w-28 shrink-0 flex-col items-center gap-2 rounded-lg border bg-white p-3 text-center transition-shadow hover:shadow-md sm:w-32 sm:gap-3 sm:p-4"
          >
            <div className="bg-surface relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full sm:h-16 sm:w-16">
              {category.image ? (
                <Image src={category.image} alt="" fill className="object-cover" />
              ) : (
                <Smartphone aria-hidden="true" className="text-primary h-6 w-6 sm:h-7 sm:w-7" />
              )}
            </div>
            <span className="text-midnight group-hover:text-primary text-sm font-medium">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
