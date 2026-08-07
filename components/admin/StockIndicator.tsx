import { cn } from '@/lib/utils/cn';

/** Color-codes a stock count: red when out, amber when at/under the low-stock threshold. */
export function StockIndicator({ stock, threshold }: { stock: number; threshold: number }) {
  return (
    <span
      className={cn(
        'font-medium',
        stock <= 0 ? 'text-red-600' : stock <= threshold ? 'text-amber' : 'text-midnight',
      )}
    >
      {stock}
    </span>
  );
}
