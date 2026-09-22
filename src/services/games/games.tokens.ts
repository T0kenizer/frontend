/**
 * Where the player token lives on the client.
 *
 * It is kept per game session, because that is its scope: a token is worth one
 * seat in one game and nothing anywhere else. Keeping it lets a refresh land
 * back in the same seat instead of taking a second one — which is the entire
 * reason the reconnection grace period on the server has anything to wait for.
 */
const STORAGE_PREFIX = 'tokenizer:game-token:';

const keyFor = (gameUuid: string) => `${STORAGE_PREFIX}${gameUuid}`;

/**
 * Listeners for "the token for some game changed".
 *
 * Storage is not reactive, and whether a token exists is now the thing that
 * decides you are allowed at the table at all — a seat is something you are
 * given by the join flow, not something you take by opening a URL. So a token
 * being written or dropped has to reach React, or a player whose token the
 * server just refused would sit looking at a table they are no longer in.
 *
 * `Set` rather than an array so a component unsubscribing during teardown
 * cannot leave a hole that shifts the others.
 */
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

/** Subscribes to token changes; returns the unsubscribe. */
export function subscribeToPlayerToken(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function readPlayerToken(gameUuid: string): Nullable<string> {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(keyFor(gameUuid));
  } catch {
    // Private browsing and blocked site data both throw here; a player who
    // cannot store a token simply takes a fresh seat.
    return null;
  }
}

export function writePlayerToken(gameUuid: string, token: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(keyFor(gameUuid), token);
    notify();
  } catch {
    /* Storage unavailable; the session degrades to a non-resumable one. */
  }
}

export function clearPlayerToken(gameUuid: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(keyFor(gameUuid));
    notify();
  } catch {
    /* Nothing to clean up if storage is unavailable. */
  }
}
