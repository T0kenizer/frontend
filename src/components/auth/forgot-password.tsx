'use client';

import {
  AuthBackLink,
  AuthHeader,
  AuthSteps,
} from '@components/auth/auth-layout';
import { ForgotPasswordForm } from '@components/auth/forms/forgot-password-form';
import { PasswordResetSent } from '@components/auth/password-reset-sent';
import { PASSWORD_RESET_TTL_LABEL } from '@constants/password-resets';
import ROUTES from '@constants/routes';
import { useState } from 'react';

export const ForgotPassword: React.FC = () => {
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
        <AuthBackLink href={ROUTES.auth.signIn()}>Back to sign in</AuthBackLink>
        <AuthSteps current={1} total={3} label="Password reset" />
      </div>

      <AuthHeader
        title="Forgot your password?"
        description={`Give us the email on your account and we will send a link to choose a new one. The link is good for ${PASSWORD_RESET_TTL_LABEL}.`}
      />

      <ForgotPasswordForm defaultEmail={email} onSent={handleSent} />
    </>
  );
};
