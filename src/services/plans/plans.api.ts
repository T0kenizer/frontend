import requester from '@lib/requester';
import { listPlansResponseSchema } from '@tokenizer/shared/schemas';
import type { ListPlansResponse } from '@tokenizer/shared/types';
import { cache } from 'react';

const BASE_URL = '/plans';

// Parsed, not just typed: JSON has no Infinity, so an unlimited limit arrives
// as null and only the schema reads it back as Infinity.
export const listPlans = async (): Promise<ListPlansResponse> =>
  listPlansResponseSchema.parse(await requester().get<unknown>(BASE_URL));

export const listPlansCached = cache(listPlans);
