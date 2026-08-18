import { GuestGuard } from '@components/guards/guest-guard';
import { Header } from '@components/layout/header';
import { Navbar } from '@components/layout/navbar';

const GuestLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <GuestGuard>
    <Header>
      <Navbar />
    </Header>
    {children}
  </GuestGuard>
);

export default GuestLayout;
