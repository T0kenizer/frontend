import * as React from 'react';

const GUEST_ID_STORAGE_KEY = 'tokenizer:guest-id';

export interface GuestIdentity {
  externalId: string;
  displayName: string;
}

/**
 * Stable anonymous identity for visitors without a session: a random id
 * persisted in localStorage (so reloads and reconnections re-claim the same
 * seat) and a display name derived from it. Client-side only — `undefined`
 * during SSR and the first render.
 */
export function useGuestIdentity(): Optional<GuestIdentity> {
  const [identity, setIdentity] =
    React.useState<Optional<GuestIdentity>>(undefined);

  React.useEffect(() => {
    let externalId = window.localStorage.getItem(GUEST_ID_STORAGE_KEY);
    if (!externalId) {
      externalId = `guest_${crypto.randomUUID()}`;
      window.localStorage.setItem(GUEST_ID_STORAGE_KEY, externalId);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIdentity({
      externalId,
      displayName: `Guest-${externalId.slice(6, 10)}`,
    });
  }, []);

  return identity;
}
