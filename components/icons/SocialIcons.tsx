import type { SVGProps } from 'react';

// Simplified, recognizable brand marks in each platform's real color — not
// pixel-exact trademark artwork, but close enough to read clearly as "the
// WhatsApp icon" etc. at footer icon size. Each is a self-contained 24x24
// glyph so it can be dropped straight into a circular button.

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        d="M15.4 12.5h-2.15V19h-2.68v-6.5H9.1v-2.28h1.47V8.85c0-1.45.86-2.85 3.06-2.85.62 0 1.4.06 1.4.06v2.14h-1.3c-.63 0-.83.4-.83.85v1.17h2.1l-.35 2.28Z"
        fill="#fff"
      />
    </svg>
  );
}

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  const gradientId = 'instagram-gradient';
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <radialGradient id={gradientId} cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#FFDD55" />
          <stop offset="30%" stopColor="#FF543E" />
          <stop offset="65%" stopColor="#C837AB" />
          <stop offset="100%" stopColor="#5B51D8" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="7" fill={`url(#${gradientId})`} />
      <rect x="6" y="6" width="12" height="12" rx="4" stroke="#fff" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.2" stroke="#fff" strokeWidth="1.6" />
      <circle cx="16.1" cy="7.9" r="1" fill="#fff" />
    </svg>
  );
}

export function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      <path
        d="M12.02 5.5a6.47 6.47 0 0 0-5.55 9.8L5.5 18.5l3.31-.94a6.47 6.47 0 1 0 3.2-12.06Zm0 1.3a5.16 5.16 0 0 1 4.13 8.27 5.16 5.16 0 0 1-6.9 1.6l-.24-.14-2 .57.58-1.94-.15-.25a5.16 5.16 0 0 1 4.58-8.11Z"
        fill="#fff"
      />
      <path
        d="M10.1 9.1c-.15-.34-.3-.35-.44-.35h-.38c-.13 0-.35.05-.53.25-.18.2-.7.68-.7 1.66s.72 1.93.82 2.06c.1.14 1.4 2.13 3.4 2.9 1.68.65 2.02.52 2.39.49.37-.03 1.19-.48 1.36-.95.17-.46.17-.86.12-.95-.05-.09-.18-.14-.38-.24-.2-.1-1.19-.59-1.37-.65-.18-.07-.32-.1-.45.1-.13.2-.52.65-.64.79-.12.13-.24.15-.44.05-.2-.1-.84-.31-1.6-.99-.59-.53-.99-1.18-1.1-1.38-.12-.2-.01-.31.09-.4.09-.09.2-.24.3-.36.1-.12.13-.2.2-.34.07-.13.03-.25-.02-.35-.05-.1-.44-1.09-.62-1.5Z"
        fill="#25D366"
      />
    </svg>
  );
}

export function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="24" height="24" rx="6" fill="#000" />
      <path
        d="M15.3 5.5c.35 1.36 1.24 2.24 2.7 2.36v1.98a4.86 4.86 0 0 1-2.7-.83v4.55a3.9 3.9 0 1 1-3.9-3.9c.14 0 .27 0 .4.02v2.02a1.9 1.9 0 1 0 1.5 1.86V5.5h2Z"
        fill="#25F4EE"
      />
      <path
        d="M14.7 5.5c.35 1.36 1.24 2.24 2.7 2.36v1.98a4.86 4.86 0 0 1-2.7-.83v4.55a3.9 3.9 0 1 1-3.9-3.9c.14 0 .27 0 .4.02v2.02a1.9 1.9 0 1 0 1.5 1.86V5.5h2Z"
        fill="#FE2C55"
        opacity="0.75"
      />
      <path
        d="M15 5.5c.35 1.36 1.24 2.24 2.7 2.36v1.98a4.86 4.86 0 0 1-2.7-.83v4.55a3.9 3.9 0 1 1-3.9-3.9c.14 0 .27 0 .4.02v2.02a1.9 1.9 0 1 0 1.5 1.86V5.5h2Z"
        fill="#fff"
      />
    </svg>
  );
}

export function ViberIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="12" fill="#7360F2" />
      <path
        d="M12.1 6c-2.98 0-5.6 1.7-5.6 5.2 0 2.1 1.06 3.6 2.75 4.4-.09.4-.35 1.35-.4 1.56-.06.26.1.26.2.19.08-.05 1.29-.87 1.81-1.23.4.06.81.09 1.24.09 2.98 0 5.6-1.7 5.6-5.01C17.7 7.7 15.08 6 12.1 6Zm0 8.9c-.4 0-.79-.03-1.16-.1l-.2-.03-1 .68.24-.9-.2-.13c-1.5-.68-2.42-1.9-2.42-3.42 0-2.72 2.15-3.9 4.74-3.9 2.6 0 4.74 1.18 4.74 3.9 0 2.53-2.15 3.9-4.74 3.9Z"
        fill="#fff"
      />
      <path
        d="M14.2 12.6c-.1-.2-.7-.5-.98-.62-.28-.13-.4-.05-.53.1-.13.16-.3.4-.4.5-.1.09-.2.1-.36.03-.16-.08-.68-.25-1.28-.79-.47-.42-.79-.94-.88-1.1-.09-.16-.01-.25.07-.33.07-.07.16-.18.24-.28.08-.09.1-.16.16-.26.05-.1.02-.2-.01-.28-.04-.09-.35-.85-.48-1.16-.13-.3-.26-.26-.36-.26h-.3c-.1 0-.27.04-.41.2-.14.16-.54.53-.54 1.28s.55 1.49.63 1.6c.08.1 1.09 1.66 2.64 2.26 1.3.51 1.57.41 1.85.38.28-.02.9-.37 1.03-.72.13-.36.13-.67.09-.73Z"
        fill="#7360F2"
      />
    </svg>
  );
}

/** Fallback for a platform an admin has typed that we don't have a brand mark for yet. */
export function GenericSocialIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M10 14a4.5 4.5 0 0 0 6.4.3l2-2a4.5 4.5 0 0 0-6.36-6.37L10.7 7.2" />
      <path d="M14 10a4.5 4.5 0 0 0-6.4-.3l-2 2a4.5 4.5 0 0 0 6.36 6.37l1.34-1.27" />
    </svg>
  );
}
