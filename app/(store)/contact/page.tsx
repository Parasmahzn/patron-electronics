import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Phone, Wrench } from 'lucide-react';
import { getSiteSettings, getActiveSocialLinks } from '@/lib/settings/settings.service';
import { getSocialIcon, getSocialPlatformLabel } from '@/lib/utils/social-icon';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Patron Electronics — phone, address, and social media.',
};

export default async function ContactPage() {
  const [settings, socialLinks] = await Promise.all([getSiteSettings(), getActiveSocialLinks()]);

  return (
    <div className="container max-w-2xl py-8 sm:py-10">
      <h1 className="font-heading text-midnight text-2xl font-bold sm:text-3xl">Contact Us</h1>
      <p className="text-muted mt-1 text-sm">
        Reach out to {settings.businessName} for sales enquiries, repair bookings, or general
        questions.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        <div className="border-border flex items-start gap-4 rounded-lg border bg-white p-5">
          <MapPin aria-hidden="true" className="text-primary mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="text-midnight text-sm font-semibold">Address</p>
            <p className="text-muted mt-1 text-sm">{settings.address}</p>
          </div>
        </div>

        <a
          href={`tel:${settings.phone}`}
          className="border-border hover:bg-surface flex items-start gap-4 rounded-lg border bg-white p-5"
        >
          <Phone aria-hidden="true" className="text-primary mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="text-midnight text-sm font-semibold">Phone</p>
            <p className="text-muted mt-1 text-sm">{settings.phone}</p>
          </div>
        </a>

        {socialLinks.map((link) => {
          const Icon = getSocialIcon(link.platform);
          return (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="border-border hover:bg-surface flex items-start gap-4 rounded-lg border bg-white p-5"
            >
              <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="text-midnight text-sm font-semibold">
                  {getSocialPlatformLabel(link.platform)}
                </p>
                <p className="text-muted mt-1 text-sm">Follow us for updates and offers</p>
              </div>
            </a>
          );
        })}

        <Link
          href="/repair"
          className="border-border hover:bg-surface flex items-start gap-4 rounded-lg border bg-white p-5"
        >
          <Wrench aria-hidden="true" className="text-primary mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="text-midnight text-sm font-semibold">Book a Repair</p>
            <p className="text-muted mt-1 text-sm">
              Submit a repair request online, no account needed
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
