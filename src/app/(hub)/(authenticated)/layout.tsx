import { SessionGuard } from '@components/guards/session-guard';
import { AuthenticatedShell } from '@components/layout/authenticated-shell';

const AuthenticatedLayout: React.FC<React.PropsWithChildren> = async ({
  children,
}) => (
  <SessionGuard>
    <AuthenticatedShell>{children}</AuthenticatedShell>
  </SessionGuard>
);

export default AuthenticatedLayout;
