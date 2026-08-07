type Numeric = number | string | { toString(): string };

/**
 * Formats a monetary amount as Nepalese currency, e.g. "Rs. 85,000".
 * Accepts Prisma `Decimal` values (or anything stringifiable) so callers
 * never need to convert with lossy floating-point math themselves.
 */
export function formatCurrency(amount: Numeric): string {
  const value = typeof amount === 'number' ? amount : parseFloat(amount.toString());
  const hasFraction = Math.abs(value % 1) > 0.001;

  return `Rs. ${value.toLocaleString('en-US', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

export function toNumber(amount: Numeric): number {
  return typeof amount === 'number' ? amount : parseFloat(amount.toString());
}
