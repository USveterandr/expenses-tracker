// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  devIndicators: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; connect-src 'self' *.supabase.co;"
          }
        ],
      },
    ];
  },
};

export default nextConfig;
