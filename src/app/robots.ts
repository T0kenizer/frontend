import { SITE_URL } from '@constants/index';
import type { MetadataRoute } from 'next';

const robots = (): MetadataRoute.Robots => ({
  rules: {
    userAgent: '*',
    allow: '/',
    disallow: [
      '/reset-password',
      '/dashboard',
      '/settings/',
      '/delete-account',
      '/admin',
      '/game/',
    ],
  },
  sitemap: `${SITE_URL}/sitemap.xml`,
});

export default robots;
