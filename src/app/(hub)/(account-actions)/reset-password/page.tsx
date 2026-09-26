import { ResetPassword } from '@components/auth/reset-password';
import { GuestGuard } from '@components/guards/guest-guard';
import ROUTES from '@constants/routes';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('Auth.resetPassword');

  return { title: t('metaTitle') };
};

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

const Page: React.FC<PageProps> = async ({ searchParams }) => {
  const { token } = await searchParams;

  if (!token) redirect(ROUTES.auth.forgotPassword());

  return (
    <GuestGuard>
      <ResetPassword token={token} />
    </GuestGuard>
  );
};

export default Page;
