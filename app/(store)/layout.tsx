import type { ReactNode } from 'react';
import { CartProvider } from '@/lib/cart/cart-context';
import { AnnouncementBar } from '@/components/storefront/AnnouncementBar';
import { Navbar } from '@/components/storefront/Navbar';
import { Footer } from '@/components/storefront/Footer';

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </CartProvider>
  );
}
