'use client';

import { useFeature } from '@hooks/use-plan';
import type { FeatureMetadataMap } from '@tokenizer/shared/constants/plans.constants';
import { Feature as FeatureFlag } from '@tokenizer/shared/types';

export interface FeatureProps<F extends FeatureFlag = FeatureFlag>
  extends React.PropsWithChildren {
  feature: F;
  when?: (metadata: FeatureMetadataMap[F]) => boolean;
  fallback?: React.ReactNode;
}

export function Feature<F extends FeatureFlag = FeatureFlag>({
  feature,
  when,
  fallback = null,
  children,
}: FeatureProps<F>) {
  return useFeature(feature, when) ? children : fallback;
}
