import ROUTES from '@constants/routes';
import { NEXT_PUBLIC_API_URL } from '@lib/env';
import { REDIRECT_URL_PARAM } from '@lib/redirect-url';
import { parseOffer } from '@services/plans/plans.utils';
import { retrieveSessionCached } from '@services/sessions/sessions.api';
import { STRIPE_OFFER_PARAM } from '@tokenizer/shared/constants/subscriptions.constants';
import { notFound, redirect } from 'next/navigation';

export type SubscriptionPageProps = {
  params: Promise<{ offer?: string[] }>;
};

const SubscriptionPage = async ({ params }: SubscriptionPageProps) => {
  const segments = (await params).offer ?? [];

  if (segments.length > 1) notFound();

  if (!segments.length) redirect(ROUTES.settings.subscription());

  const offer = parseOffer(segments[0]);

  if (!offer) notFound();

  const session = await retrieveSessionCached('current');

  if (!session) redirect(ROUTES.auth.signIn(ROUTES.subscription(offer)));

  const url = new URL(`${NEXT_PUBLIC_API_URL}/subscriptions/stripe`);
  url.searchParams.set(REDIRECT_URL_PARAM, ROUTES.settings.subscription());
  url.searchParams.set(STRIPE_OFFER_PARAM, offer);

  redirect(url.toString());
};

export default SubscriptionPage;
