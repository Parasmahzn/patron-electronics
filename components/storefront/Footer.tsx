import Link from 'next/link';
import { MapPin, Phone, ExternalLink } from 'lucide-react';
import { getSiteSettings } from '@/lib/settings/settings.service';
import { SITE_NAME } from '@/config/site';

export async function Footer() {
  const settings = await getSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="border-border bg-midnight border-t text-slate-300">
      <div className="container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="font-heading text-lg font-bold text-white">{settings.businessName}</span>
          <p className="mt-3 text-sm text-slate-400">
            Quality devices, accessories, and professional repair services you can trust.
          </p>
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
            {settings.facebookUrl && (
              <li className="flex items-center gap-2">
                <ExternalLink aria-hidden="true" className="text-accent h-4 w-4 shrink-0" />
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  Facebook Page
                </a>
              </li>
            )}
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
