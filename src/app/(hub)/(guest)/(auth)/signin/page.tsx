import { SignInForm } from '@components/auth/forms/signin-form';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('Auth.signIn');

  return { title: t('metaTitle') };
};

const Page: React.FC = () => <SignInForm />;

export default Page;
