import { Offer, type OfferPrice } from '@tokenizer/shared/types';

export const offerSlug = (offer: Offer): string =>
  offer.toLowerCase().replaceAll('_', '-');

export const parseOffer = (segment: string): Nullable<Offer> =>
  Object.values(Offer).find((offer) => offerSlug(offer) === segment) ?? null;

export const formatPrice = (
  price: Nullable<OfferPrice>,
  locale: string,
): string => {
  const amount = price?.amount ?? 0;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: (price?.currency ?? 'eur').toUpperCase(),
    minimumFractionDigits: amount % 100 === 0 ? 0 : 2,
  }).format(amount / 100);
};
