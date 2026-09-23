'use client';

import {
  readPlayerToken,
  subscribeToPlayerToken,
} from '@services/games/games.tokens';
import * as React from 'react';

/**
 * The player token this client holds for a game, or null if it holds none.
 *
 * Read through `useSyncExternalStore` rather than into state, for two reasons
 * that both bite otherwise. Storage cannot be touched while the server renders,
 * and the third argument is exactly the hook's answer to that: the server (and
 * the hydrating pass) sees null, the client sees the real value on the very
 * next render, and there is no mismatch to warn about. And a token can be
 * dropped from under us — the server refusing it is how a stale seat is cleaned
 * up — so reading it once into state would leave a client that thinks it is
 * still in a game it has been thrown out of.
 */
export function usePlayerToken(gameId: Optional<string>): Nullable<string> {
  const getSnapshot = React.useCallback(
    () => (gameId ? readPlayerToken(gameId) : null),
    [gameId],
  );

  return React.useSyncExternalStore(
    subscribeToPlayerToken,
    getSnapshot,
    () => null,
  );
}
