import { RolesGuard } from '@components/guards/roles-guard';
import { AuthenticatedShell } from '@components/layout/authenticated-shell';
import { ADMIN_ROLES } from '@tokenizer/shared/constants/users.constants';
import { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: {
    template: `Admin - %s`,
    default: 'Admin',
  },
};

const AdminLayout: React.FC<React.PropsWithChildren> = async ({ children }) => (
  <RolesGuard roles={ADMIN_ROLES}>
    <AuthenticatedShell>{children}</AuthenticatedShell>
  </RolesGuard>
);

export default AdminLayout;
