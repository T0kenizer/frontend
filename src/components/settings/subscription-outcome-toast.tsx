'use client';

import {
  parseSubscriptionOutcome,
  SUBSCRIPTION_OUTCOME_PARAM,
  type SubscriptionOutcome,
} from '@services/subscriptions/subscriptions.utils';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

const TOAST_ID = 'subscription-outcome';

const TOAST_VARIANTS = {
  success: toast.success,
  cancelled: toast.info,
  failed: toast.error,
} as const satisfies Record<SubscriptionOutcome, unknown>;

export const SubscriptionOutcomeToast: React.FC = () => {
  const t = useTranslations('Settings.subscription.outcomes');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const outcome = parseSubscriptionOutcome(
    searchParams.get(SUBSCRIPTION_OUTCOME_PARAM),
  );

  useEffect(() => {
    if (!outcome) return;

    TOAST_VARIANTS[outcome](t(`${outcome}.title`), {
      id: TOAST_ID,
      description: t(`${outcome}.description`),
    });

    const params = new URLSearchParams(searchParams);
    params.delete(SUBSCRIPTION_OUTCOME_PARAM);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [outcome, t, router, pathname, searchParams]);

  return null;
};
