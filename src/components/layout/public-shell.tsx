import { Header } from '@components/layout/header';
import { PublicNavbar } from '@components/layout/navbar/public-navbar';
import { PublicFooter } from '@components/layout/public-footer';

export type PublicShellProps = React.PropsWithChildren;

export const PublicShell: React.FC<PublicShellProps> = ({ children }) => (
  <div className="flex min-h-full w-full flex-col self-start">
    <Header className="h-0">
      <PublicNavbar />
    </Header>
    {children}
    <PublicFooter />
  </div>
);
