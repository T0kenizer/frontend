import { RolesGuard } from '@components/guards/roles-guard';
import { ADMIN_ROLES } from '@tokenizer/shared/constants/users.constants';

export const metadata = {
  title: {
    template: `Admin - %s`,
    default: 'Admin',
  },
};

const AdminLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <RolesGuard roles={ADMIN_ROLES}>{children}</RolesGuard>
);

export default AdminLayout;
