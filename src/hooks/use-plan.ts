'use client';

import { listPlansOptions } from '@services/plans/plans.options';
import { resolvePlan } from '@services/plans/plans.utils';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
  Feature,
  type FeatureMetadataMap,
  type ListPlansResponse,
  Plan,
} from '@tokenizer/shared/types';

export const usePlan = (): Plan => {
  const { data: session } = useQuery(retrieveSessionOptions());

  return resolvePlan(session?.user);
};

// Prefetched by the root layout, hence always defined.
export const usePlans = (): ListPlansResponse =>
  useSuspenseQuery(listPlansOptions()).data;

export const useFeatureMetadata = <F extends Feature>(
  feature: F,
): FeatureMetadataMap[F] => usePlans()[usePlan()].features[feature];

export const useFeature = <F extends Feature>(
  feature: F,
  when: (metadata: FeatureMetadataMap[F]) => boolean = (metadata) =>
    metadata.access,
): boolean => when(useFeatureMetadata(feature));

export const useMaxSeats = (): number =>
  useFeatureMetadata(Feature.CreateGame).maxSeats;
