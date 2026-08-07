'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { updateRepairRequest } from '@/lib/repairs/repair.service';
import { REPAIR_STATUS_VALUES } from '@/lib/utils/status';
import type { RepairStatus } from '@/lib/generated/prisma/client';

/** Internal notes are staff-only — never surfaced on the public tracking flow. */
export async function updateRepairRequestAction(id: number, formData: FormData) {
  const status = String(formData.get('status') ?? '');
  const internalNotes = String(formData.get('internalNotes') ?? '').trim();

  if (!REPAIR_STATUS_VALUES.includes(status as RepairStatus)) {
    redirect(`/admin/repair-requests/${id}?error=${encodeURIComponent('Invalid status.')}`);
  }

  await updateRepairRequest(id, { status: status as RepairStatus, internalNotes });
  revalidatePath('/admin/repair-requests');
  revalidatePath(`/admin/repair-requests/${id}`);
  revalidatePath('/admin/dashboard');
}
