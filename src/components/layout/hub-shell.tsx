import { Header } from '@components/layout/header';
import { Navbar } from '@components/layout/navbar';
import { Sidebar } from '@components/layout/sidebar';
import { SidebarInset, SidebarProvider } from '@components/ui/sidebar';

export type HubShellProps = React.PropsWithChildren;

export const HubShell: React.FC<HubShellProps> = ({ children }) => (
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
