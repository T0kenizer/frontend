import type { RequesterError } from '@lib/requester';
import * as API from '@services/offers/offers.api';
import { queryOptions } from '@tanstack/react-query';
import type { ListOffersResponse } from '@tokenizer/shared/types';

export const OFFERS_QUERY_KEYS = {
  list: () => ['offers', 'list'] as const,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as const satisfies Record<string, (...args: any[]) => readonly any[]>;

// The offers only change with a backend release: what the pricing page
// prefetched holds for the whole visit.
export const listOffersOptions = () =>
  queryOptions<ListOffersResponse, RequesterError>({
    queryKey: OFFERS_QUERY_KEYS.list(),
    queryFn: API.listOffers,
    staleTime: Infinity,
    gcTime: Infinity,
  });

export const listOffersServerOptions = () =>
  queryOptions<ListOffersResponse, RequesterError>({
    ...listOffersOptions(),
    queryFn: API.listOffersCached,
  });
