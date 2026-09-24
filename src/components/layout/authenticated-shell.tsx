import { Header } from '@components/layout/header';
import { Navbar } from '@components/layout/navbar';
import { Sidebar } from '@components/layout/sidebar';
import { SidebarInset, SidebarProvider } from '@components/ui/sidebar';

export type AuthenticatedShellProps = React.PropsWithChildren;

export const AuthenticatedShell: React.FC<AuthenticatedShellProps> = ({
  children,
}) => (
  <SidebarProvider>
    <Sidebar />
    <SidebarInset>
      <Header>
        <Navbar />
      </Header>
      {children}
    </SidebarInset>
  </SidebarProvider>
);
