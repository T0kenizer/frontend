'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

export const useMounted = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

export default useMounted;
