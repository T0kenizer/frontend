import { AuthFooter } from '@components/auth/auth-footer';
import { AuthModeProvider } from '@components/auth/auth-mode-context';
import { AuthModeHeader } from '@components/auth/auth-mode-header';
import { AuthModeTabs } from '@components/auth/auth-mode-tabs';
import { AuthProviders } from '@components/auth/auth-providers';

const AuthModeLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <AuthModeProvider>
    <AuthModeTabs />
    <AuthModeHeader />
    <AuthProviders />
    {children}
    <AuthFooter />
  </AuthModeProvider>
);

export default AuthModeLayout;
