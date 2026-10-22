import type { RequesterError } from '@lib/requester';
import * as API from '@services/plans/plans.api';
import { queryOptions } from '@tanstack/react-query';
import type { ListPlansResponse } from '@tokenizer/shared/types';

export const PLANS_QUERY_KEYS = {
  list: () => ['plans', 'list'] as const,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as const satisfies Record<string, (...args: any[]) => readonly any[]>;

// The plans only change with a backend release: what the root layout
// prefetched holds for the whole visit.
export const listPlansOptions = () =>
  queryOptions<ListPlansResponse, RequesterError>({
    queryKey: PLANS_QUERY_KEYS.list(),
    queryFn: API.listPlans,
    staleTime: Infinity,
    gcTime: Infinity,
  });

export const listPlansServerOptions = () =>
  queryOptions<ListPlansResponse, RequesterError>({
    ...listPlansOptions(),
    queryFn: API.listPlansCached,
  });
