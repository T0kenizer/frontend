import { USER_PLANS } from '@tokenizer/shared/constants/plans.constants';
import {
  Offer,
  Plan,
  type ListPlansResponse,
  type PlanPrice,
  type SerializedUser,
  type UserPlan,
} from '@tokenizer/shared/types';

export const resolvePlan = (user?: Nullable<SerializedUser>): Plan =>
  user?.plan ?? Plan.Anonymous;

/** How an offer reads in a `/subscription/[offer]` URL, e.g. `premium-monthly`. */
export const offerSlug = (offer: Offer): string =>
  offer.toLowerCase().replaceAll('_', '-');

/** The offer a `/subscription/[offer]` segment names. */
export const parseOffer = (segment: string): Nullable<Offer> =>
  Object.values(Offer).find((offer) => offerSlug(offer) === segment) ?? null;

/** The plan an offer grants, as `GET /plans` lists it. */
export const planOf = (
  plans: ListPlansResponse,
  offer: Offer,
): Optional<UserPlan> =>
  USER_PLANS.find((plan) =>
    plans[plan].offers.some((entry) => entry.offer === offer),
  );

/** A plan price as it is shown on the pricing page: `0 €`, `1,99 €`. */
export const formatPrice = (
  price: Nullable<PlanPrice>,
  locale: string,
): string => {
  const amount = price?.amount ?? 0;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: (price?.currency ?? 'eur').toUpperCase(),
    minimumFractionDigits: amount % 100 === 0 ? 0 : 2,
  }).format(amount / 100);
};
