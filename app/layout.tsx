import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter, Space_Grotesk } from 'next/font/google';
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from '@/config/site';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Mobile & Laptop Store and Repair Centre`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Mobile & Laptop Store and Repair Centre`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Mobile & Laptop Store and Repair Centre`,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ElectronicsStore',
    name: SITE_NAME,
    url: SITE_URL,
    telephone: '+977-9843012697',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'P9MJ+8J6',
      addressLocality: 'Gokarneshwor',
      postalCode: '44600',
      addressCountry: 'NP',
    },
    sameAs: [
      'https://www.facebook.com/p/Patron-Electronics-Mobile-and-repairing-centre-100063595520227/',
    ],
  };

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}>
      <body className="text-midnight flex min-h-full flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
