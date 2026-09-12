'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { Clock } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { logoutAction, idleLogoutAction } from '@/app/actions/auth';
import { ADMIN_IDLE_TIMEOUT_MINUTES, ADMIN_IDLE_WARNING_SECONDS } from '@/config/site';

const IDLE_TIMEOUT_MS = ADMIN_IDLE_TIMEOUT_MINUTES * 60 * 1000;
const WARNING_MS = ADMIN_IDLE_WARNING_SECONDS * 1000;
const CHECK_INTERVAL_MS = 1000;
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'] as const;

// Shared across tabs: activity in any open admin tab counts as activity, so
// switching between two admin tabs doesn't sign the admin out of the one
// that's been idle while they were working in the other.
const STORAGE_KEY = 'pe_admin_last_active';

function readLastActive(): number {
  const stored = Number(localStorage.getItem(STORAGE_KEY));
  return Number.isFinite(stored) && stored > 0 ? stored : Date.now();
}

function writeLastActive(timestamp: number): void {
  localStorage.setItem(STORAGE_KEY, String(timestamp));
}

/**
 * Client-side half of idle-timeout enforcement. The authoritative check
 * lives server-side in `getAdminSession()` (kills the session record once
 * it's actually idle past the threshold); this component exists so an admin
 * who never triggers another request while idle still gets warned and
 * signed out, instead of only discovering it's happened on their next click.
 *
 * While the warning is showing, incidental activity (mousemove, scroll) does
 * NOT silently dismiss it — the admin must explicitly choose "Stay logged
 * in" or "Sign out now" in the dialog, so a countdown that's already begun
 * can't be reset by, say, an unattended mouse resting on the trackpad.
 */
export function IdleTimeoutWatcher() {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(ADMIN_IDLE_WARNING_SECONDS);
  const [isPending, startTransition] = useTransition();
  const loggedOutRef = useRef(false);
  const warningActiveRef = useRef(false);

  useEffect(() => {
    warningActiveRef.current = showWarning;
  }, [showWarning]);

  const handleStayLoggedIn = useCallback(() => {
    writeLastActive(Date.now());
    setShowWarning(false);
  }, []);

  const handleSignOutNow = useCallback(() => {
    if (loggedOutRef.current) return;
    loggedOutRef.current = true;
    startTransition(() => {
      void logoutAction();
    });
  }, []);

  useEffect(() => {
    writeLastActive(Date.now());

    const onUserActivity = () => {
      // Ignored once the warning dialog is up — see the component doc
      // comment above for why.
      if (!warningActiveRef.current) {
        writeLastActive(Date.now());
      }
    };

    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, onUserActivity, { passive: true });
    }

    const intervalId = window.setInterval(() => {
      if (loggedOutRef.current) return;

      const idleMs = Date.now() - readLastActive();
      const remainingMs = IDLE_TIMEOUT_MS - idleMs;

      if (remainingMs <= 0) {
        loggedOutRef.current = true;
        startTransition(() => {
          void idleLogoutAction();
        });
        return;
      }

      if (remainingMs <= WARNING_MS) {
        setShowWarning(true);
        setSecondsRemaining(Math.ceil(remainingMs / 1000));
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, onUserActivity);
      }
      window.clearInterval(intervalId);
    };
  }, []);

  if (!showWarning) return null;

  return (
    <Dialog title="You'll be signed out soon" onClose={handleStayLoggedIn}>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
          <Clock aria-hidden="true" className="h-6 w-6" />
        </div>
        <p className="text-muted text-sm">
          No activity detected. For security, you&apos;ll be automatically signed out in:
        </p>
        <p className="text-midnight font-heading text-3xl font-bold tabular-nums">
          00:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}
        </p>
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={isPending}
            onClick={handleSignOutNow}
          >
            Sign out now
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={isPending}
            onClick={handleStayLoggedIn}
          >
            Stay logged in
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
