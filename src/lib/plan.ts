import { Plan, type SerializedUser } from '@tokenizer/shared/types';

/**
 * Resolves a session's user to a concrete plan. A signed-out visitor becomes
 * `Plan.Anonymous` right here — the one place that happens — so nothing else in
 * the app treats "no session" as a special case.
 */
export const resolvePlan = (user?: Nullable<SerializedUser>): Plan =>
  user?.plan ?? Plan.Anonymous;
