'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

/**
 * Wraps the native <dialog> element rather than a hand-rolled overlay:
 * showModal() gives focus-trapping, Escape-to-close, and ::backdrop
 * dismissal for free. Mounting this component *is* the open signal — the
 * caller controls visibility by conditionally rendering it, not via an
 * `open` prop, so closing always unmounts (and resets) it.
 */
export function Dialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current?.close();
      }}
      className={[
        'border-border m-auto w-full max-w-md rounded-xl border bg-white p-0 shadow-xl',
        'scale-95 opacity-0 transition-[opacity,transform] duration-200 motion-reduce:transition-none',
        'open:scale-100 open:opacity-100',
        'backdrop:bg-midnight/40',
      ].join(' ')}
    >
      <div onClick={(event) => event.stopPropagation()} className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-midnight text-lg font-bold">{title}</h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close"
            className="text-muted hover:bg-surface hover:text-midnight rounded-md p-1.5"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
