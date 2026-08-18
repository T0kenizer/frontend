import { PATHNAME_HEADER } from '@/proxy';
import ROUTES from '@constants/routes';
import { retrieveSessionCached } from '@services/sessions/sessions.api';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import 'server-only';

/**
 * Server wrapper: renders its children only when a session is authenticated;
 * otherwise redirects to sign-in, preserving the current pathname so the user
 * comes back where they were.
 */
export const SessionGuard: React.FC<React.PropsWithChildren> = async ({
  children,
}) => {
  const session = await retrieveSessionCached('current');

  if (!session) {
    const pathname = (await headers()).get(PATHNAME_HEADER);
    redirect(ROUTES.auth.signIn(pathname ?? undefined));
  }

  return children;
};
