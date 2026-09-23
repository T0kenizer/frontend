import { Container } from '@components/layout/container';
import { Main } from '@components/layout/main';
import { SettingsNav } from '@components/settings/settings-nav';
import { SettingsSaveBarProvider } from '@components/settings/settings-save-bar';

const SettingsLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Main className="p-8 pb-32">
    <Container className="max-w-6xl space-y-0 p-0">
      <div className="space-y-1">
        <h1 className="font-heading text-foreground text-3xl font-bold tracking-tight text-balance">
          Settings
        </h1>
        <p className="text-muted-foreground text-sm font-light">
          Manage your profile, preferences, security and subscription.
        </p>
      </div>
      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-8">
        <SettingsNav />
        <SettingsSaveBarProvider>
          <div className="min-w-0">{children}</div>
        </SettingsSaveBarProvider>
      </div>
    </Container>
  </Main>
);

export default SettingsLayout;
