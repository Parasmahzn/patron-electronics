'use server';

import { orderTrackingSchema } from '@/lib/validations/checkout';
import { trackOrder } from '@/lib/orders/order.service';
import { toNumber } from '@/lib/utils/format-currency';
import type { OrderStatus, PaymentMethod, PaymentStatus } from '@/lib/generated/prisma/client';

export type TrackedOrder = {
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  customerName: string;
  address: string;
  city: string | null;
  area: string | null;
  items: { productName: string; quantity: number; unitPrice: number; total: number }[];
};

export type OrderTrackingState =
  { error: string; order?: undefined } | { error?: undefined; order: TrackedOrder } | undefined;

export async function trackOrderAction(
  _prevState: OrderTrackingState,
  formData: FormData,
): Promise<OrderTrackingState> {
  const parsed = orderTrackingSchema.safeParse({
    orderNumber: formData.get('orderNumber'),
    phone: formData.get('phone'),
  });

  if (!parsed.success) {
    return { error: 'Enter a valid order number and phone number.' };
  }

  try {
    const order = await trackOrder(parsed.data);
    // Deliberately vague: never reveal whether the order number or the
    // phone number was the one that didn't match.
    if (!order) {
      return { error: 'No order found matching those details.' };
    }

    // Prisma Decimal instances cannot cross the server-action → client
    // boundary as-is; convert every money field to a plain number first.
    return {
      order: {
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        subtotal: toNumber(order.subtotal),
        discount: toNumber(order.discount),
        deliveryFee: toNumber(order.deliveryFee),
        total: toNumber(order.total),
        createdAt: order.createdAt.toISOString(),
        customerName: order.customerName,
        address: order.address,
        city: order.city,
        area: order.area,
        items: order.items.map((item) => ({
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: toNumber(item.unitPrice),
          total: toNumber(item.total),
        })),
      },
    };
  } catch {
    return { error: 'Something went wrong while looking up your order. Please try again.' };
  }
}
