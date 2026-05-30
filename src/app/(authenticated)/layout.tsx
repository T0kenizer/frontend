import ROUTES from '@constants/routes';
import { retrieveSessionCached } from '@services/sessions/sessions.api';
import { redirect } from 'next/navigation';

const AuthenticatedLayout: React.FC<React.PropsWithChildren> = async ({
  children,
}) => {
  const session = await retrieveSessionCached('current');

  if (!session) redirect(ROUTES.home());

  return <>{children}</>;
};

export default AuthenticatedLayout;
