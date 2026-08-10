import 'server-only';
import { prisma } from '@/lib/db/client';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { invalidateOtherAdminSessions } from '@/lib/auth/session';
import type { ChangePasswordInput } from '@/lib/validations/auth';
import {
  deleteUploadedImageInternal,
  extractStorageKeyFromUrl,
} from '@/lib/uploads/upload.service';

export type ChangePasswordResult = { fieldErrors: { currentPassword: string } } | { success: true };

export async function changeAdminPassword(
  adminId: number,
  input: ChangePasswordInput,
): Promise<ChangePasswordResult> {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { passwordHash: true },
  });

  const isValid = admin ? await verifyPassword(input.currentPassword, admin.passwordHash) : false;
  if (!isValid) {
    return { fieldErrors: { currentPassword: 'Incorrect current password.' } };
  }

  const passwordHash = await hashPassword(input.newPassword);
  await prisma.admin.update({ where: { id: adminId }, data: { passwordHash } });

  // A password change should not still be usable from a session opened
  // elsewhere (or a stolen cookie) — every other session for this admin is
  // signed out. The current session (the one making this change) stays valid.
  await invalidateOtherAdminSessions(adminId);

  return { success: true };
}

export async function updateAdminAvatar(adminId: number, avatarUrl: string): Promise<void> {
  const existing = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { avatarUrl: true },
  });
  const previousKey = extractStorageKeyFromUrl(existing?.avatarUrl);
  const nextKey = extractStorageKeyFromUrl(avatarUrl);

  await prisma.admin.update({ where: { id: adminId }, data: { avatarUrl } });

  // Only clean up the old file after the new reference is durably saved,
  // and only if it was actually replaced (not the same managed image).
  if (previousKey && previousKey !== nextKey) {
    await deleteUploadedImageInternal(previousKey);
  }
}
