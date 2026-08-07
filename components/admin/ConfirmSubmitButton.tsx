'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

/**
 * Wraps a bound Server Action in a form that asks for native confirmation
 * before submitting — the lightweight "confirm step" the spec calls for on
 * destructive actions (delete, cancel order) without pulling in a modal
 * library.
 */
export function ConfirmSubmitButton({
  action,
  confirmMessage,
  children,
  variant = 'outline',
  size = 'sm',
  className,
  disabled,
  title,
}: {
  action: () => Promise<void>;
  confirmMessage: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <Button
        type="submit"
        variant={variant}
        size={size}
        className={className}
        disabled={disabled}
        title={title}
      >
        {children}
      </Button>
    </form>
  );
}
