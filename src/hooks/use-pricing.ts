'use client';

import { usePlan, usePlans } from '@hooks/use-plan';
import {
  Feature,
  GameMode,
  Offer,
  Plan,
  type PlanPrice,
  type UserPlan,
} from '@tokenizer/shared/types';

export interface PricingOffer {
  plan: UserPlan;
  /** What the card sends to Checkout, null for the free plan. */
  offer: Nullable<Offer>;
  price: Nullable<PlanPrice>;
  maxSeats: number;
  canCreate: boolean;
  canJoin: boolean;
  poker: boolean;
  sandbox: boolean;
  isCurrent: boolean;
}

const OFFERED_PLANS = [Plan.Free, Plan.Premium, Plan.Founder] as const;

/**
 * The plans the pricing page lists: the free one, and those still sold. A card
 * sells the first offer of its plan, the backend listing them in catalog
 * order.
 */
export const usePricingOffers = (): PricingOffer[] => {
  const plans = usePlans();
  const current = usePlan();

  return OFFERED_PLANS.filter(
    (plan) => plan === Plan.Free || plans[plan].offers.length > 0,
  ).map((plan) => {
    const { features, offers } = plans[plan];
    const [sold] = offers;
    const createGame = features[Feature.CreateGame];

    return {
      plan,
      offer: sold?.offer ?? null,
      price: sold?.price ?? null,
      maxSeats: createGame.maxSeats,
      canCreate: createGame.access,
      canJoin: features[Feature.JoinGame].access,
      poker: createGame.modes.includes(GameMode.Poker),
      sandbox: createGame.modes.includes(GameMode.Free),
      isCurrent: plan === current,
    };
  });
};
