'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type GalleryImage = { url: string; alt: string };

export function ProductGallery({
  images,
  productName,
}: {
  images: GalleryImage[];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];
  const canNavigate = images.length > 1;

  function goTo(next: number) {
    setActiveIndex((next + images.length) % images.length);
  }

  return (
    <div
      className="flex flex-col gap-3"
      onKeyDown={(event) => {
        if (!canNavigate) return;
        if (event.key === 'ArrowLeft') goTo(activeIndex - 1);
        if (event.key === 'ArrowRight') goTo(activeIndex + 1);
      }}
    >
      <div className="border-border bg-surface relative aspect-square overflow-hidden rounded-lg border">
        {active ? (
          <Image
            src={active.url}
            alt={active.alt}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageOff aria-hidden="true" className="text-muted h-12 w-12" />
            <span className="sr-only">No image available for {productName}</span>
          </div>
        )}

        {canNavigate && (
          <>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              aria-label="Show previous image"
              className="bg-midnight/60 hover:bg-midnight/80 absolute top-1/2 left-2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-white transition-colors"
            >
              <ChevronLeft aria-hidden="true" className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              aria-label="Show next image"
              className="bg-midnight/60 hover:bg-midnight/80 absolute top-1/2 right-2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-white transition-colors"
            >
              <ChevronRight aria-hidden="true" className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {canNavigate && (
        <div className="flex gap-3">
          {images.map((image, index) => (
            <button
              key={image.url + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1} of ${productName}`}
              aria-current={index === activeIndex}
              className={cn(
                'bg-surface relative h-16 w-16 shrink-0 overflow-hidden rounded-md border',
                index === activeIndex ? 'border-primary' : 'border-border hover:border-muted',
              )}
            >
              <Image src={image.url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
