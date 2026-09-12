import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Next's default is 1MB, far below UPLOAD_MAX_SIZE_BYTES (25MB in
      // lib/uploads/upload.constants.ts) — an image upload over 1MB was
      // being rejected by Next itself before our own code (and its
      // friendly error handling) ever ran, surfacing as a bare 500.
      bodySizeLimit: '26mb',
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
