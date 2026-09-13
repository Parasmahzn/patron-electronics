import Link from 'next/link';
import Image from 'next/image';
import { NAV_LINKS, SITE_NAME } from '@/config/site';
import { SearchBar } from './SearchBar';
import { CartButton } from './CartButton';
import { MobileMenu } from './MobileMenu';

export function Navbar() {
  return (
    <header className="border-border sticky top-0 z-40 border-b bg-white/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center gap-4 lg:grid lg:h-20 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-6">
        <Link href="/" className="relative z-20 shrink-0 lg:justify-self-start">
          <Image
            src="/patron-electronics-logo.png"
            alt={SITE_NAME}
            width={260}
            height={113}
            priority
            className="h-14 w-auto origin-left object-contain transition-transform duration-200 motion-safe:hover:scale-150 lg:h-13"
          />
        </Link>

        {/* Centered as its own grid column (flanked by two equal-width
            tracks) rather than just centered in the leftover space next to
            the logo — stays dead-center of the full-bleed header regardless
            of how wide the logo or the search+cart cluster are. */}
        <nav aria-label="Main" className="hidden items-center gap-6 lg:flex lg:justify-self-center">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-midnight hover:text-primary text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 lg:ml-0 lg:justify-self-end">
          <div className="hidden lg:block lg:w-56 xl:w-64">
            <SearchBar />
          </div>
          <CartButton />
          <MobileMenu />
        </div>
      </div>

      <div className="border-border border-t px-4 py-2.5 lg:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
