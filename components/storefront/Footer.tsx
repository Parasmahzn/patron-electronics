import Link from 'next/link';
import { MapPin, Phone } from 'lucide-react';
import { getSiteSettings, getActiveSocialLinks } from '@/lib/settings/settings.service';
import { getSocialIcon, getSocialPlatformLabel } from '@/lib/utils/social-icon';
import { SITE_NAME } from '@/config/site';

export async function Footer() {
  const [settings, socialLinks] = await Promise.all([getSiteSettings(), getActiveSocialLinks()]);
  const year = new Date().getFullYear();

  return (
    <footer className="border-border bg-midnight border-t text-slate-300">
      <div className="container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="font-heading text-lg font-bold text-white">{settings.businessName}</span>
          <p className="mt-3 text-sm text-slate-400">
            Quality devices, accessories, and professional repair services you can trust.
          </p>
          {socialLinks.length > 0 && (
            <ul className="mt-4 flex flex-wrap items-center gap-2">
              {socialLinks.map((link) => {
                const Icon = getSocialIcon(link.platform);
                return (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={getSocialPlatformLabel(link.platform)}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-slate-300 transition-colors hover:bg-white/20 hover:text-white"
                    >
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div>
          <h3 className="font-heading text-sm font-semibold text-white">Shop</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/shop" className="hover:text-white">
                All Products
              </Link>
            </li>
            <li>
              <Link href="/categories" className="hover:text-white">
                Categories
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-white">
                Repair Services
              </Link>
            </li>
            <li>
              <Link href="/repair" className="hover:text-white">
                Book a Repair
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-heading text-sm font-semibold text-white">Support</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/order-status" className="hover:text-white">
                Track Your Order
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-heading text-sm font-semibold text-white">Contact</h3>
          <ul className="mt-3 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin aria-hidden="true" className="text-accent mt-0.5 h-4 w-4 shrink-0" />
              <span>{settings.address}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone aria-hidden="true" className="text-accent h-4 w-4 shrink-0" />
              <a href={`tel:${settings.phone}`} className="hover:text-white">
                {settings.phone}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <p className="container text-center text-xs text-slate-500">
          &copy; {year} {SITE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
