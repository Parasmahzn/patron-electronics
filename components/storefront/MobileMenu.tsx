'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { NAV_LINKS } from '@/config/site';

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="hover:bg-surface flex h-11 w-11 items-center justify-center rounded-md lg:hidden"
      >
        <Menu aria-hidden="true" className="text-midnight h-5 w-5" />
      </button>

      {/* Portaled to <body>: the header uses backdrop-blur, which makes it a
          containing block for position:fixed descendants and would otherwise
          confine this overlay to the header's own box instead of the viewport. */}
      {open &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.2 }}
                  className="bg-midnight/40 fixed inset-0 z-50 lg:hidden"
                  onClick={() => setOpen(false)}
                />
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Navigation menu"
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ duration: reduceMotion ? 0 : 0.25, ease: 'easeOut' }}
                  className="fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] bg-white p-6 shadow-xl lg:hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-midnight text-lg font-bold">Menu</span>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      aria-label="Close menu"
                      className="hover:bg-surface flex h-10 w-10 items-center justify-center rounded-md"
                    >
                      <X aria-hidden="true" className="h-5 w-5" />
                    </button>
                  </div>
                  <nav aria-label="Mobile" className="mt-8 flex flex-col gap-1">
                    {NAV_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="text-midnight hover:bg-surface rounded-md px-3 py-3 text-base font-medium"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
