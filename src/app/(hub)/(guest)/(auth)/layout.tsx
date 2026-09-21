import { AuthFooter } from '@components/auth/auth-footer';
import { AuthModeHeader } from '@components/auth/auth-mode-header';
import { AuthModeTabs } from '@components/auth/auth-mode-tabs';
import { AuthProviders } from '@components/auth/auth-providers';

const AuthModeLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <>
    <AuthModeTabs />
    <AuthModeHeader />
    <AuthProviders />
    {children}
    <AuthFooter />
  </>
);

export default AuthModeLayout;
