'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, KeyRound, Camera, LogOut } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Avatar } from '@/components/ui/Avatar';
import { logoutAction } from '@/app/actions/auth';
import { ChangePasswordDialog } from '@/components/admin/ChangePasswordDialog';
import { ChangeAvatarDialog } from '@/components/admin/ChangeAvatarDialog';

const MENU_ITEM_CLASSES =
  'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium text-midnight hover:bg-surface';

export function AdminUserMenu({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState<'password' | 'avatar' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  function openDialog(next: 'password' | 'avatar') {
    setDialog(next);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${name}`}
        className="hover:bg-surface flex items-center gap-2 rounded-md p-1.5"
      >
        <Avatar name={name} src={avatarUrl} size={32} />
        <ChevronDown
          aria-hidden="true"
          className={cn('text-muted h-4 w-4 transition-transform', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Account"
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: reduceMotion ? 0 : 0.15, ease: 'easeOut' }}
            className="border-border absolute top-full right-0 z-50 mt-2 w-60 rounded-lg border bg-white p-1.5 shadow-lg"
          >
            <button
              role="menuitem"
              onClick={() => openDialog('password')}
              className={MENU_ITEM_CLASSES}
            >
              <KeyRound aria-hidden="true" className="h-4 w-4" />
              Change Password
            </button>
            <button
              role="menuitem"
              onClick={() => openDialog('avatar')}
              className={MENU_ITEM_CLASSES}
            >
              <Camera aria-hidden="true" className="h-4 w-4" />
              Change Profile Picture
            </button>

            {/* Logout is spatially separated from routine account actions. */}
            <div className="border-border my-1 border-t" />

            <form action={logoutAction}>
              <button
                role="menuitem"
                type="submit"
                className={cn(MENU_ITEM_CLASSES, 'text-red-600 hover:bg-red-50')}
              >
                <LogOut aria-hidden="true" className="h-4 w-4" />
                Logout
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {dialog === 'password' && <ChangePasswordDialog onClose={() => setDialog(null)} />}
      {dialog === 'avatar' && (
        <ChangeAvatarDialog
          name={name}
          currentAvatarUrl={avatarUrl}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}
