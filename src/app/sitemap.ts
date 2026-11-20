import { SITE_URL } from '@constants/index';
import { LegalDocument } from '@constants/legal';
import ROUTES from '@constants/routes';
import type { MetadataRoute } from 'next';

const sitemap = (): MetadataRoute.Sitemap => {
  const lastModified = new Date();

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}${ROUTES.pricing()}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}${ROUTES.auth.signUp()}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}${ROUTES.auth.signIn()}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...Object.values(LegalDocument).map((document) => ({
      url: `${SITE_URL}${ROUTES.legal(document)}`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    })),
  ];
};

export default sitemap;
