import requester from '@lib/requester';
import type { ListPlansResponse } from '@tokenizer/shared/types';
import { cache } from 'react';

const BASE_URL = '/plans';

export const listPlans = async () =>
  requester().get<ListPlansResponse>(BASE_URL);

export const listPlansCached = cache(listPlans);
