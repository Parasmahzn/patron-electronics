'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type Banner = {
  id: number;
  title: string;
  image: string;
  linkUrl: string | null;
};

const AUTOPLAY_MS = 5000;

/**
 * Pure image carousel — no text overlay. Embedded as the wider, leading
 * column of HeroSection's grid (this slider first, static heading/CTAs
 * second), so there's nothing here that needs to stay legible over an image
 * and no scrim is needed, and it owns no outer section/container spacing of
 * its own — the parent grid cell positions it. Images use object-contain
 * (not object-cover) so admin-uploaded banners of any aspect ratio are never
 * cropped — the slide box's bg-white/5 fill shows through as letterboxing
 * when an image doesn't fill the box exactly. Each slide is a whole-slide
 * Link when it has a linkUrl (plain anchor, so the browser's own pointer
 * cursor on hover is all that's needed) or an unlinked div otherwise
 * (default cursor, not clickable). The slide box is a fixed 2:1 aspect
 * ratio (BannerForm's image field documents this as the recommended
 * upload ratio) so a correctly-shaped banner fills the slot exactly with
 * no letterboxing; only a banner uploaded at a different ratio would still
 * show letterbox bars, since there's no way to fill the box exactly
 * without cropping unless the image's own ratio matches it.
 */
export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const canNavigate = banners.length > 1;

  function goTo(next: number) {
    setIndex((next + banners.length) % banners.length);
  }

  // Autoplay is skipped entirely (not just slowed) when the visitor has
  // requested reduced motion — continuous movement is the disorienting
  // part, not the transition style.
  useEffect(() => {
    if (!canNavigate || isPaused || reduceMotion) return;
    const timer = setInterval(
      () => setIndex((current) => (current + 1) % banners.length),
      AUTOPLAY_MS,
    );
    return () => clearInterval(timer);
  }, [canNavigate, isPaused, reduceMotion, banners.length]);

  const active = banners[index];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={(event) => {
        if (!canNavigate) return;
        if (event.key === 'ArrowLeft') goTo(index - 1);
        if (event.key === 'ArrowRight') goTo(index + 1);
      }}
    >
      <div className="relative aspect-[2/1] overflow-hidden rounded-xl border border-white/10 bg-white/5">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.5, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            {active.linkUrl ? (
              <Link href={active.linkUrl} className="absolute inset-0" aria-label={active.title}>
                <Image
                  src={active.image}
                  alt={active.title}
                  fill
                  priority
                  className="object-contain"
                />
              </Link>
            ) : (
              <div className="absolute inset-0">
                <Image
                  src={active.image}
                  alt={active.title}
                  fill
                  priority
                  className="object-contain"
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {canNavigate && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Previous slide"
              className="text-midnight absolute top-1/2 left-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
            >
              <ChevronLeft aria-hidden="true" className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Next slide"
              className="text-midnight absolute top-1/2 right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
            >
              <ChevronRight aria-hidden="true" className="h-5 w-5" />
            </button>

            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
              {banners.map((banner, dotIndex) => (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => goTo(dotIndex)}
                  aria-label={`Go to slide ${dotIndex + 1}`}
                  aria-current={dotIndex === index}
                  className={`h-2 rounded-full transition-all ${
                    dotIndex === index ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
