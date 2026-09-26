import { RolesGuard } from '@components/guards/roles-guard';
import { AuthenticatedShell } from '@components/layout/authenticated-shell';
import { ADMIN_ROLES } from '@tokenizer/shared/constants/users.constants';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('Admin');

  return {
    robots: { index: false, follow: false },
    title: {
      template: `${t('metaTitle')} - %s`,
      default: t('metaTitle'),
    },
  };
};

const AdminLayout: React.FC<React.PropsWithChildren> = async ({ children }) => (
  <RolesGuard roles={ADMIN_ROLES}>
    <AuthenticatedShell>{children}</AuthenticatedShell>
  </RolesGuard>
);

export default AdminLayout;
