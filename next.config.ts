import createMDX from '@next/mdx';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts');

// Compiles the Markdown content (legal documents) at build time. Plugins are
// named by string so Turbopack can serialise them.
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: ['remark-gfm'],
  },
});

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    INTERNAL_API_URL: process.env.INTERNAL_API_URL,
    NEXT_PUBLIC_STRIPE_ENABLED: process.env.NEXT_PUBLIC_STRIPE_ENABLED,
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

export default withNextIntl(withMDX(nextConfig));
