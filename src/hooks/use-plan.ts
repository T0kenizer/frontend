'use client';

import { resolvePlan } from '@lib/plan';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { useQuery } from '@tanstack/react-query';
import {
  featureMetadata,
  maxSeatsFor,
  type FeatureMetadataMap,
} from '@tokenizer/shared/constants/plans.constants';
import { Feature, Plan } from '@tokenizer/shared/types';

/** The signed-in session's plan, or `Plan.Anonymous` when signed out. */
export const usePlan = (): Plan => {
  const { data: session } = useQuery(retrieveSessionOptions());

  return resolvePlan(session?.user);
};

/** `feature`'s full metadata under the current plan, typed to its own shape. */
export const useFeatureMetadata = <F extends Feature>(
  feature: F,
): FeatureMetadataMap[F] => featureMetadata(usePlan(), feature);

/**
 * Whether the current plan grants `feature` — or, for a sub-feature, whatever
 * `when` selects out of its metadata (e.g. `(m) => m.canCustomize`). This — not
 * `usePlan() === Plan.X` — is how a component asks "can I do this": the answer
 * lives in `@tokenizer/shared/constants/plans.constants`, never in the
 * component.
 */
export const useFeature = <F extends Feature>(
  feature: F,
  when: (metadata: FeatureMetadataMap[F]) => boolean = (metadata) =>
    metadata.access,
): boolean => when(useFeatureMetadata(feature));

/** How many seats the current plan may declare when creating a game. */
export const useMaxSeats = (): number => maxSeatsFor(usePlan());
