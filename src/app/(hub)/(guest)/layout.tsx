import {
  AuthLeftContainer,
  AuthMain,
  AuthRightContainer,
} from '@components/auth/auth-layout';
import { GuestGuard } from '@components/guards/guest-guard';

const GuestLayout: React.FC<React.PropsWithChildren> = async ({ children }) => (
  <GuestGuard>
    <AuthMain>
      <AuthLeftContainer />
      <AuthRightContainer>{children}</AuthRightContainer>
    </AuthMain>
  </GuestGuard>
);

export default GuestLayout;
