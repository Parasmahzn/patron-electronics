import Link from 'next/link';
import { NAV_LINKS, SITE_NAME } from '@/config/site';
import { SearchBar } from './SearchBar';
import { CartButton } from './CartButton';
import { MobileMenu } from './MobileMenu';

export function Navbar() {
  return (
    <header className="border-border sticky top-0 z-40 border-b bg-white/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center gap-4 lg:h-20">
        <Link href="/" className="shrink-0">
          <span className="font-heading text-midnight text-lg font-bold lg:text-xl">
            {SITE_NAME}
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
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

        <div className="hidden flex-1 lg:block lg:max-w-sm">
          <SearchBar />
        </div>

        <div className="ml-auto flex items-center gap-1">
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
