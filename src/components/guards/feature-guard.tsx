import { listPlansCached } from '@services/plans/plans.api';
import { resolvePlan } from '@services/plans/plans.utils';
import { retrieveSessionCached } from '@services/sessions/sessions.api';
import { Feature } from '@tokenizer/shared/types';
import { notFound } from 'next/navigation';
import 'server-only';

interface FeatureGuardProps extends React.PropsWithChildren {
  features: readonly Feature[];
}

export const FeatureGuard: React.FC<FeatureGuardProps> = async ({
  features,
  children,
}) => {
  const [session, plans] = await Promise.all([
    retrieveSessionCached('current'),
    listPlansCached(),
  ]);
  const { features: granted } = plans[resolvePlan(session?.user)];

  if (!features.every((feature) => granted[feature].access)) return notFound();

  return children;
};
