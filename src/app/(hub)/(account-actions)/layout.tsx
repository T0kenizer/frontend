import {
  AuthLeftContainer,
  AuthMain,
  AuthRightContainer,
} from '@components/auth/auth-layout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const AccountActionsLayout: React.FC<React.PropsWithChildren> = ({
  children,
}) => (
  <AuthMain>
    <AuthLeftContainer />
    <AuthRightContainer>{children}</AuthRightContainer>
  </AuthMain>
);

export default AccountActionsLayout;
