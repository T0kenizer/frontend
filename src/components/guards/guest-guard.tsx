import ROUTES from '@constants/routes';
import { retrieveSessionCached } from '@services/sessions/sessions.api';
import { redirect } from 'next/navigation';
import 'server-only';

export const GuestGuard: React.FC<React.PropsWithChildren> = async ({
  children,
}) => {
  const session = await retrieveSessionCached('current');

  if (session) redirect(ROUTES.dashboard());

  return children;
};
