import { SessionGuard } from '@components/guards/session-guard';
import { Header } from '@components/layout/header';
import { Navbar } from '@components/layout/navbar';

const AuthenticatedLayout: React.FC<React.PropsWithChildren> = ({
  children,
}) => (
  <SessionGuard>
    <Header>
      <Navbar />
    </Header>
    {children}
  </SessionGuard>
);

export default AuthenticatedLayout;
