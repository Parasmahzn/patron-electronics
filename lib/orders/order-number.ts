import 'server-only';
import type { Prisma } from '@/lib/generated/prisma/client';

type Tx = Prisma.TransactionClient;

/**
 * Sequence numbers are derived from a same-transaction count rather than a
 * separate counter table. Collisions are possible under concurrent
 * checkouts and are handled by retrying the whole transaction on the
 * resulting unique-constraint error (see order.service.ts).
 */
export async function generateOrderNumber(tx: Tx): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `PE-${year}-`;
  const count = await tx.order.count({ where: { orderNumber: { startsWith: prefix } } });
  return `${prefix}${(count + 1).toString().padStart(6, '0')}`;
}

export async function generateRepairRequestNumber(tx: Tx): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `REP-${year}-`;
  const count = await tx.repairRequest.count({ where: { requestNumber: { startsWith: prefix } } });
  return `${prefix}${(count + 1).toString().padStart(6, '0')}`;
}
