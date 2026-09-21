'use client';

import ROUTES from '@constants/routes';
import { usePathname } from 'next/navigation';

export type AuthMode = 'signin' | 'signup';

/**
 * Which credential screen is on show.
 *
 * Read from the route rather than passed down, so the chrome shared by both
 * screens can live in a layout — which is what lets the mode switch stay
 * mounted, and therefore animate, across the navigation between them.
 */
export const useAuthMode = (): AuthMode => {
  const pathname = usePathname();

  return pathname.startsWith(ROUTES.auth.signUp()) ? 'signup' : 'signin';
};
