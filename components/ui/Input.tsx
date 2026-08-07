import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-midnight text-sm font-medium">
            {label}
            {props.required && <span className="text-red-600"> *</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'border-border text-midnight placeholder:text-muted h-11 rounded-md border bg-white px-3.5 text-sm',
            'focus:border-primary focus:outline-primary/30 focus:outline-2 focus:outline-offset-1',
            'disabled:bg-surface disabled:text-muted disabled:cursor-not-allowed',
            error && 'border-red-500',
            className,
          )}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-muted text-xs">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
