'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export type AdminFilterSelect = {
  name: string;
  ariaLabel: string;
  allLabel: string;
  defaultValue: string;
  options: { value: string; label: string }[];
};

const SEARCH_DEBOUNCE_MS = 400;

/**
 * Search + dropdown filters for admin list pages that apply immediately —
 * no "Filter" button. Every change updates the URL (never client-only
 * state) so results stay shareable/bookmarkable, per the spec's query-param
 * requirement; this just removes the extra click that used to be required
 * to actually apply it.
 */
export function AdminFilterBar({
  // `usePathname()` already gives the exact page this is rendered on — this
  // component is only ever mounted on the list page it filters, never used
  // to build a link to somewhere else.
  searchName = 'q',
  searchPlaceholder,
  searchAriaLabel,
  searchDefaultValue,
  selects,
}: {
  searchName?: string;
  searchPlaceholder: string;
  searchAriaLabel: string;
  searchDefaultValue?: string;
  selects: AdminFilterSelect[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get(searchName) ?? '';
  const [query, setQuery] = useState(searchDefaultValue ?? '');

  // Resync if the URL's `q` changes from something other than our own
  // debounce (browser back/forward, a link elsewhere) without fighting the
  // admin's active typing. Adjusting state during render (React's own
  // recommended pattern for this — see "Adjusting state when a prop
  // changes" in the React docs) rather than in an effect, so there's no
  // extra render pass or risk of racing the debounce effect below.
  const [lastUrlQuery, setLastUrlQuery] = useState(urlQuery);
  if (urlQuery !== lastUrlQuery) {
    setLastUrlQuery(urlQuery);
    setQuery(urlQuery);
  }

  const buildHref = useCallback(
    (mutate: (params: URLSearchParams) => void): string => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      params.delete('page');
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, searchParams],
  );

  const commitSearch = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      router.replace(
        buildHref((params) => {
          if (trimmed) params.set(searchName, trimmed);
          else params.delete(searchName);
        }),
      );
    },
    [buildHref, router, searchName],
  );

  // Debounced auto-apply as the admin types.
  useEffect(() => {
    if (query === urlQuery) return;
    const timeout = setTimeout(() => commitSearch(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [query, urlQuery, commitSearch]);

  function handleSelectChange(name: string, value: string) {
    router.push(
      buildHref((params) => {
        if (value) params.set(name, value);
        else params.delete(name);
      }),
    );
  }

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        commitSearch(query);
      }}
    >
      <div className="min-w-48 flex-1">
        <Input
          name={searchName}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchAriaLabel}
        />
      </div>
      {selects.map((select) => (
        <div key={select.name} className="w-full sm:w-56">
          <Select
            aria-label={select.ariaLabel}
            defaultValue={select.defaultValue}
            onChange={(event) => handleSelectChange(select.name, event.target.value)}
          >
            <option value="">{select.allLabel}</option>
            {select.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      ))}
    </form>
  );
}
