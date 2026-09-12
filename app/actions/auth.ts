'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import type { z } from 'zod';
import { prisma } from '@/lib/db/client';
import { changePasswordSchema, loginSchema } from '@/lib/validations/auth';
import { verifyLoginPassword } from '@/lib/auth/password';
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
  if (forwardedFor) {
    // A proxy appends the address of whoever connected to *it* to the end of
    // this header. For a single trusted hop in front of this app (Railway's
    // edge), the last entry is the one Railway itself observed — the first
    // entry is whatever the client claimed and is trivially spoofable, which
    // would otherwise let an attacker defeat the login lockout below by
    // sending a different fake value on every attempt. If another proxy
    // (e.g. a CDN) is ever added in front of Railway, this needs to skip an
    // additional trusted hop from the end instead of assuming exactly one.
    const parts = forwardedFor.split(',').map((part) => part.trim());
    return parts[parts.length - 1] || 'unknown';
  }
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
  // Always runs a real bcrypt comparison, even when no admin matches the
  // email, so the response time doesn't reveal which admin emails exist.
  const isValid = await verifyLoginPassword(parsed.data.password, admin?.passwordHash);

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

/**
 * Used only by the idle-timeout auto-logout (IdleTimeoutWatcher), not the
 * manual "Logout" button. An admin who deliberately clicks Logout probably
 * wants to sign back in right away, so that goes to /admin/login; an
 * unattended session that timed out sends whoever's now at the keyboard to
 * the public site instead, since it's unlikely to still be that admin.
 */
export async function idleLogoutAction() {
  await destroyAdminSession();
  redirect('/');
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
