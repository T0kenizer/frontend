import { PATHNAME_HEADER } from '@/proxy';
import ROUTES from '@constants/routes';
import { REDIRECT_URL_PARAM, sanitizeRedirectUrl } from '@lib/redirect-url';
import { retrieveSessionCached } from '@services/sessions/sessions.api';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import 'server-only';

export const GuestGuard: React.FC<React.PropsWithChildren> = async ({
  children,
}) => {
  const session = await retrieveSessionCached('current');

  if (session) {
    const pathname = (await headers()).get(PATHNAME_HEADER) ?? '';
    const searchParams = new URL(pathname, 'http://localhost').searchParams;
    const redirectUrl = sanitizeRedirectUrl(
      searchParams.get(REDIRECT_URL_PARAM),
    );

    redirect(redirectUrl ?? ROUTES.dashboard());
  }

  return children;
};
