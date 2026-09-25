import { SessionGuard } from '@components/guards/session-guard';
import { AuthenticatedShell } from '@components/layout/authenticated-shell';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const AuthenticatedLayout: React.FC<React.PropsWithChildren> = async ({
  children,
}) => (
  <SessionGuard>
    <AuthenticatedShell>{children}</AuthenticatedShell>
  </SessionGuard>
);

export default AuthenticatedLayout;
