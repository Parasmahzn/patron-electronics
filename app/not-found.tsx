import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-heading text-primary text-6xl font-bold">404</p>
      <h1 className="font-heading text-midnight text-2xl font-bold">Page not found</h1>
      <p className="text-muted max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link
        href="/"
        className="bg-primary hover:bg-primary-dark inline-flex h-11 items-center justify-center rounded-md px-5 text-sm font-medium text-white transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
