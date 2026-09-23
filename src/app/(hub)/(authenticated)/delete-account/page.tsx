import { DeleteAccountConfirmation } from '@components/auth/delete-account-confirmation';
import { Main } from '@components/layout/main';
import ROUTES from '@constants/routes';
import { redirect } from 'next/navigation';

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

const Page: React.FC<PageProps> = async ({ searchParams }) => {
  const { token } = await searchParams;

  if (!token) redirect(ROUTES.settings.security());

  return (
    <Main>
      <DeleteAccountConfirmation token={token} />
    </Main>
  );
};

export default Page;
