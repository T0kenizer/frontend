import { PublicShell } from '@components/layout/public-shell';
import { APP_NAME } from '@constants/index';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('Landing');

  return {
    title: { absolute: `${APP_NAME} — ${t('metaTitle')}` },
  };
};

const PublicLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <PublicShell>{children}</PublicShell>
);

export default PublicLayout;
