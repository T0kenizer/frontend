'use client';

import {
  AuthBackLink,
  AuthHeader,
  AuthSteps,
} from '@components/auth/auth-layout';
import { ForgotPasswordForm } from '@components/auth/forms/forgot-password-form';
import { PasswordResetSent } from '@components/auth/password-reset-sent';
import { PASSWORD_RESET_TTL_HOURS } from '@constants/password-resets';
import ROUTES from '@constants/routes';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export const ForgotPassword: React.FC = () => {
  const tAuth = useTranslations('Auth');
  const t = useTranslations('Auth.forgotPassword');
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSent = (address: string) => {
    setEmail(address);
    setIsSent(true);
  };

  if (isSent)
    return (
      <PasswordResetSent email={email} onChangeEmail={() => setIsSent(false)} />
    );

  return (
    <>
      <div className="space-y-4">
        <AuthBackLink href={ROUTES.auth.signIn()}>
          {t('backToSignIn')}
        </AuthBackLink>
        <AuthSteps current={1} total={3} label={tAuth('passwordResetSteps')} />
      </div>

      <AuthHeader
        title={t('title')}
        description={t('description', { hours: PASSWORD_RESET_TTL_HOURS })}
      />

      <ForgotPasswordForm defaultEmail={email} onSent={handleSent} />
    </>
  );
};
