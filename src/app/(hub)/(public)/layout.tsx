import { HubShell } from '@components/layout/hub-shell';

const PublicLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <HubShell>{children}</HubShell>
);

export default PublicLayout;
