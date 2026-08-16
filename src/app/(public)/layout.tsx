import { Header } from '@components/layout/header';
import { Navbar } from '@components/layout/navbar';

const PublicLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <>
    <Header>
      <Navbar />
    </Header>
    {children}
  </>
);

export default PublicLayout;
