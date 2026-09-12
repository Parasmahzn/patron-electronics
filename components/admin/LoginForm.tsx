'use client';

import { useActionState, useRef } from 'react';
import { Lock, FlaskConical } from 'lucide-react';
import { loginAction } from '@/app/actions/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export type DevCredentials = { email: string; password: string };

/**
 * TEMPORARY, testing-only. `devCredentials` is passed unconditionally by
 * app/admin/login/page.tsx right now (the NODE_ENV production gate was
 * removed at the user's request) — this button and that prop MUST be
 * deleted before going live.
 */
export function LoginForm({ devCredentials }: { devCredentials?: DevCredentials | null }) {
  const [state, action, pending] = useActionState(loginAction, undefined);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  function fillDevCredentials() {
    if (!devCredentials) return;
    if (emailRef.current) emailRef.current.value = devCredentials.email;
    if (passwordRef.current) passwordRef.current.value = devCredentials.password;
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <Input
        ref={emailRef}
        label="Email"
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="admin@patronelectronics.com"
      />
      <Input
        ref={passwordRef}
        label="Password"
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        placeholder="********"
      />

      {state?.error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="mt-1">
        <Lock aria-hidden="true" className="h-4 w-4" />
        {pending ? 'Signing in...' : 'Sign in'}
      </Button>

      {devCredentials && (
        <Button type="button" variant="outline" size="sm" onClick={fillDevCredentials}>
          <FlaskConical aria-hidden="true" className="h-3.5 w-3.5" />
          Fill test credentials (dev only)
        </Button>
      )}
    </form>
  );
}
