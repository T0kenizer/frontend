import { resolvePlan } from '@lib/plan';
import { retrieveSessionCached } from '@services/sessions/sessions.api';
import { Feature } from '@tokenizer/shared/types';
import { hasFeature } from '@tokenizer/shared/utils/plans.utils';
import { notFound } from 'next/navigation';
import 'server-only';

interface FeatureGuardProps extends React.PropsWithChildren {
  features: readonly Feature[];
}

export const FeatureGuard: React.FC<FeatureGuardProps> = async ({
  features,
  children,
}) => {
  const session = await retrieveSessionCached('current');
  const plan = resolvePlan(session?.user);

  if (!features.every((feature) => hasFeature(plan, feature)))
    return notFound();

  return children;
};
