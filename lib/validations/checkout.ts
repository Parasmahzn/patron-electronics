import { z } from 'zod';

const PHONE_PATTERN = /^[0-9+\-\s]{7,20}$/;

export const checkoutItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive().max(20),
});

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, { error: 'Full name is required' }).max(120),
  phone: z.string().trim().regex(PHONE_PATTERN, { error: 'Enter a valid phone number' }),
  email: z.email({ error: 'Enter a valid email address' }).optional().or(z.literal('')),
  address: z.string().trim().min(5, { error: 'Address is required' }).max(300),
  city: z.string().trim().max(100).optional().or(z.literal('')),
  area: z.string().trim().max(100).optional().or(z.literal('')),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
  items: z.array(checkoutItemSchema).min(1, { error: 'Your cart is empty' }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const orderTrackingSchema = z.object({
  orderNumber: z.string().trim().min(4).max(30),
  phone: z.string().trim().regex(PHONE_PATTERN, { error: 'Enter a valid phone number' }),
});

export type OrderTrackingInput = z.infer<typeof orderTrackingSchema>;
