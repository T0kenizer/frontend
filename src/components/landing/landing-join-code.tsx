'use client';

import { FeltNotice } from '@components/game/felt/felt-stage';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import ROUTES from '@constants/routes';
import { cn } from '@lib/utils';
import { joinByCodeOptions } from '@services/games/games.options';
import { useMutation } from '@tanstack/react-query';
import { JOIN_CODE_LENGTH } from '@tokenizer/shared/constants/games.constants';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';

export type LandingJoinCodeProps = Omit<
  React.ComponentProps<'form'>,
  'onSubmit' | 'children'
> & {
  label?: string;
};

export const LandingJoinCode: React.FC<LandingJoinCodeProps> = ({
  label,
  className,
  ...props
}) => {
  const t = useTranslations('JoinCode');
  const id = useId();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<Nullable<string>>(null);
  const { mutateAsync: joinByCode, isPending } =
    useMutation(joinByCodeOptions());

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (code.length < JOIN_CODE_LENGTH || isPending) return;

    try {
      const { gameUuid } = await joinByCode(code);
      router.push(ROUTES.game.join(gameUuid));
    } catch (cause) {
      setError((cause instanceof Error && cause.message) || t('error'));
    }
  };

  return (
    <div className={cn('max-w-md', className)}>
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="border-on-media-border flex items-center gap-2.5 rounded-xl border bg-black/35 py-1.5 pr-1.5 pl-4 backdrop-blur-md"
        {...props}
      >
        <label
          htmlFor={id}
          className="text-on-media-muted-foreground text-xs font-semibold whitespace-nowrap"
        >
          {label ?? t('label')}
        </label>
        <Input
          id={id}
          value={code}
          onChange={(event) => {
            setCode(
              event.target.value.replace(/\D/g, '').slice(0, JOIN_CODE_LENGTH),
            );
            setError(null);
          }}
          inputMode="numeric"
          autoComplete="off"
          placeholder="482913"
          maxLength={JOIN_CODE_LENGTH}
          aria-invalid={!!error}
          className="text-on-media-foreground placeholder:text-on-media-foreground/35 h-auto flex-1 border-0 bg-transparent px-0 py-2 text-lg font-extrabold tracking-widest focus-visible:ring-0 aria-invalid:ring-0 md:text-lg dark:bg-transparent"
        />
        <Button
          type="submit"
          variant="felt-inverse"
          size="lg"
          disabled={code.length < JOIN_CODE_LENGTH || isPending}
        >
          {t('action')}
        </Button>
      </form>
      {error && (
        <FeltNotice tone="error" className="mt-2.5 font-semibold">
          {error}
        </FeltNotice>
      )}
    </div>
  );
};
