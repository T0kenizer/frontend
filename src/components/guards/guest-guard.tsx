import ROUTES from '@constants/routes';
import { retrieveSessionCached } from '@services/sessions/sessions.api';
import { redirect } from 'next/navigation';
import 'server-only';

/**
 * Server wrapper: renders its children only for unauthenticated visitors; a
 * signed-in user is sent back home (sign-in/sign-up pages, etc.).
 */
export const GuestGuard: React.FC<React.PropsWithChildren> = async ({
  children,
}) => {
  const session = await retrieveSessionCached('current');

  if (session) redirect(ROUTES.home());

  return children;
};
