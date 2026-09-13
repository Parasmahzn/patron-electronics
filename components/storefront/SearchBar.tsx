'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format-currency';
import { cn } from '@/lib/utils/cn';

type Suggestion = {
  id: number;
  slug: string;
  name: string;
  price: number;
  discountPrice: number | null;
  inStock: boolean;
  image: { url: string; alt: string } | null;
};

const DEBOUNCE_MS = 300;

export function SearchBar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setSuggestions(data.suggestions ?? []);
      } catch {
        // Aborted or network error — leave suggestions as-is.
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function goToResults() {
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsOpen(false);
    onNavigate?.();
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          goToResults();
        }}
      >
        <label htmlFor="storefront-search" className="sr-only">
          Search mobiles, laptops, accessories
        </label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="text-muted pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
          />
          <input
            id="storefront-search"
            type="search"
            value={query}
            onChange={(e) => {
              const value = e.target.value;
              setQuery(value);
              setIsOpen(true);
              if (value.trim().length < 2) {
                setSuggestions([]);
                setIsLoading(false);
              }
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search mobiles, laptops, accessories..."
            autoComplete="off"
            className="border-border text-midnight placeholder:text-muted focus:border-primary focus:outline-primary/30 h-11 w-full rounded-md border bg-white pr-9 pl-9 text-sm focus:outline-2 focus:outline-offset-1"
          />
          {isLoading && (
            <Loader2
              aria-hidden="true"
              className="text-muted absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin"
            />
          )}
        </div>
      </form>

      {isOpen && query.trim().length >= 2 && (
        // The results panel deliberately isn't tied to the trigger input's
        // own width — the header's search input is compact (see Navbar), but
        // a suggestion row (image + name + price + stock) needs real room
        // regardless of how narrow the field that opened it is. Anchored to
        // the right edge so it grows toward the header's center instead of
        // off the right side of the viewport.
        <div className="border-border absolute right-0 z-40 mt-2 w-full overflow-hidden rounded-lg border bg-white shadow-lg sm:w-96">
          {suggestions.length === 0 && !isLoading ? (
            <p className="text-muted px-4 py-6 text-center text-sm">
              No products found for &ldquo;{query}&rdquo;
            </p>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {suggestions.map((product) => (
                <li key={product.id} className="border-border border-b last:border-none">
                  <Link
                    href={`/products/${product.slug}`}
                    onClick={() => {
                      setIsOpen(false);
                      onNavigate?.();
                    }}
                    className="hover:bg-surface flex items-center gap-3 px-4 py-3"
                  >
                    <div className="bg-surface relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
                      {product.image && (
                        <Image
                          src={product.image.url}
                          alt={product.image.alt}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-midnight truncate text-sm font-medium">{product.name}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-primary font-semibold">
                          {formatCurrency(product.discountPrice ?? product.price)}
                        </span>
                        {product.discountPrice && (
                          <span className="text-muted text-xs line-through">
                            {formatCurrency(product.price)}
                          </span>
                        )}
                        <span
                          className={cn(
                            'text-xs',
                            product.inStock ? 'text-emerald-600' : 'text-red-600',
                          )}
                        >
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={goToResults}
            className="bg-surface text-primary hover:bg-border/40 block w-full px-4 py-3 text-center text-sm font-medium"
          >
            View all results &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
