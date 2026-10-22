import requester, { RequesterError } from '@lib/requester';
import type {
  CancelSubscriptionResponse,
  ListInvoicesQuery,
  ListInvoicesResponse,
  ResumeSubscriptionResponse,
  RetrievePaymentMethodResponse,
  RetrieveSubscriptionResponse,
} from '@tokenizer/shared/types';

const BASE_URL = '/subscriptions';

export const retrieveSubscription = async (): Promise<
  Nullable<RetrieveSubscriptionResponse>
> => {
  try {
    return await requester().get<RetrieveSubscriptionResponse>(
      `${BASE_URL}/current`,
    );
  } catch (error) {
    if (error instanceof RequesterError && error.status === 404) return null;
    throw error;
  }
};

export const cancelSubscription = async () =>
  requester().post<CancelSubscriptionResponse>(
    `${BASE_URL}/current/cancel`,
    {},
  );

export const resumeSubscription = async () =>
  requester().post<ResumeSubscriptionResponse>(
    `${BASE_URL}/current/resume`,
    {},
  );

export const listInvoices = async (query: Partial<ListInvoicesQuery> = {}) =>
  requester().get<ListInvoicesResponse>(`${BASE_URL}/invoices`, {
    params: query,
  });

export const retrievePaymentMethod = async (): Promise<
  Nullable<RetrievePaymentMethodResponse>
> => {
  try {
    return await requester().get<RetrievePaymentMethodResponse>(
      `${BASE_URL}/payment-method`,
    );
  } catch (error) {
    if (error instanceof RequesterError && error.status === 404) return null;
    throw error;
  }
};
