import { PATHNAME_HEADER } from '@/proxy';
import { Header } from '@components/layout/header';
import { Navbar } from '@components/layout/navbar';
import ROUTES from '@constants/routes';
import { retrieveSessionCached } from '@services/sessions/sessions.api';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

const AuthenticatedLayout: React.FC<React.PropsWithChildren> = async ({
  children,
}) => {
  const session = await retrieveSessionCached('current');

  if (!session) {
    const pathname = (await headers()).get(PATHNAME_HEADER);
    redirect(ROUTES.auth.signIn(pathname ?? undefined));
  }

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
