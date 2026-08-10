'use client';

import { useActionState, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/admin/ErrorBanner';
import { changePasswordAction } from '@/app/actions/auth';

export function ChangePasswordDialog({ onClose }: { onClose: () => void }) {
  const [state, formAction, isPending] = useActionState(changePasswordAction, undefined);
  const [showPasswords, setShowPasswords] = useState(false);
  const fieldErrors = state && 'fieldErrors' in state ? (state.fieldErrors ?? {}) : {};
  const error = state && 'error' in state ? state.error : undefined;
  const success = state && 'success' in state && state.success;
  const inputType = showPasswords ? 'text' : 'password';

  return (
    <Dialog title="Change Password" onClose={onClose}>
      {success ? (
        <div className="flex flex-col gap-4">
          <p role="status" className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Password updated. You&apos;ll stay signed in on this device — any other signed-in
            sessions were signed out.
          </p>
          <div className="flex justify-end">
            <Button type="button" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form action={formAction} className="flex flex-col gap-4">
          {error && <ErrorBanner message={error} />}
          <Input
            label="Current Password"
            name="currentPassword"
            type={inputType}
            required
            autoComplete="current-password"
            error={fieldErrors.currentPassword}
          />
          <Input
            label="New Password"
            name="newPassword"
            type={inputType}
            required
            autoComplete="new-password"
            hint="At least 8 characters."
            error={fieldErrors.newPassword}
          />
          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type={inputType}
            required
            autoComplete="new-password"
            error={fieldErrors.confirmPassword}
          />
          <button
            type="button"
            onClick={() => setShowPasswords((value) => !value)}
            className="text-primary flex items-center gap-1.5 self-start text-xs font-medium"
          >
            {showPasswords ? (
              <EyeOff aria-hidden="true" className="h-3.5 w-3.5" />
            ) : (
              <Eye aria-hidden="true" className="h-3.5 w-3.5" />
            )}
            {showPasswords ? 'Hide' : 'Show'} passwords
          </button>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : 'Update Password'}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
