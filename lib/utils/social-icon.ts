import type { ComponentType, SVGProps } from 'react';
import {
  FacebookIcon,
  InstagramIcon,
  WhatsAppIcon,
  ViberIcon,
  TikTokIcon,
  GenericSocialIcon,
} from '@/components/icons/SocialIcons';

export const KNOWN_SOCIAL_PLATFORMS = [
  'facebook',
  'instagram',
  'whatsapp',
  'viber',
  'tiktok',
] as const;

const ICON_MAP: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  whatsapp: WhatsAppIcon,
  viber: ViberIcon,
  tiktok: TikTokIcon,
};

const LABEL_MAP: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  viber: 'Viber',
  tiktok: 'TikTok',
};

function normalize(platform: string): string {
  return platform.trim().toLowerCase();
}

/** A real brand mark for known platforms; a generic link icon for anything an admin types that we don't have one for yet. */
export function getSocialIcon(platform: string): ComponentType<SVGProps<SVGSVGElement>> {
  return ICON_MAP[normalize(platform)] ?? GenericSocialIcon;
}

/** Proper display casing for known platforms ("WhatsApp", "TikTok"); title-cases anything else. */
export function getSocialPlatformLabel(platform: string): string {
  const key = normalize(platform);
  if (LABEL_MAP[key]) return LABEL_MAP[key];
  const trimmed = platform.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}
