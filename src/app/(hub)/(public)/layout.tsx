import { PublicShell } from '@components/layout/public-shell';

const PublicLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <PublicShell>{children}</PublicShell>
);

export default PublicLayout;
