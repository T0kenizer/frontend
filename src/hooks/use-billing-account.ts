import {
  listInvoicesOptions,
  retrieveSubscriptionOptions,
} from '@services/subscriptions/subscriptions.options';
import { useQuery } from '@tanstack/react-query';

export interface BillingAccount {
  /** Whether the user ever paid through Stripe, hence has a portal to open. */
  hasBillingAccount: boolean;
  isPending: boolean;
}

// No endpoint exposes the Stripe customer itself: a running subscription or a
// past invoice is what proves one exists.
export const useBillingAccount = (): BillingAccount => {
  const subscription = useQuery(retrieveSubscriptionOptions());
  const invoices = useQuery(listInvoicesOptions());

  if (subscription.data) return { hasBillingAccount: true, isPending: false };

  return {
    hasBillingAccount: !!invoices.data?.total,
    isPending: subscription.isPending || invoices.isPending,
  };
};
