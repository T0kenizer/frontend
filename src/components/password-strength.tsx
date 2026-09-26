'use client';

import { cn } from '@lib/utils';
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_RULES,
} from '@tokenizer/shared/constants/users.constants';
import { PasswordRule } from '@tokenizer/shared/types';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

const MAX_SCORE = PASSWORD_RULES.length;
const REASSURING_SCORE = MAX_SCORE - 1;

const LEVELS = ['tooWeak', 'weak', 'fair', 'strong', 'excellent'] as const;

type TranslatedRule = keyof IntlMessages['PasswordStrength']['rules'];

const isTranslatedRule = (id: string): id is TranslatedRule =>
  id in
  ({ length: 1, case: 1, digit: 1, symbol: 1 } satisfies Record<
    TranslatedRule,
    1
  >);

export const scorePassword = (
  value: string,
  rules: PasswordRule[] = PASSWORD_RULES,
): number => rules.filter((rule) => rule.test(value)).length;

export const usePasswordStrength = (
  value: string,
  rules: PasswordRule[] = PASSWORD_RULES,
) => {
  const t = useTranslations('PasswordStrength');

  return useMemo(() => {
    const checks = rules.map((rule) => ({
      ...rule,
      label: isTranslatedRule(rule.id)
        ? t(`rules.${rule.id}`, { count: PASSWORD_MIN_LENGTH })
        : rule.label,
      ok: rule.test(value),
    }));
    const score = checks.filter((check) => check.ok).length;

    return {
      score,
      label: value ? t(`levels.${LEVELS[score]}`) : '',
      checks,
      valid: checks.every((check) => check.ok),
    };
  }, [value, rules, t]);
};

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
  rules = PASSWORD_RULES,
  meterOnly = false,
  emptyHint,
  className,
  ...props
}) => {
  const t = useTranslations('PasswordStrength');
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
        aria-label={value ? t('labelWithLevel', { level: label }) : t('label')}
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
          {value
            ? label
            : (emptyHint ?? t('emptyHint', { count: PASSWORD_MIN_LENGTH }))}
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
