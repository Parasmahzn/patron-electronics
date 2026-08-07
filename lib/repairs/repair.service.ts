import 'server-only';
import { prisma } from '@/lib/db/client';
import { requireAdmin } from '@/lib/auth/session';
import { repairRequestSchema, type RepairRequestInput } from '@/lib/validations/repair';
import { generateRepairRequestNumber } from '@/lib/orders/order-number';
import { Prisma, type RepairStatus } from '@/lib/generated/prisma/client';
import { DEFAULT_PAGE_SIZE } from '@/config/site';

const MAX_RETRIES = 3;

export async function createRepairRequest(input: RepairRequestInput) {
  const data = repairRequestSchema.parse(input);

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        const requestNumber = await generateRepairRequestNumber(tx);
        return tx.repairRequest.create({
          data: {
            requestNumber,
            name: data.name,
            phone: data.phone,
            deviceType: data.deviceType,
            brand: data.brand,
            model: data.model,
            problem: data.problem,
            notes: data.notes || null,
          },
        });
      });
    } catch (error) {
      const isConflict =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
      if (isConflict && attempt < MAX_RETRIES - 1) continue;
      throw error;
    }
  }

  throw new Error('Could not submit your repair request. Please try again.');
}

export type AdminRepairListParams = { q?: string; status?: RepairStatus; page?: number };

export async function listRepairRequestsForAdmin(params: AdminRepairListParams) {
  await requireAdmin();
  const page = params.page ?? 1;
  const take = DEFAULT_PAGE_SIZE;
  const skip = (page - 1) * take;

  const where = {
    ...(params.q
      ? {
          OR: [
            { requestNumber: { contains: params.q } },
            { name: { contains: params.q } },
            { phone: { contains: params.q } },
          ],
        }
      : {}),
    ...(params.status ? { status: params.status } : {}),
  };

  const [requests, totalCount] = await Promise.all([
    prisma.repairRequest.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.repairRequest.count({ where }),
  ]);

  return { requests, totalCount, totalPages: Math.max(1, Math.ceil(totalCount / take)), page };
}

export async function getRepairRequestByIdForAdmin(id: number) {
  await requireAdmin();
  return prisma.repairRequest.findUnique({ where: { id } });
}

export async function updateRepairRequest(
  id: number,
  data: { status?: RepairStatus; internalNotes?: string },
) {
  await requireAdmin();
  return prisma.repairRequest.update({ where: { id }, data });
}
