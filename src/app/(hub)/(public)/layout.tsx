import { PublicShell } from '@components/layout/public-shell';
import { APP_NAME } from '@constants/index';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: `${APP_NAME} — You play. We count the chips.`,
  },
};

const PublicLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <PublicShell>{children}</PublicShell>
);

export default PublicLayout;
