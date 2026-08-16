import { Container } from '@components/layout/container';
import { Main } from '@components/layout/main';
import { SettingsTabs } from '@components/settings/settings-tabs';
import { cardVariants } from '@components/ui/card';
import { cn } from '@lib/utils';

const SettingsLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Main className="p-8 pb-0">
    <Container className="flex flex-col p-0">
      <div className="space-y-1">
        <h1 className="font-heading text-foreground text-3xl font-bold tracking-tight text-balance">
          Settings
        </h1>
        <p className="text-muted-foreground text-sm font-light">
          Manage your profile, preferences, security and billing.
        </p>
      </div>
      <div
        className={cn(
          cardVariants({ variant: 'default' }),
          'flex-1 gap-0 rounded-b-none p-0',
        )}
      >
        <SettingsTabs />
        {children}
      </div>
    </Container>
  </Main>
);

export default SettingsLayout;
