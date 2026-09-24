import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    INTERNAL_API_URL: process.env.INTERNAL_API_URL,
  },
  images: {
    remotePatterns: [new URL('https://www.placecats.com/**')],
  },
  redirects: async () => [
    {
      source: '/settings',
      destination: '/settings/profile',
      permanent: false,
    },
  ],
};

export default nextConfig;
