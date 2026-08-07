import { AlertCircle } from 'lucide-react';

/**
 * Surfaces a service-layer error message (e.g. "cannot delete — referenced
 * by past orders") after a redirect back to a list page. Renders nothing
 * when there is no message so callers can pass an optional value directly.
 */
export function ErrorBanner({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
