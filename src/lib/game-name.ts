import { type SerializedUser } from '@tokenizer/shared/types';

export const FALLBACK_GAME_NAME = 'Unnamed game';

export const resolveGameName = (
  name: string,
  user?: Nullable<SerializedUser>,
): string =>
  name.trim() || (user ? `${user.displayName}'s game` : FALLBACK_GAME_NAME);
