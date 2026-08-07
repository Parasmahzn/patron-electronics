import 'server-only';
import { prisma } from '@/lib/db/client';
import { LOGIN_MAX_ATTEMPTS, LOGIN_LOCKOUT_MINUTES } from '@/config/site';

/**
 * Persistent (database-backed) login rate limiting, keyed by client IP, so
 * lockouts survive server restarts rather than resetting like an in-memory
 * counter would.
 */
export async function isLoginLocked(identifier: string): Promise<boolean> {
  const attempt = await prisma.loginAttempt.findUnique({ where: { identifier } });
  if (!attempt?.lockedUntil) return false;
  return attempt.lockedUntil > new Date();
}

export async function recordFailedLogin(identifier: string): Promise<void> {
  const now = new Date();
  const existing = await prisma.loginAttempt.findUnique({ where: { identifier } });

  const isStale = existing && existing.lockedUntil !== null && existing.lockedUntil < now;

  if (!existing || isStale) {
    await prisma.loginAttempt.upsert({
      where: { identifier },
      update: { attemptCount: 1, firstAttempAt: now, lockedUntil: null },
      create: { identifier, attemptCount: 1 },
    });
    return;
  }

  const attemptCount = existing.attemptCount + 1;
  const lockedUntil =
    attemptCount >= LOGIN_MAX_ATTEMPTS
      ? new Date(now.getTime() + LOGIN_LOCKOUT_MINUTES * 60 * 1000)
      : null;

  await prisma.loginAttempt.update({
    where: { identifier },
    data: { attemptCount, lockedUntil },
  });
}

export async function clearLoginAttempts(identifier: string): Promise<void> {
  await prisma.loginAttempt.deleteMany({ where: { identifier } });
}
