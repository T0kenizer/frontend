const STORAGE_PREFIX = 'tokenizer:game-token:';

const keyFor = (gameUuid: string) => `${STORAGE_PREFIX}${gameUuid}`;

const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

export function subscribeToPlayerToken(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function readPlayerToken(gameUuid: string): Nullable<string> {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(keyFor(gameUuid));
  } catch {
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
