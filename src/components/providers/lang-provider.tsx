'use client';

import { type Lang, writeLangCookie } from '@lib/i18n';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useMemo,
  useOptimistic,
  useTransition,
} from 'react';

export interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const LangContext = createContext<Nullable<LangContextValue>>(null);

export type LangProviderProps = React.PropsWithChildren<{
  lang: Lang;
}>;

export const LangProvider: React.FC<LangProviderProps> = ({
  lang: serverLang,
  children,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [, startTransition] = useTransition();

  const [lang, setOptimisticLang] = useOptimistic(serverLang);

  const setLang = useCallback(
    (next: Lang) => {
      if (next === lang) return;

      writeLangCookie(next);

      startTransition(() => {
        setOptimisticLang(next);
        document.documentElement.lang = next;

        router.refresh();
        void queryClient.invalidateQueries();
      });
    },
    [lang, queryClient, router, setOptimisticLang],
  );

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);

  return <LangContext value={value}>{children}</LangContext>;
};

export default LangProvider;
