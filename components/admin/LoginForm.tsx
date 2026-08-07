'use client';

import { useActionState } from 'react';
import { Lock } from 'lucide-react';
import { loginAction } from '@/app/actions/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <Input
        label="Email"
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="admin@patronelectronics.com"
      />
      <Input
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
    </form>
  );
}
