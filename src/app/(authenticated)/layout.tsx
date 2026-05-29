import { Header } from '@components/layout';
import { Navbar } from '@components/layout/navbar';
import ROUTES from '@constants/routes';
import { retrieveSessionCached } from '@services/sessions/sessions.api';
import { redirect } from 'next/navigation';

const AuthenticatedLayout: React.FC<React.PropsWithChildren> = async ({
  children,
}) => {
  const session = await retrieveSessionCached('current');

  if (!session) redirect(ROUTES.home());

  return (
    <>
      <Header>
        <Navbar />
      </Header>
      {children}
    </>
  );
};

export default AuthenticatedLayout;
