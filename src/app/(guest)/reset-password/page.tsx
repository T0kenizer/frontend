import { ResetPasswordForm } from '@components/auth/forms/reset-password-form';
import { Main } from '@components/layout';
import ROUTES from '@constants/routes';
import { redirect } from 'next/navigation';

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

const Page: React.FC<PageProps> = async ({ searchParams }) => {
  const { token } = await searchParams;

  if (!token) redirect(ROUTES.auth.forgotPassword());

  return (
    <Main>
      <ResetPasswordForm token={token} />
    </Main>
  );
};

export default Page;
