import ROUTES from '@constants/routes';
import { REDIRECT_URL_PARAM, sanitizeRedirectUrl } from '@lib/redirect-url';
import {
  parseSubscriptionOutcome,
  SUBSCRIPTION_OUTCOME_PARAM,
} from '@services/subscriptions/subscriptions.utils';
import {
  STRIPE_ERROR_PARAM,
  STRIPE_STATUS_PARAM,
} from '@tokenizer/shared/constants/subscriptions.constants';
import { CheckoutError } from '@tokenizer/shared/types';
import { type NextRequest, NextResponse } from 'next/server';

export const GET = (request: NextRequest) => {
  const { searchParams } = request.nextUrl;
  const redirectUrl =
    sanitizeRedirectUrl(searchParams.get(REDIRECT_URL_PARAM)) ??
    ROUTES.settings.subscription();
  const error = searchParams.get(STRIPE_ERROR_PARAM);

  let location: string;

  if (error === CheckoutError.Unauthenticated) {
    location = ROUTES.auth.signIn(redirectUrl);
  } else {
    const outcome = error
      ? 'failed'
      : parseSubscriptionOutcome(searchParams.get(STRIPE_STATUS_PARAM));

    const target = new URL(redirectUrl, request.nextUrl.origin);
    if (outcome) target.searchParams.set(SUBSCRIPTION_OUTCOME_PARAM, outcome);
    location = `${target.pathname}${target.search}${target.hash}`;
  }

  return new NextResponse(null, {
    status: 307,
    headers: { Location: location },
  });
};
