import { Header } from '@components/layout';
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
