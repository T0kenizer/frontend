import ROUTES from '@constants/routes';
import { retrieveSessionCached } from '@services/sessions/sessions.api';
import { ADMIN_ROLES } from '@tokenizer/shared/constants/users.constants';
import { redirect } from 'next/navigation';

export const metadata = {
  title: {
    template: `Admin - %s`,
    default: 'Admin',
  },
};

const AdminLayout: React.FC<React.PropsWithChildren> = async ({ children }) => {
  const session = await retrieveSessionCached('current');

  if (session?.user && !ADMIN_ROLES.includes(session?.user.role))
    redirect(ROUTES.home());

  return children;
};

export default AdminLayout;
