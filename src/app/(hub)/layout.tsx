import { Sidebar } from '@components/layout/sidebar';
import { SidebarInset, SidebarProvider } from '@components/ui/sidebar';

/**
 * The hub: everything around the game (home, auth, settings, admin) shares the
 * app chrome — sidebar plus per-section header. The `game` section lives
 * outside this group and renders fullscreen without it.
 */
const HubLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <SidebarProvider>
    <Sidebar />
    <SidebarInset>{children}</SidebarInset>
  </SidebarProvider>
);

export default HubLayout;
