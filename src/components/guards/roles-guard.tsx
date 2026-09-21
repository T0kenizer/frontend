import { retrieveSessionCached } from '@services/sessions/sessions.api';
import { UserRole } from '@tokenizer/shared/types';
import { notFound } from 'next/navigation';
import 'server-only';

interface RolesGuardProps extends React.PropsWithChildren {
  /** Roles allowed through; anyone else gets a 404 (the page "does not exist"). */
  roles: readonly UserRole[];
}

/**
 * Server wrapper: renders its children only when the signed-in user holds one
 * of the given roles; otherwise the route resolves to a not-found page.
 */
export const RolesGuard: React.FC<RolesGuardProps> = async ({
  roles,
  children,
}) => {
  const session = await retrieveSessionCached('current');

  if (!session?.user || !roles.includes(session.user.role)) return notFound();

  return children;
};
