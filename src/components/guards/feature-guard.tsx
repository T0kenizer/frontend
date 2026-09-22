import { resolvePlan } from '@lib/plan';
import { retrieveSessionCached } from '@services/sessions/sessions.api';
import { hasFeature } from '@tokenizer/shared/constants/plans.constants';
import { Feature } from '@tokenizer/shared/types';
import { notFound } from 'next/navigation';
import 'server-only';

interface FeatureGuardProps extends React.PropsWithChildren {
  /** Features required to pass; a signed-out visitor is `Plan.Anonymous`. */
  features: readonly Feature[];
}

/**
 * Server wrapper: renders its children only when the session's plan grants
 * every listed feature; otherwise the route resolves to a not-found page.
 * Page-level counterpart to `<Feature>`, mirroring `RolesGuard`.
 */
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
