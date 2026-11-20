import { getQueryClient } from '@lib/query-client';
import type { RequesterError } from '@lib/requester';
import * as API from '@services/subscriptions/subscriptions.api';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { LIST_INVOICES_DEFAULT_LIMIT } from '@tokenizer/shared/constants/subscriptions.constants';
import type {
  CancelSubscriptionResponse,
  ListInvoicesQuery,
  ListInvoicesResponse,
  ResumeSubscriptionResponse,
  RetrievePaymentMethodResponse,
  RetrieveSubscriptionResponse,
} from '@tokenizer/shared/types';

export const SUBSCRIPTIONS_QUERY_KEYS = {
  retrieve: () => ['subscriptions', 'current'] as const,
  listInvoices: (query: ListInvoicesQuery) =>
    ['subscriptions', 'invoices', query] as const,
  retrievePaymentMethod: () => ['subscriptions', 'payment-method'] as const,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as const satisfies Record<string, (...args: any[]) => readonly any[]>;

export const SUBSCRIPTIONS_MUTATION_KEYS = {
  cancel: () => ['subscriptions', 'cancel'] as const,
  resume: () => ['subscriptions', 'resume'] as const,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as const satisfies Record<string, (...args: any[]) => readonly any[]>;

export const retrieveSubscriptionOptions = () =>
  queryOptions<Nullable<RetrieveSubscriptionResponse>, RequesterError>({
    queryKey: SUBSCRIPTIONS_QUERY_KEYS.retrieve(),
    queryFn: API.retrieveSubscription,
  });

export const listInvoicesOptions = ({
  offset = 0,
  limit = LIST_INVOICES_DEFAULT_LIMIT,
}: Partial<ListInvoicesQuery> = {}) =>
  queryOptions<ListInvoicesResponse, RequesterError>({
    queryKey: SUBSCRIPTIONS_QUERY_KEYS.listInvoices({ offset, limit }),
    queryFn: () => API.listInvoices({ offset, limit }),
  });

export const retrievePaymentMethodOptions = () =>
  queryOptions<Nullable<RetrievePaymentMethodResponse>, RequesterError>({
    queryKey: SUBSCRIPTIONS_QUERY_KEYS.retrievePaymentMethod(),
    queryFn: API.retrievePaymentMethod,
  });

const setSubscription = (subscription: RetrieveSubscriptionResponse) =>
  getQueryClient().setQueryData(
    SUBSCRIPTIONS_QUERY_KEYS.retrieve(),
    subscription,
  );

export const cancelSubscriptionOptions = () =>
  mutationOptions<CancelSubscriptionResponse, RequesterError>({
    mutationKey: SUBSCRIPTIONS_MUTATION_KEYS.cancel(),
    mutationFn: API.cancelSubscription,
    onSuccess: setSubscription,
  });

export const resumeSubscriptionOptions = () =>
  mutationOptions<ResumeSubscriptionResponse, RequesterError>({
    mutationKey: SUBSCRIPTIONS_MUTATION_KEYS.resume(),
    mutationFn: API.resumeSubscription,
    onSuccess: setSubscription,
  });
