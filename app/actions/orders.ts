'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { updateOrderStatus, updatePaymentStatus, cancelOrder } from '@/lib/orders/order.service';
import { ORDER_STATUS_VALUES, PAYMENT_STATUS_VALUES } from '@/lib/utils/status';
import type { OrderStatus, PaymentStatus } from '@/lib/generated/prisma/client';

function revalidateOrderPaths(id: number) {
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/inventory');
  revalidatePath('/admin/products');
}

/** Rejects any status value that isn't a real enum member — form selects should never send one, but input is never trusted. */
export async function updateOrderStatusAction(id: number, formData: FormData) {
  const status = String(formData.get('orderStatus') ?? '');
  if (!ORDER_STATUS_VALUES.includes(status as OrderStatus)) {
    redirect(`/admin/orders/${id}?error=${encodeURIComponent('Invalid order status.')}`);
  }

  await updateOrderStatus(id, status as OrderStatus);
  revalidateOrderPaths(id);
}

export async function updatePaymentStatusAction(id: number, formData: FormData) {
  const status = String(formData.get('paymentStatus') ?? '');
  if (!PAYMENT_STATUS_VALUES.includes(status as PaymentStatus)) {
    redirect(`/admin/orders/${id}?error=${encodeURIComponent('Invalid payment status.')}`);
  }

  await updatePaymentStatus(id, status as PaymentStatus);
  revalidateOrderPaths(id);
}

export async function cancelOrderAction(id: number) {
  await cancelOrder(id);
  revalidateOrderPaths(id);
}
