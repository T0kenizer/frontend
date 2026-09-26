'use client';

import { OAUTH_ERROR_PARAM, parseOAuthError } from '@lib/oauth';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

const TOAST_ID = 'oauth-error';

export const OAuthErrorToast: React.FC = () => {
  const t = useTranslations('Auth.oauthErrors');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const error = parseOAuthError(searchParams.get(OAUTH_ERROR_PARAM));

  useEffect(() => {
    if (!error) return;

    toast.error(t('title'), { id: TOAST_ID, description: t(error) });

    const params = new URLSearchParams(searchParams);
    params.delete(OAUTH_ERROR_PARAM);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [error, t, router, pathname, searchParams]);

  return null;
};
