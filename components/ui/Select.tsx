import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, className, children, ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-midnight text-sm font-medium">
            {label}
            {props.required && <span className="text-red-600"> *</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'border-border text-midnight h-11 w-full appearance-none rounded-md border bg-white px-3.5 pr-9 text-sm',
              'focus:border-primary focus:outline-primary/30 focus:outline-2 focus:outline-offset-1',
              error && 'border-red-500',
              className,
            )}
            aria-invalid={!!error || undefined}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="text-muted pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2"
          />
        </div>
        {error && (
          <p role="alert" className="text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';
