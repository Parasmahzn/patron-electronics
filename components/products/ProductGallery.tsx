'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';
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

  return (
    <div className="flex flex-col gap-3">
      <div className="border-border bg-surface relative aspect-square overflow-hidden rounded-lg border">
        {active ? (
          <Image
            src={active.url}
            alt={active.alt}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageOff aria-hidden="true" className="text-muted h-12 w-12" />
            <span className="sr-only">No image available for {productName}</span>
          </div>
        )}
      </div>

      {images.length > 1 && (
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
