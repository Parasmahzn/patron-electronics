'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server-side/console logging only — never render internals to the user.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-heading text-midnight text-2xl font-bold">Something went wrong</h1>
      <p className="text-muted max-w-md">
        We hit an unexpected error on our end. Please try again, and contact us if the problem
        continues.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="bg-primary hover:bg-primary-dark inline-flex h-11 items-center justify-center rounded-md px-5 text-sm font-medium text-white transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="border-border text-midnight hover:bg-surface inline-flex h-11 items-center justify-center rounded-md border px-5 text-sm font-medium transition-colors"
        >
          Go to homepage
        </Link>
      </div>
    </div>
  );
}
