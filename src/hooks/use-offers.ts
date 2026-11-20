'use client';

import { listOffersOptions } from '@services/offers/offers.options';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { ListOffersResponse } from '@tokenizer/shared/types';

// Prefetched by `OffersProvider`, hence always defined below it.
export const useOffers = (): ListOffersResponse =>
  useSuspenseQuery(listOffersOptions()).data;
