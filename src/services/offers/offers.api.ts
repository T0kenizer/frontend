import requester from '@lib/requester';
import { listOffersResponseSchema } from '@tokenizer/shared/schemas';
import type { ListOffersResponse } from '@tokenizer/shared/types';
import { cache } from 'react';

const BASE_URL = '/offers';

export const listOffers = async (): Promise<ListOffersResponse> =>
  listOffersResponseSchema.parse(await requester().get<unknown>(BASE_URL));

export const listOffersCached = cache(listOffers);
