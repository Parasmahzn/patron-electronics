'use server';

import { repairRequestSchema } from '@/lib/validations/repair';
import { createRepairRequest } from '@/lib/repairs/repair.service';

export type RepairActionState =
  | { error: string; requestNumber?: undefined }
  | { error?: undefined; requestNumber: string }
  | undefined;

export async function submitRepairRequestAction(
  _prevState: RepairActionState,
  formData: FormData,
): Promise<RepairActionState> {
  const parsed = repairRequestSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone'),
    deviceType: formData.get('deviceType'),
    brand: formData.get('brand'),
    model: formData.get('model'),
    problem: formData.get('problem'),
    notes: formData.get('notes') || '',
  });

  if (!parsed.success) {
    return { error: 'Please check the form for errors and try again.' };
  }

  try {
    const request = await createRepairRequest(parsed.data);
    return { requestNumber: request.requestNumber };
  } catch {
    return { error: 'Something went wrong while submitting your request. Please try again.' };
  }
}
