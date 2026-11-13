'use client';

import ROUTES from '@constants/routes';
import { usePathname } from 'next/navigation';
import { createContext, useContext } from 'react';

export type AuthMode = 'signin' | 'signup';

const AuthModeContext = createContext<Nullable<AuthMode>>(null);

export const useAuthMode = (): AuthMode => {
  const mode = useContext(AuthModeContext);

  if (!mode)
    throw new Error('useAuthMode must be used within an <AuthModeProvider />');

  return mode;
};

export const AuthModeProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const pathname = usePathname();
  const mode = pathname.startsWith(ROUTES.auth.signUp()) ? 'signup' : 'signin';

  return <AuthModeContext value={mode}>{children}</AuthModeContext>;
};
