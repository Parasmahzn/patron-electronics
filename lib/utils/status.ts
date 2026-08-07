import {
  BadgeCheck,
  CheckCheck,
  CheckCircle2,
  Clock,
  PackageCheck,
  PackageSearch,
  PauseCircle,
  RotateCcw,
  Stethoscope,
  Truck,
  Wrench,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import type { OrderStatus, PaymentStatus, RepairStatus } from '@/lib/generated/prisma/client';
import type { BadgeTone } from '@/components/ui/Badge';

type StatusMeta = { label: string; tone: BadgeTone; icon: LucideIcon };

export const ORDER_STATUS_META: Record<OrderStatus, StatusMeta> = {
  PENDING: { label: 'Pending', tone: 'amber', icon: Clock },
  CONFIRMED: { label: 'Confirmed', tone: 'accent', icon: CheckCircle2 },
  PROCESSING: { label: 'Processing', tone: 'primary', icon: PackageSearch },
  READY_FOR_DELIVERY: { label: 'Ready for Delivery', tone: 'primary', icon: PackageCheck },
  SHIPPED: { label: 'Shipped', tone: 'primary', icon: Truck },
  DELIVERED: { label: 'Delivered', tone: 'success', icon: CheckCheck },
  CANCELLED: { label: 'Cancelled', tone: 'danger', icon: XCircle },
};

export const PAYMENT_STATUS_META: Record<PaymentStatus, StatusMeta> = {
  PENDING: { label: 'Pending', tone: 'amber', icon: Clock },
  PAID: { label: 'Paid', tone: 'success', icon: BadgeCheck },
  FAILED: { label: 'Failed', tone: 'danger', icon: XCircle },
  REFUNDED: { label: 'Refunded', tone: 'amber', icon: RotateCcw },
};

export const REPAIR_STATUS_META: Record<RepairStatus, StatusMeta> = {
  REQUESTED: { label: 'Requested', tone: 'neutral', icon: Clock },
  DIAGNOSING: { label: 'Diagnosing', tone: 'accent', icon: Stethoscope },
  WAITING_FOR_CUSTOMER: { label: 'Waiting for Customer', tone: 'amber', icon: PauseCircle },
  REPAIRING: { label: 'Repairing', tone: 'primary', icon: Wrench },
  READY: { label: 'Ready', tone: 'primary', icon: PackageCheck },
  COMPLETED: { label: 'Completed', tone: 'success', icon: CheckCheck },
  CANCELLED: { label: 'Cancelled', tone: 'danger', icon: XCircle },
};

export const ORDER_STATUS_VALUES = Object.keys(ORDER_STATUS_META) as OrderStatus[];
export const PAYMENT_STATUS_VALUES = Object.keys(PAYMENT_STATUS_META) as PaymentStatus[];
export const REPAIR_STATUS_VALUES = Object.keys(REPAIR_STATUS_META) as RepairStatus[];
