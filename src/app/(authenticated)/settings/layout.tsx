import { Container } from '@components/layout/container';
import { Main } from '@components/layout/main';
import { SettingsTabs } from '@components/settings/settings-tabs';
import { cardVariants } from '@components/ui/card';
import { cn } from '@lib/utils';

const SettingsLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Main className="p-8 pb-0">
    <Container
      className={cn(cardVariants({ variant: 'default' }), 'rounded-b-none p-0')}
    >
      <SettingsTabs />
      {children}
    </Container>
  </Main>
);

export default SettingsLayout;
