'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Select } from '@/components/ui/Select';
import { SORT_OPTIONS } from '@/config/site';

/** Updates the `sort` query param and resets pagination, preserving every other filter. */
export function SortSelect() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'relevance') {
      params.set('sort', value);
    } else {
      params.delete('sort');
    }
    params.delete('page');
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="w-full sm:w-56">
      <Select
        aria-label="Sort products"
        value={searchParams.get('sort') ?? 'relevance'}
        onChange={(event) => handleChange(event.target.value)}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
