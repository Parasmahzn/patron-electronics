'use client';

import { Minus, Plus } from 'lucide-react';

type Props = {
  quantity: number;
  max: number;
  onChange: (quantity: number) => void;
};

export function QuantitySelector({ quantity, max, onChange }: Props) {
  return (
    <div className="border-border inline-flex items-center rounded-md border">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, quantity - 1))}
        disabled={quantity <= 1}
        aria-label="Decrease quantity"
        className="text-midnight hover:bg-surface flex h-11 w-11 items-center justify-center disabled:pointer-events-none disabled:opacity-40"
      >
        <Minus aria-hidden="true" className="h-4 w-4" />
      </button>
      <span className="text-midnight w-10 text-center text-sm font-semibold" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        aria-label="Increase quantity"
        className="text-midnight hover:bg-surface flex h-11 w-11 items-center justify-center disabled:pointer-events-none disabled:opacity-40"
      >
        <Plus aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}
