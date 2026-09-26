'use client';

import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert';
import { OAUTH_ERROR_PARAM, parseOAuthError } from '@lib/oauth';
import { CircleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

/** Explains why the Google round trip came back to sign-in instead of in. */
export const OAuthErrorAlert: React.FC = () => {
  const t = useTranslations('Auth.oauthErrors');
  const searchParams = useSearchParams();
  const error = parseOAuthError(searchParams.get(OAUTH_ERROR_PARAM));

  if (!error) return null;

  return (
    <Alert variant="destructive" role="alert">
      <CircleAlert />
      <AlertTitle>{t('title')}</AlertTitle>
      <AlertDescription>{t(error)}</AlertDescription>
    </Alert>
  );
};
