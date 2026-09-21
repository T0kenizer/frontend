import { RolesGuard } from '@components/guards/roles-guard';
import { HubShell } from '@components/layout/hub-shell';
import { ADMIN_ROLES } from '@tokenizer/shared/constants/users.constants';

export const metadata = {
  title: {
    template: `Admin - %s`,
    default: 'Admin',
  },
};

const AdminLayout: React.FC<React.PropsWithChildren> = async ({ children }) => (
  <RolesGuard roles={ADMIN_ROLES}>
    <HubShell>{children}</HubShell>
  </RolesGuard>
);

export default AdminLayout;
