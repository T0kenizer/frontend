'use client';

import { cn } from '@lib/utils';
import { Check } from 'lucide-react';
import { useMemo } from 'react';

const COMFORTABLE_LENGTH = 12;
const REASSURING_SCORE = 3;
const MAX_SCORE = 4;

export type PasswordRule = {
  id: string;
  label: string;
  test: (value: string) => boolean;
};

export const defaultRules: PasswordRule[] = [
  {
    id: 'len',
    label: `${COMFORTABLE_LENGTH} caractères minimum`,
    test: (value) => value.length >= COMFORTABLE_LENGTH,
  },
  {
    id: 'case',
    label: 'Une majuscule et une minuscule',
    test: (value) => /[A-Z]/.test(value) && /[a-z]/.test(value),
  },
  {
    id: 'num',
    label: 'Un chiffre ou un symbole',
    test: (value) => /[\d\W]/.test(value),
  },
];

const LABELS = ['Trop court', 'Faible', 'Correct', 'Solide', 'Excellent'];

/** 0–4, same scoring as the Tokenizer auth screens. */
export const scorePassword = (value: string): number => {
  let score = 0;
  if (value.length >= COMFORTABLE_LENGTH) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^\w]/.test(value)) score++;
  return score;
};

export const usePasswordStrength = (
  value: string,
  rules: PasswordRule[] = defaultRules,
) =>
  useMemo(() => {
    const score = scorePassword(value);
    const checks = rules.map((rule) => ({ ...rule, ok: rule.test(value) }));

    return {
      score,
      label: value ? LABELS[score] : '',
      checks,
      valid: checks.every((check) => check.ok),
    };
  }, [value, rules]);

export type PasswordStrengthProps = Omit<
  React.ComponentProps<'div'>,
  'children'
> & {
  value: string;
  rules?: PasswordRule[];
  meterOnly?: boolean;
  emptyHint?: string;
};

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  value,
  rules = defaultRules,
  meterOnly = false,
  emptyHint = `${COMFORTABLE_LENGTH} caractères minimum`,
  className,
  ...props
}) => {
  const { score, label, checks } = usePasswordStrength(value, rules);
  const isGood = score >= REASSURING_SCORE;

  return (
    <div
      data-slot="password-strength"
      className={cn('w-full space-y-1.5', className)}
      aria-live="polite"
      {...props}
    >
      <div
        className="flex gap-1"
        role="img"
        aria-label={
          value ? `Force du mot de passe : ${label}` : 'Force du mot de passe'
        }
      >
        {Array.from({ length: MAX_SCORE }, (_, index) => (
          <span
            key={index}
            className={cn(
              'bg-surface-sunk h-1 flex-1 rounded-full transition-colors',
              index < score && (isGood ? 'bg-success' : 'bg-warning'),
            )}
          />
        ))}
      </div>

      {meterOnly ? (
        <p className="text-muted-foreground text-xs font-light">
          {value ? label : emptyHint}
        </p>
      ) : (
        <ul className="grid gap-1.5 pt-1">
          {checks.map((check) => (
            <li
              key={check.id}
              className={cn(
                'flex items-center gap-2 text-xs transition-colors',
                check.ok ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'border-border-strong grid size-3.5 shrink-0 place-items-center rounded-full border-[1.5px] transition-colors',
                  check.ok && 'bg-success border-success',
                )}
              >
                <Check
                  strokeWidth={4}
                  className={cn(
                    'text-success-foreground size-2 opacity-0 transition-opacity',
                    check.ok && 'opacity-100',
                  )}
                />
              </span>
              {check.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PasswordStrength;
