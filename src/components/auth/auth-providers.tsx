'use client';

import { GoogleAuthButton } from '@components/auth/google-auth-button';
import { OAuthErrorToast } from '@components/auth/oauth-error-toast';
import { FieldSeparator } from '@components/ui/field';
import { AuthMode, useAuthMode } from '@hooks/use-auth-mode';
import { cn } from '@lib/utils';

const COPY = {
  signin: 'Continue with Google',
  signup: 'Sign up with Google',
} as const satisfies Record<AuthMode, string>;

export type AuthProvidersProps = Omit<React.ComponentProps<'div'>, 'children'>;

export const AuthProviders: React.FC<AuthProvidersProps> = ({
  className,
  ...props
}) => {
  const mode = useAuthMode();

  return (
    <div
      data-slot="auth-providers"
      className={cn('space-y-5', className)}
      {...props}
    >
      <OAuthErrorToast />
      <GoogleAuthButton>{COPY[mode]}</GoogleAuthButton>

      <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card my-0">
        or
      </FieldSeparator>
    </div>
  );
};
