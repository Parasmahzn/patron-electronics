'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Long enough to read the message, short enough that a mistyped/old URL
// doesn't leave a visitor stranded on a dead end waiting for them to notice
// the "Back to Home" link themselves.
const REDIRECT_DELAY_MS = 3000;

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.replace('/'), REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-heading text-primary text-6xl font-bold">404</p>
      <h1 className="font-heading text-midnight text-2xl font-bold">Page not found</h1>
      <p className="text-muted max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved. Redirecting you
        to the homepage&hellip;
      </p>
      <Link
        href="/"
        className="bg-primary hover:bg-primary-dark inline-flex h-11 items-center justify-center rounded-md px-5 text-sm font-medium text-white transition-colors"
      >
        Back to Home now
      </Link>
    </div>
  );
}
