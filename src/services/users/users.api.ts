import requester from '@lib/requester';
import {
  CreateUserData,
  CreateUserResponse,
  PartialUpdateUserData,
  PartialUpdateUserResponse,
} from '@tokenizer/shared/types';

const BASE_URL = '/users';

export const createUser = async (data: CreateUserData) =>
  requester().post<CreateUserResponse>(BASE_URL, data);

export const partialUpdateUser = async (
  uuid: string,
  data: PartialUpdateUserData,
) => requester().patch<PartialUpdateUserResponse>(`${BASE_URL}/${uuid}`, data);
