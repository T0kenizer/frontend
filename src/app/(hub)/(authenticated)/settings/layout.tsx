import { Container } from '@components/layout/container';
import { Main } from '@components/layout/main';
import { SettingsNav } from '@components/settings/settings-nav';
import { SettingsSaveBarProvider } from '@components/settings/settings-save-bar';
import { SubscriptionOutcomeToast } from '@components/settings/subscription-outcome-toast';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

const SettingsLayout: React.FC<React.PropsWithChildren> = async ({
  children,
}) => {
  const t = await getTranslations('Settings');

  return (
    <Main className="p-8 pb-32">
      <Suspense>
        <SubscriptionOutcomeToast />
      </Suspense>
      <Container className="max-w-6xl space-y-0 p-0">
        <div className="space-y-1">
          <h1 className="font-heading text-foreground text-3xl font-bold tracking-tight text-balance">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-sm font-light">
            {t('description')}
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
};

export default SettingsLayout;
