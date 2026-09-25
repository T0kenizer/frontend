import { SITE_URL } from '@constants/index';
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
  ];
};

export default sitemap;
