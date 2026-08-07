'use client';

import { useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';

/**
 * The checkout Server Action redirects on success, so it cannot itself
 * report "success" back to the client cart. Clearing the guest cart here,
 * once, when the confirmation page mounts is the narrow exception to
 * avoiding useEffect — it synchronizes localStorage with the fact that an
 * order was just placed, which is an external-system side effect rather
 * than derived render state.
 */
export function ClearCartOnMount() {
  const { clear, hydrated } = useCart();

  useEffect(() => {
    if (hydrated) clear();
    // Only ever run this once per mount, after the cart has hydrated from localStorage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  return null;
}
