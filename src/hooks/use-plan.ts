'use client';

import { resolvePlan } from '@lib/plan';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { useQuery } from '@tanstack/react-query';
import {
  Feature,
  Plan,
  type FeatureMetadataMap,
} from '@tokenizer/shared/types';
import {
  featureMetadata,
  maxSeatsFor,
} from '@tokenizer/shared/utils/plans.utils';

export const usePlan = (): Plan => {
  const { data: session } = useQuery(retrieveSessionOptions());

  return resolvePlan(session?.user);
};

export const useFeatureMetadata = <F extends Feature>(
  feature: F,
): FeatureMetadataMap[F] => featureMetadata(usePlan(), feature);

export const useFeature = <F extends Feature>(
  feature: F,
  when: (metadata: FeatureMetadataMap[F]) => boolean = (metadata) =>
    metadata.access,
): boolean => when(useFeatureMetadata(feature));

export const useMaxSeats = (): number => maxSeatsFor(usePlan());
