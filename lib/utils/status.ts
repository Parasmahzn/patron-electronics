import type { OrderStatus, PaymentStatus, RepairStatus } from '@/lib/generated/prisma/client';
import type { BadgeTone } from '@/components/ui/Badge';

type StatusMeta = { label: string; tone: BadgeTone };

export const ORDER_STATUS_META: Record<OrderStatus, StatusMeta> = {
  PENDING: { label: 'Pending', tone: 'neutral' },
  CONFIRMED: { label: 'Confirmed', tone: 'accent' },
  PROCESSING: { label: 'Processing', tone: 'primary' },
  READY_FOR_DELIVERY: { label: 'Ready for Delivery', tone: 'primary' },
  SHIPPED: { label: 'Shipped', tone: 'primary' },
  DELIVERED: { label: 'Delivered', tone: 'success' },
  CANCELLED: { label: 'Cancelled', tone: 'danger' },
};

export const PAYMENT_STATUS_META: Record<PaymentStatus, StatusMeta> = {
  PENDING: { label: 'Pending', tone: 'neutral' },
  PAID: { label: 'Paid', tone: 'success' },
  FAILED: { label: 'Failed', tone: 'danger' },
  REFUNDED: { label: 'Refunded', tone: 'amber' },
};

export const REPAIR_STATUS_META: Record<RepairStatus, StatusMeta> = {
  REQUESTED: { label: 'Requested', tone: 'neutral' },
  DIAGNOSING: { label: 'Diagnosing', tone: 'accent' },
  WAITING_FOR_CUSTOMER: { label: 'Waiting for Customer', tone: 'amber' },
  REPAIRING: { label: 'Repairing', tone: 'primary' },
  READY: { label: 'Ready', tone: 'primary' },
  COMPLETED: { label: 'Completed', tone: 'success' },
  CANCELLED: { label: 'Cancelled', tone: 'danger' },
};

export const ORDER_STATUS_VALUES = Object.keys(ORDER_STATUS_META) as OrderStatus[];
export const PAYMENT_STATUS_VALUES = Object.keys(PAYMENT_STATUS_META) as PaymentStatus[];
export const REPAIR_STATUS_VALUES = Object.keys(REPAIR_STATUS_META) as RepairStatus[];
