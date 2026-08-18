import { SessionGuard } from '@components/guards/session-guard';

const NewGameLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <SessionGuard>{children}</SessionGuard>
);

export default NewGameLayout;
