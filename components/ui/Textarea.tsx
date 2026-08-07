import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, id, className, ...props }, ref) => {
    const textareaId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-midnight text-sm font-medium">
            {label}
            {props.required && <span className="text-red-600"> *</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'border-border text-midnight placeholder:text-muted min-h-28 rounded-md border bg-white px-3.5 py-2.5 text-sm',
            'focus:border-primary focus:outline-primary/30 focus:outline-2 focus:outline-offset-1',
            error && 'border-red-500',
            className,
          )}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
          {...props}
        />
        {hint && !error && (
          <p id={`${textareaId}-hint`} className="text-muted text-xs">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${textareaId}-error`} role="alert" className="text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
