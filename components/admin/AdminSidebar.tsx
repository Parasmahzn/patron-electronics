'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  GalleryHorizontal,
  Boxes,
  ShoppingCart,
  Wrench,
  ClipboardList,
  Star,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const ADMIN_NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/banners', label: 'Banners', icon: GalleryHorizontal },
  { href: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/services', label: 'Services', icon: Wrench },
  { href: '/admin/repair-requests', label: 'Repair Requests', icon: ClipboardList },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar({ variant = 'vertical' }: { variant?: 'vertical' | 'horizontal' }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin"
      className={cn(
        'flex gap-1',
        variant === 'vertical' ? 'flex-col p-3' : 'flex-row overflow-x-auto p-2',
      )}
    >
      {ADMIN_NAV.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
              isActive
                ? 'bg-primary text-white'
                : 'text-slate-300 hover:bg-white/10 hover:text-white',
            )}
          >
            <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
