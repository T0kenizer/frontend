'use client';

import { type AuthMode, useAuthMode } from '@components/auth/auth-mode-context';
import { GoogleAuthButton } from '@components/auth/google-auth-button';
import { OAuthErrorToast } from '@components/auth/oauth-error-toast';
import { FieldSeparator } from '@components/ui/field';
import { cn } from '@lib/utils';
import { useTranslations } from 'next-intl';

const COPY = {
  signin: 'signIn.google',
  signup: 'signUp.google',
} as const satisfies Record<AuthMode, string>;

export type AuthProvidersProps = Omit<React.ComponentProps<'div'>, 'children'>;

export const AuthProviders: React.FC<AuthProvidersProps> = ({
  className,
  ...props
}) => {
  const t = useTranslations('Auth');
  const mode = useAuthMode();

  return (
    <div
      data-slot="auth-providers"
      className={cn('space-y-5', className)}
      {...props}
    >
      <OAuthErrorToast />
      <GoogleAuthButton>{t(COPY[mode])}</GoogleAuthButton>

      <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card my-0">
        {t('providersSeparator')}
      </FieldSeparator>
    </div>
  );
};
