import { ConfirmAccount } from '@components/auth/confirm-account';
import { SessionGuard } from '@components/guards/session-guard';
import ROUTES from '@constants/routes';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('Auth.confirmAccount');

  return { title: t('metaTitle') };
};

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

const Page: React.FC<PageProps> = async ({ searchParams }) => {
  const { token } = await searchParams;

  if (!token) redirect(ROUTES.dashboard());

  return (
    <SessionGuard>
      <ConfirmAccount token={token} />
    </SessionGuard>
  );
};

export default Page;
