'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { logoutAction } from '@/app/actions/auth';
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
 */
export function IdleTimeoutWatcher() {
  const [showWarning, setShowWarning] = useState(false);
  const [isLoggingOut, startTransition] = useTransition();
  const reduceMotion = useReducedMotion();
  const loggedOutRef = useRef(false);

  const handleActivity = useCallback(() => {
    writeLastActive(Date.now());
    setShowWarning(false);
  }, []);

  useEffect(() => {
    writeLastActive(Date.now());

    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, handleActivity, { passive: true });
    }

    const intervalId = window.setInterval(() => {
      if (loggedOutRef.current) return;

      const idleMs = Date.now() - readLastActive();

      if (idleMs >= IDLE_TIMEOUT_MS) {
        loggedOutRef.current = true;
        startTransition(() => {
          void logoutAction();
        });
        return;
      }

      setShowWarning(idleMs >= IDLE_TIMEOUT_MS - WARNING_MS);
    }, CHECK_INTERVAL_MS);

    return () => {
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, handleActivity);
      }
      window.clearInterval(intervalId);
    };
  }, [handleActivity]);

  return (
    <AnimatePresence>
      {showWarning && (
        <motion.div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="idle-timeout-heading"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
          className="border-border fixed right-4 bottom-4 z-[60] flex w-full max-w-sm items-start gap-3 rounded-lg border bg-white p-4 shadow-lg"
        >
          <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div className="flex-1">
            <p id="idle-timeout-heading" className="text-midnight text-sm font-semibold">
              You&apos;ll be signed out soon
            </p>
            <p className="text-muted mt-1 text-sm">
              No activity detected. You&apos;ll be automatically logged out shortly for security.
            </p>
            <Button
              type="button"
              size="sm"
              className="mt-3"
              disabled={isLoggingOut}
              onClick={handleActivity}
            >
              Stay signed in
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
