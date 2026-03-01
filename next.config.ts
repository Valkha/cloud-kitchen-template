import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ AJOUT DES HEADERS DE SÉCURITÉ
  async headers() {
    return [
      {
        source: '/(:path*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.stripe.com https://*.supabase.co; object-src 'none'; "
          },
        ],
      },
    ]
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    minimumCacheTTL: 3600, 
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  compress: true,

  experimental: {
    optimizePackageImports: ['lucide-react'], 
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;