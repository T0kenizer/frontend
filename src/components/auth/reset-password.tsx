'use client';

import { AuthHeader, AuthSeal, AuthSteps } from '@components/auth/auth-layout';
import { ResetPasswordForm } from '@components/auth/forms/reset-password-form';
import { Button } from '@components/ui/button';
import { PASSWORD_RESET_TTL_LABEL } from '@constants/password-resets';
import ROUTES from '@constants/routes';
import { validateResetTokenOptions } from '@services/password-resets/password-resets.options';
import { useQuery } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export interface ResetPasswordProps {
  token: string;
}

/**
 * The far half of recovery: everything that hangs off the link in the mail.
 *
 * Three outcomes share the screen — a spent or stale link, the form, and the
 * confirmation — and each one brings its own heading. That is the point of
 * orchestrating them here: the old page announced "Choose a new password" and
 * then told the user underneath that their link was dead.
 */
export const ResetPassword: React.FC<ResetPasswordProps> = ({ token }) => {
  const [isDone, setIsDone] = useState(false);
  const { isLoading, isError } = useQuery(validateResetTokenOptions(token));

  // Checked ahead of the validation query: the token is spent the moment the
  // reset lands, so re-reading it now would report a link that just worked as
  // invalid.
  if (isDone)
    return (
      <>
        <div className="space-y-5">
          <AuthSeal tone="success">
            <Check strokeWidth={2.8} />
          </AuthSeal>

          <AuthHeader
            title="Password changed"
            description="Your new password is saved. You can sign in with it right away."
          />
        </div>

        <Button size="lg" className="h-11 w-full text-[0.9375rem]" asChild>
          <Link href={ROUTES.auth.signIn()}>Sign in</Link>
        </Button>

        <p className="text-muted-foreground/80 text-center text-[0.6875rem] leading-relaxed">
          Did not ask for this?{' '}
          <Link
            href={ROUTES.auth.forgotPassword()}
            className="text-primary font-semibold hover:underline"
          >
            Reset it again
          </Link>{' '}
          straight away.
        </p>
      </>
    );

  if (isLoading) return null;

  if (isError)
    return (
      <>
        <AuthHeader
          title="This link is no longer valid"
          description={`Reset links are single-use and last ${PASSWORD_RESET_TTL_LABEL}. Ask for a fresh one and it will land in your inbox.`}
        />

        <Button variant="secondary" className="h-10 w-full" asChild>
          <Link href={ROUTES.auth.forgotPassword()}>Request a new link</Link>
        </Button>
      </>
    );

  return (
    <>
      <AuthSteps current={3} total={3} label="Password reset" />

      <AuthHeader
        title="Choose a new password"
        description="Pick one you have not used before. Your games and your history stay exactly as they were."
      />

      <ResetPasswordForm token={token} onReset={() => setIsDone(true)} />
    </>
  );
};
