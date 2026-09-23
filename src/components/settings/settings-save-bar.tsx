'use client';

import { Button } from '@components/ui/button';
import { cn } from '@lib/utils';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

interface SaveBarState {
  dirtyCount: number;
  isPending: boolean;
}

interface SaveBarHandlers {
  onSave: () => void;
  onReset: () => void;
}

interface SettingsSaveBarContextValue {
  setState: (id: string, state: Nullable<SaveBarState>) => void;
  setHandlers: (id: string, handlers: Nullable<SaveBarHandlers>) => void;
}

const SettingsSaveBarContext =
  createContext<Nullable<SettingsSaveBarContextValue>>(null);

export const SettingsSaveBarProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [states, setStates] = useState<Record<string, SaveBarState>>({});
  const handlersRef = useRef(new Map<string, SaveBarHandlers>());

  const setState = useCallback(
    (id: string, state: Nullable<SaveBarState>) =>
      setStates((previous) => {
        if (!state) {
          if (!(id in previous)) return previous;

          const rest = { ...previous };
          delete rest[id];
          return rest;
        }

        const current = previous[id];

        if (
          current?.dirtyCount === state.dirtyCount &&
          current?.isPending === state.isPending
        )
          return previous;

        return { ...previous, [id]: state };
      }),
    [],
  );

  const setHandlers = useCallback(
    (id: string, handlers: Nullable<SaveBarHandlers>) => {
      if (handlers) handlersRef.current.set(id, handlers);
      else handlersRef.current.delete(id);
    },
    [],
  );

  const handleSave = useCallback(
    () => handlersRef.current.forEach((handlers) => handlers.onSave()),
    [],
  );
  const handleReset = useCallback(
    () => handlersRef.current.forEach((handlers) => handlers.onReset()),
    [],
  );

  const value = useMemo(
    () => ({ setState, setHandlers }),
    [setState, setHandlers],
  );

  const registered = Object.values(states);
  const dirtyCount = registered.reduce(
    (total, state) => total + state.dirtyCount,
    0,
  );
  const isPending = registered.some((state) => state.isPending);

  return (
    <SettingsSaveBarContext value={value}>
      {children}
      <SettingsSaveBar
        dirtyCount={dirtyCount}
        isPending={isPending}
        onSave={handleSave}
        onReset={handleReset}
      />
    </SettingsSaveBarContext>
  );
};

export const useSettingsSaveBar = ({
  dirtyCount,
  isPending,
  onSave,
  onReset,
}: SaveBarState & SaveBarHandlers) => {
  const context = useContext(SettingsSaveBarContext);
  const id = useId();

  if (!context)
    throw new Error(
      'useSettingsSaveBar must be used within a <SettingsSaveBarProvider>',
    );

  const { setState, setHandlers } = context;

  useEffect(() => {
    setHandlers(id, { onSave, onReset });
  });

  useEffect(() => {
    setState(id, { dirtyCount, isPending });
    return () => setState(id, null);
  }, [id, dirtyCount, isPending, setState]);

  useEffect(() => () => setHandlers(id, null), [id, setHandlers]);
};

interface SettingsSaveBarProps extends SaveBarState, SaveBarHandlers {}

const SettingsSaveBar: React.FC<SettingsSaveBarProps> = ({
  dirtyCount,
  isPending,
  onSave,
  onReset,
}) => {
  const isVisible = dirtyCount > 0;

  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 's' || !(event.metaKey || event.ctrlKey)) return;

      event.preventDefault();
      onSave();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onSave]);

  return (
    <div
      data-slot="settings-save-bar"
      inert={!isVisible}
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-7 pb-5 transition-transform duration-300 ease-out motion-reduce:transition-none',
        isVisible ? 'translate-y-0' : 'translate-y-[130%]',
      )}
    >
      <div
        role="status"
        aria-live="polite"
        className="bg-night-880 text-chalk dark:border-border pointer-events-auto flex w-full max-w-160 items-center gap-4 rounded-full py-2 pr-2.5 pl-5 shadow-lg dark:border"
      >
        <p className="flex-1 text-sm">
          <b className="font-bold">{dirtyCount}</b> unsaved{' '}
          {dirtyCount > 1 ? 'changes' : 'change'}
        </p>
        <Button
          type="button"
          variant="ghost"
          className="text-night-mist hover:bg-white/12 hover:text-white"
          disabled={isPending}
          onClick={onReset}
        >
          Cancel
        </Button>
        <Button type="button" loading={isPending} onClick={onSave}>
          Save
        </Button>
      </div>
    </div>
  );
};
