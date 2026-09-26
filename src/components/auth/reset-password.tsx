'use client';

import {
  AuthHeader,
  AuthLoadError,
  AuthLoading,
  AuthSeal,
  AuthSteps,
} from '@components/auth/auth-layout';
import { ResetPasswordForm } from '@components/auth/forms/reset-password-form';
import { Button } from '@components/ui/button';
import { PASSWORD_RESET_TTL_HOURS } from '@constants/password-resets';
import ROUTES from '@constants/routes';
import { validateResetTokenOptions } from '@services/password-resets/password-resets.options';
import { useQuery } from '@tanstack/react-query';
import { Check, Link2Off } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';

export interface ResetPasswordProps {
  token: string;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ token }) => {
  const tAuth = useTranslations('Auth');
  const t = useTranslations('Auth.resetPassword');
  const [isDone, setIsDone] = useState(false);
  const { isLoading, error, refetch, isRefetching } = useQuery(
    validateResetTokenOptions(token),
  );

  if (isDone)
    return (
      <>
        <div className="space-y-5">
          <AuthSeal tone="success">
            <Check strokeWidth={2.8} />
          </AuthSeal>

          <AuthHeader
            title={t('done.title')}
            description={t('done.description')}
          />
        </div>

        <Button size="lg" className="h-11 w-full text-[0.9375rem]" asChild>
          <Link href={ROUTES.auth.signIn()}>{t('done.signIn')}</Link>
        </Button>

        <p className="text-muted-foreground/80 text-center text-[0.6875rem] leading-relaxed">
          {t.rich('done.notYou', {
            link: (chunks) => (
              <Link
                href={ROUTES.auth.forgotPassword()}
                className="text-primary font-semibold hover:underline"
              >
                {chunks}
              </Link>
            ),
          })}
        </p>
      </>
    );

  if (isLoading) return <AuthLoading label={t('loading')} />;

  if (error && error.status >= 500)
    return <AuthLoadError onRetry={refetch} isRetrying={isRefetching} />;

  if (error)
    return (
      <>
        <div className="space-y-5">
          <AuthSeal tone="danger">
            <Link2Off />
          </AuthSeal>

          <AuthHeader
            title={t('invalid.title')}
            description={t('invalid.description', {
              hours: PASSWORD_RESET_TTL_HOURS,
            })}
          />
        </div>

        <Button size="lg" className="h-11 w-full text-[0.9375rem]" asChild>
          <Link href={ROUTES.auth.forgotPassword()}>{t('invalid.action')}</Link>
        </Button>
      </>
    );

  return (
    <>
      <AuthSteps current={3} total={3} label={tAuth('passwordResetSteps')} />

      <AuthHeader title={t('title')} description={t('description')} />

      <ResetPasswordForm token={token} onReset={() => setIsDone(true)} />
    </>
  );
};
