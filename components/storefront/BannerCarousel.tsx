'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'framer-motion';

export type Banner = {
  id: number;
  title: string;
  image: string;
  linkUrl: string | null;
};

const AUTOPLAY_MS = 5000;
// A swipe only counts as intentional navigation past one of these — a light
// tap or an accidental nudge shouldn't change the slide.
const SWIPE_DISTANCE_THRESHOLD = 60;
const SWIPE_VELOCITY_THRESHOLD = 400;

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
 *
 * Navigation is drag/swipe-only, no arrow buttons — Framer Motion's `drag`
 * tracks the pointer in real time on touch *and* mouse/trackpad, so there's
 * no device that actually needs a click target, and a pair of circular
 * buttons sitting on top of the image was itself covering the content this
 * carousel exists to show. The dot indicators are the one visible control
 * that remains: they're the swipe gesture's required visible alternative
 * (jump straight to any slide without swiping N times) and double as the
 * "which slide am I on" affordance. Arrow-key navigation still works via
 * onKeyDown for keyboard-only users, who have neither a pointer to drag nor
 * a touch surface to swipe.
 */
export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const canNavigate = banners.length > 1;
  // A drag that ends past the swipe threshold shouldn't also fire the
  // slide's own <Link> navigation — this flag suppresses exactly that one
  // resulting click, then resets.
  const suppressNextClick = useRef(false);

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

  function handleDragEnd(_event: unknown, info: PanInfo) {
    setIsPaused(false);
    if (!canNavigate) return;
    const { offset, velocity } = info;
    const isDecisiveSwipe =
      Math.abs(offset.x) > SWIPE_DISTANCE_THRESHOLD ||
      Math.abs(velocity.x) > SWIPE_VELOCITY_THRESHOLD;
    if (isDecisiveSwipe) {
      suppressNextClick.current = true;
      goTo(offset.x < 0 ? index + 1 : index - 1);
    }
  }

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
            drag={canNavigate ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragStart={() => setIsPaused(true)}
            onDragEnd={handleDragEnd}
          >
            {active.linkUrl ? (
              <Link
                href={active.linkUrl}
                className="absolute inset-0"
                aria-label={active.title}
                draggable={false}
                onClick={(event) => {
                  if (suppressNextClick.current) {
                    event.preventDefault();
                    suppressNextClick.current = false;
                  }
                }}
              >
                <Image
                  src={active.image}
                  alt={active.title}
                  fill
                  priority
                  draggable={false}
                  className="pointer-events-none object-contain"
                />
              </Link>
            ) : (
              <div className="absolute inset-0">
                <Image
                  src={active.image}
                  alt={active.title}
                  fill
                  priority
                  draggable={false}
                  className="pointer-events-none object-contain"
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {canNavigate && (
          <div className="absolute inset-x-0 bottom-2 flex justify-center">
            {banners.map((banner, dotIndex) => (
              // The visible dot stays small (h-2); the button's own padding
              // extends its actual tap target close to the 44px minimum
              // without the indicator itself looking oversized.
              <button
                key={banner.id}
                type="button"
                onClick={() => goTo(dotIndex)}
                aria-label={`Go to slide ${dotIndex + 1}`}
                aria-current={dotIndex === index}
                className="flex h-9 w-9 items-center justify-center"
              >
                <span
                  className={`h-2 rounded-full transition-all ${
                    dotIndex === index ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
