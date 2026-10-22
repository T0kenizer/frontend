import ROUTES from '@constants/routes';
import { NEXT_PUBLIC_API_URL } from '@lib/env';
import { REDIRECT_URL_PARAM } from '@lib/redirect-url';

export const SUBSCRIPTION_OUTCOME_PARAM = 'subscription';

export const SUBSCRIPTION_OUTCOMES = [
  'success',
  'cancelled',
  'failed',
] as const;

export type SubscriptionOutcome = (typeof SUBSCRIPTION_OUTCOMES)[number];

export const parseSubscriptionOutcome = (
  value: Nullable<string>,
): Nullable<SubscriptionOutcome> =>
  SUBSCRIPTION_OUTCOMES.find((outcome) => outcome === value) ?? null;

/** Out to the Stripe customer portal, back to the subscription settings. */
export const buildBillingPortalUrl = (): string => {
  const url = new URL(`${NEXT_PUBLIC_API_URL}/subscriptions/portal`);
  url.searchParams.set(REDIRECT_URL_PARAM, ROUTES.settings.subscription());

  return url.toString();
};
