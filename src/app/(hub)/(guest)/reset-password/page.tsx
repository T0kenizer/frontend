import { ResetPassword } from '@components/auth/reset-password';
import ROUTES from '@constants/routes';
import { redirect } from 'next/navigation';

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

const Page: React.FC<PageProps> = async ({ searchParams }) => {
  const { token } = await searchParams;

  if (!token) redirect(ROUTES.auth.forgotPassword());

  return <ResetPassword token={token} />;
};

export default Page;
