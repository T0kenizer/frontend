import requester from '@lib/requester';
import { CreateUserData, CreateUserResponse } from '@tokenizer/shared/types';

const BASE_URL = '/users';

export const createUser = async (data: CreateUserData) =>
  requester().post<CreateUserResponse>(BASE_URL, data);
