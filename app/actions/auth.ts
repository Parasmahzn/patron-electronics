'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db/client';
import { loginSchema } from '@/lib/validations/auth';
import { verifyPassword } from '@/lib/auth/password';
import { createAdminSession, destroyAdminSession } from '@/lib/auth/session';
import { isLoginLocked, recordFailedLogin, clearLoginAttempts } from '@/lib/auth/rate-limit';

export type LoginActionState = { error: string } | undefined;

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
