'use client';

import { useOffers } from '@hooks/use-offers';
import { usePlan, usePlans } from '@hooks/use-plan';
import {
  BillingInterval,
  Feature,
  GameMode,
  Offer,
  Plan,
  type OfferPrice,
  type UserPlan,
} from '@tokenizer/shared/types';
import { useSearchParams } from 'next/navigation';

export interface PricingOffer {
  plan: UserPlan;
  offer: Nullable<Offer>;
  price: Nullable<OfferPrice>;
  intervals: BillingInterval[];
  maxSeats: number;
  // Infinity when the plan is unlimited.
  maxActiveGames: number;
  canCreate: boolean;
  canJoin: boolean;
  poker: boolean;
  sandbox: boolean;
  isCurrent: boolean;
}

const OFFERED_PLANS = [Plan.Free, Plan.Premium, Plan.Founder] as const;

const BILLING_PARAM = 'billing';

export const useBillingInterval = (): [
  BillingInterval,
  (interval: BillingInterval) => void,
] => {
  const searchParams = useSearchParams();
  const interval =
    searchParams.get(BILLING_PARAM) === BillingInterval.Year
      ? BillingInterval.Year
      : BillingInterval.Month;

  const setBillingInterval = (next: BillingInterval) => {
    const url = new URL(window.location.href);
    url.searchParams.set(BILLING_PARAM, next);
    window.history.replaceState(null, '', url);
  };

  return [interval, setBillingInterval];
};

export const useYearlySavings = (): Nullable<number> => {
  const offers = useOffers().filter(({ plan }) => plan === Plan.Premium);
  const priceOf = (interval: BillingInterval) =>
    offers.find(({ price }) => price.interval === interval)?.price;
  const monthly = priceOf(BillingInterval.Month);
  const yearly = priceOf(BillingInterval.Year);

  if (!monthly || !yearly) return null;

  return Math.round(12 - yearly.amount / monthly.amount);
};

export const usePricingOffers = (): PricingOffer[] => {
  const plans = usePlans();
  const offers = useOffers();
  const current = usePlan();
  const [interval] = useBillingInterval();
  const offersOf = (plan: UserPlan) =>
    offers.filter((entry) => entry.plan === plan);

  return OFFERED_PLANS.filter(
    (plan) => plan === Plan.Free || offersOf(plan).length > 0,
  ).map((plan) => {
    const { features } = plans[plan];
    const planOffers = offersOf(plan);
    const sold =
      planOffers.find(({ price }) => price.interval === interval) ??
      planOffers[0];
    const createGame = features[Feature.CreateGame];

    return {
      plan,
      offer: sold?.offer ?? null,
      price: sold?.price ?? null,
      intervals: planOffers.flatMap(({ price }) => price.interval ?? []),
      maxSeats: createGame.maxSeats,
      maxActiveGames: createGame.maxActiveGames,
      canCreate: createGame.access,
      canJoin: features[Feature.JoinGame].access,
      poker: createGame.modes.includes(GameMode.Poker),
      sandbox: createGame.modes.includes(GameMode.Free),
      isCurrent: plan === current,
    };
  });
};
