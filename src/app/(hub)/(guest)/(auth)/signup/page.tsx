import { SignUpForm } from '@components/auth/forms/signup-form';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('Auth.signUp');

  return { title: t('metaTitle') };
};

const Page: React.FC = () => <SignUpForm />;

export default Page;
