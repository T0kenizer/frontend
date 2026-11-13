'use client';

import { CancelSubscriptionDialog } from '@components/settings/dialogs/cancel-subscription-dialog';
import { SettingsSection } from '@components/settings/settings-section';
import { Button } from '@components/ui/button';
import { retrieveSubscriptionOptions } from '@services/subscriptions/subscriptions.options';
import { useQuery } from '@tanstack/react-query';
import { SubscriptionStatus } from '@tokenizer/shared/types';
import { useFormatter, useTranslations } from 'next-intl';

export const CancelSubscriptionSection: React.FC = () => {
  const t = useTranslations('Settings.subscription.cancel');
  const format = useFormatter();
  const { data: subscription } = useQuery(retrieveSubscriptionOptions());

  // A scheduled end is resumed from the notice.
  if (
    !subscription ||
    subscription.cancelAt ||
    subscription.status === SubscriptionStatus.Canceled
  )
    return null;

  const currentPeriodEnd = new Date(subscription.currentPeriodEnd);

  return (
    <SettingsSection
      variant="danger"
      title={t('title')}
      description={t('description')}
    >
      <div className="flex flex-wrap items-center gap-4 pt-1 pb-0.5">
        <p className="text-muted-foreground flex-1 text-xs font-light">
          {t('noCharge', {
            date: format.dateTime(currentPeriodEnd, { dateStyle: 'long' }),
          })}
        </p>
        <CancelSubscriptionDialog currentPeriodEnd={currentPeriodEnd}>
          <Button variant="destructive">{t('action')}</Button>
        </CancelSubscriptionDialog>
      </div>
    </SettingsSection>
  );
};
