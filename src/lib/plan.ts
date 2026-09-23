import { Plan, type SerializedUser } from '@tokenizer/shared/types';

export const resolvePlan = (user?: Nullable<SerializedUser>): Plan =>
  user?.plan ?? Plan.Anonymous;
