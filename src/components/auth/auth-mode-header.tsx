'use client';

import { AuthHeader, AuthHeaderProps } from '@components/auth/auth-layout';
import { AuthMode, useAuthMode } from '@hooks/use-auth-mode';

const COPY = {
  signin: {
    title: 'Welcome back',
    description: 'Pick your game up right where you left it.',
  },
  signup: {
    title: 'Open your first table',
    description: 'Free for your first night. No card required.',
  },
} as const satisfies Record<
  AuthMode,
  Pick<AuthHeaderProps, 'title' | 'description'>
>;

export type AuthModeHeaderProps = Omit<
  AuthHeaderProps,
  'title' | 'description'
>;

/**
 * The heading for whichever credential screen is on show. Like the mode switch
 * below it, it reads the mode off the route so it can live in the shared layout
 * instead of being restated by each page.
 */
export const AuthModeHeader: React.FC<AuthModeHeaderProps> = (props) => {
  const mode = useAuthMode();

  return <AuthHeader {...COPY[mode]} {...props} />;
};
