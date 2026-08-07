import 'server-only';
import { randomBytes, createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { prisma } from '@/lib/db/client';
import { SESSION_COOKIE_NAME, SESSION_DURATION_DAYS } from '@/config/site';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function createAdminSession(adminId: number): Promise<void> {
  const token = randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.adminSession.deleteMany({ where: { adminId, expiresAt: { lt: new Date() } } }),
    prisma.adminSession.create({ data: { tokenHash, adminId, expiresAt } }),
  ]);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });
}

// Memoized per-request: every call within the same render pass reuses the
// first database lookup instead of re-querying for each Server Component.
export const getAdminSession = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash },
    select: {
      expiresAt: true,
      admin: { select: { id: true, email: true, name: true } },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.admin;
});

/**
 * Authoritative authorization check for admin Server Components, Server
 * Actions, and Route Handlers. Redirects unauthenticated requests to the
 * login page. `proxy.ts` only performs an optimistic, cookie-presence check
 * for fast redirects — this is the real gate.
 */
export async function requireAdmin() {
  const admin = await getAdminSession();
  if (!admin) {
    redirect('/admin/login');
  }
  return admin;
}

export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await prisma.adminSession.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}
