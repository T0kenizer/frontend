'use client';

import { AuthHeader, type AuthHeaderProps } from '@components/auth/auth-layout';
import { type AuthMode, useAuthMode } from '@components/auth/auth-mode-context';
import { useTranslations } from 'next-intl';

const COPY = {
  signin: { title: 'signIn.title', description: 'signIn.description' },
  signup: { title: 'signUp.title', description: 'signUp.description' },
} as const satisfies Record<AuthMode, { title: string; description: string }>;

export type AuthModeHeaderProps = Omit<
  AuthHeaderProps,
  'title' | 'description'
>;

export const AuthModeHeader: React.FC<AuthModeHeaderProps> = (props) => {
  const t = useTranslations('Auth');
  const mode = useAuthMode();
  const { title, description } = COPY[mode];

  return (
    <AuthHeader title={t(title)} description={t(description)} {...props} />
  );
};
