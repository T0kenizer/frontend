import { SessionGuard } from '@components/guards/session-guard';
import { HubShell } from '@components/layout/hub-shell';

const AuthenticatedLayout: React.FC<React.PropsWithChildren> = async ({
  children,
}) => (
  <SessionGuard>
    <HubShell>{children}</HubShell>
  </SessionGuard>
);

export default AuthenticatedLayout;
