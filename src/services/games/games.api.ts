import requester, { client } from '@lib/requester';
import {
  ClaimSeatData,
  ClaimSeatResponse,
  CloseGameSessionResponse,
  CreateGameSessionData,
  CreateGameSessionResponse,
  ResolveRoundData,
  ResolveRoundResponse,
  RetrieveGameSessionResponse,
  StartRoundResponse,
  SubmitActionData,
  SubmitActionResponse,
} from '@tokenizer/shared/types';

const BASE_URL = '/games';

/**
 * Absolute URL for a relative API path (e.g. a snapshot's `photoUrl`, which
 * points at either this module's seat-photo route or the files module's content
 * route — both relative, meant to be resolved against the API origin).
 */
export const resolveApiUrl = (path: string): string =>
  `${client.defaults.baseURL}${path}`;

export const createGame = async (data: CreateGameSessionData) =>
  requester().post<CreateGameSessionResponse>(BASE_URL, data);

/** Fetching a game lazily (re)opens its room server-side. */
export const retrieveGame = async (uuid: string) =>
  requester().get<RetrieveGameSessionResponse>(`${BASE_URL}/${uuid}`);

/** Resolves a 6-character join code to its game session. */
export const retrieveGameByJoinCode = async (joinCode: string) =>
  requester().get<RetrieveGameSessionResponse>(
    `${BASE_URL}/by-code/${joinCode}`,
  );

export const claimSeat = async (uuid: string, data: ClaimSeatData) =>
  requester().post<ClaimSeatResponse>(`${BASE_URL}/${uuid}/participants`, data);

/** Host only. */
export const startRound = async (uuid: string) =>
  requester().post<StartRoundResponse>(`${BASE_URL}/${uuid}/rounds`, {});

export const submitAction = async (uuid: string, data: SubmitActionData) =>
  requester().post<SubmitActionResponse>(`${BASE_URL}/${uuid}/actions`, data);

/** Host only. */
export const resolveRound = async (uuid: string, data: ResolveRoundData = {}) =>
  requester().post<ResolveRoundResponse>(
    `${BASE_URL}/${uuid}/rounds/current/resolve`,
    data,
  );

/** Host only. */
export const closeGame = async (uuid: string) =>
  requester().delete<CloseGameSessionResponse>(`${BASE_URL}/${uuid}`);
