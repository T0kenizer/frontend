import { Main } from '@components/layout';
import { DeleteAccountConfirm } from '@components/settings/delete-account-confirm';
import ROUTES from '@constants/routes';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Delete Account',
};

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

const Page: React.FC<PageProps> = async ({ searchParams }) => {
  const { token } = await searchParams;

  if (!token) redirect(ROUTES.settings());

  return (
    <Main>
      <DeleteAccountConfirm token={token} />
    </Main>
  );
};

export default Page;
