import { z } from 'zod';

export const repairRequestSchema = z.object({
  name: z.string().trim().min(2, { error: 'Name is required' }).max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,20}$/, { error: 'Enter a valid phone number' }),
  deviceType: z.string().trim().min(2, { error: 'Select a device type' }).max(50),
  brand: z.string().trim().min(1, { error: 'Brand is required' }).max(60),
  model: z.string().trim().min(1, { error: 'Model is required' }).max(100),
  problem: z
    .string()
    .trim()
    .min(10, { error: 'Please describe the problem in more detail' })
    .max(1000),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
});

export type RepairRequestInput = z.infer<typeof repairRequestSchema>;
