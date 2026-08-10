'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import type { z } from 'zod';
import { prisma } from '@/lib/db/client';
import { changePasswordSchema, loginSchema } from '@/lib/validations/auth';
import { verifyPassword } from '@/lib/auth/password';
import { createAdminSession, destroyAdminSession, requireAdmin } from '@/lib/auth/session';
import { isLoginLocked, recordFailedLogin, clearLoginAttempts } from '@/lib/auth/rate-limit';
import { changeAdminPassword, updateAdminAvatar } from '@/lib/auth/admin.service';

export type LoginActionState = { error: string } | undefined;

export type ChangePasswordState =
  { error?: string; fieldErrors?: Record<string, string> } | { success: true } | undefined;

export type UpdateAvatarResult = { error: string } | { success: true };

function toFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}

async function getClientIdentifier(): Promise<string> {
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return headersList.get('x-real-ip') ?? 'unknown';
}

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const identifier = await getClientIdentifier();

  if (await isLoginLocked(identifier)) {
    return { error: 'Too many failed attempts. Please try again in a few minutes.' };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: 'Enter a valid email and password.' };
  }

  const admin = await prisma.admin.findUnique({ where: { email: parsed.data.email } });
  const isValid = admin ? await verifyPassword(parsed.data.password, admin.passwordHash) : false;

  if (!admin || !isValid) {
    await recordFailedLogin(identifier);
    return { error: 'Invalid email or password.' };
  }

  await clearLoginAttempts(identifier);
  await createAdminSession(admin.id);
  redirect('/admin/dashboard');
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect('/admin/login');
}

export async function changePasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const admin = await requireAdmin();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    return { error: 'Please fix the errors below.', fieldErrors: toFieldErrors(parsed.error) };
  }

  const result = await changeAdminPassword(admin.id, parsed.data);
  if ('fieldErrors' in result) {
    return { fieldErrors: result.fieldErrors };
  }

  return { success: true };
}

export async function updateAvatarAction(formData: FormData): Promise<UpdateAvatarResult> {
  const admin = await requireAdmin();

  const avatarUrl = String(formData.get('avatarUrl') ?? '').trim();
  if (!avatarUrl) {
    return { error: 'No image provided.' };
  }

  await updateAdminAvatar(admin.id, avatarUrl);
  revalidatePath('/admin', 'layout');

  return { success: true };
}
