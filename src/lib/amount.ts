/** Chip amounts are always whole and never negative, and read as plain digits. */
const amountFormatter = new Intl.NumberFormat('en-US');

/** Whatever was typed, read as a whole non-negative number of chips. */
export const toAmount = (value: string): number => {
  const digits = value.replace(/\D/g, '').slice(0, 9);
  return digits ? Number(digits) : 0;
};

/** A chip amount as it is shown on the felt. */
export const formatAmount = (value: number): string =>
  amountFormatter.format(value);
