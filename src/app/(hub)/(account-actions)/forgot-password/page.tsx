import { ForgotPassword } from '@components/auth/forgot-password';
import { GuestGuard } from '@components/guards/guest-guard';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('Auth.forgotPassword');

  return { title: t('metaTitle') };
};

const Page: React.FC = () => (
  <GuestGuard>
    <ForgotPassword />
  </GuestGuard>
);

export default Page;
