'use server';

import { redirect } from 'next/navigation';
import { checkoutSchema } from '@/lib/validations/checkout';
import { createOrderFromCart, CheckoutError } from '@/lib/orders/order.service';

export type CheckoutActionState = { error: string } | undefined;

/**
 * Validates the checkout form with zod as defense in depth (the service
 * layer re-validates and, more importantly, recalculates every price/stock
 * value from the database — the client-submitted cart is never trusted).
 */
export async function checkoutAction(
  _prevState: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  let items: unknown;
  try {
    items = JSON.parse(String(formData.get('items') ?? '[]'));
  } catch {
    return { error: 'Your cart data is invalid. Please refresh the page and try again.' };
  }

  const parsed = checkoutSchema.safeParse({
    fullName: formData.get('fullName'),
    phone: formData.get('phone'),
    email: formData.get('email') || '',
    address: formData.get('address'),
    city: formData.get('city') || '',
    area: formData.get('area') || '',
    notes: formData.get('notes') || '',
    items,
  });

  if (!parsed.success) {
    return { error: 'Please check the form for errors and try again.' };
  }

  let orderNumber: string;
  try {
    const order = await createOrderFromCart(parsed.data);
    orderNumber = order.orderNumber;
  } catch (error) {
    if (error instanceof CheckoutError) {
      return { error: error.message };
    }
    // Never leak internal/database error details to the customer.
    return { error: 'Something went wrong while placing your order. Please try again.' };
  }

  redirect(`/order-confirmation?order=${orderNumber}`);
}
