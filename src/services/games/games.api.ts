import requester, { client } from '@lib/requester';
import { PLAYER_TOKEN_HEADER } from '@tokenizer/shared/constants/games.constants';
import {
  ClaimSeatData,
  ClaimSeatResponse,
  CloseGameSessionResponse,
  CreateGameSessionData,
  CreateGameSessionResponse,
  DeclareWinnersData,
  DeclareWinnersResponse,
  JoinByCodeResponse,
  ListGameModesResponse,
  ResolveRoundData,
  ResolveRoundResponse,
  RetrieveGameSessionResponse,
  RetrieveRoomByCodeResponse,
  StartHandResponse,
  StartRoundResponse,
  SubmitActionData,
  SubmitActionResponse,
} from '@tokenizer/shared/types';
import { buildGameQrUrl } from '@tokenizer/shared/utils/games.utils';

const BASE_URL = '/games';

const asPlayer = (token: string) => ({
  headers: { [PLAYER_TOKEN_HEADER]: token },
});

const resolveApiUrl = (path: string): string =>
  `${client.defaults.baseURL}${path}`;

export const gameQrUrl = (uuid: string): string =>
  resolveApiUrl(buildGameQrUrl(uuid));

export const createGame = async (data: CreateGameSessionData) =>
  requester().post<CreateGameSessionResponse>(BASE_URL, data);

export const listGameModes = async () =>
  requester().get<ListGameModesResponse>(`${BASE_URL}/modes`);

export const retrieveGame = async (uuid: string) =>
  requester().get<RetrieveGameSessionResponse>(`${BASE_URL}/${uuid}`);

export const joinByCode = async (code: string) =>
  requester().post<JoinByCodeResponse>(`${BASE_URL}/join-by-code`, { code });

export const retrieveRoomByCode = async (code: string) =>
  requester().get<RetrieveRoomByCodeResponse>(
    `${BASE_URL}/room-by-code/${code}`,
  );

export const joinGame = async (uuid: string, data: ClaimSeatData) =>
  requester().post<ClaimSeatResponse>(`${BASE_URL}/${uuid}/participants`, data);

export const updateSeat = async (
  uuid: string,
  token: string,
  data: { displayName?: Nullable<string> },
) =>
  requester().patch(
    `${BASE_URL}/${uuid}/participants/current`,
    data,
    asPlayer(token),
  );

export const startHand = async (uuid: string, token: string) =>
  requester().post<StartHandResponse>(
    `${BASE_URL}/${uuid}/hands`,
    {},
    asPlayer(token),
  );

export const submitAction = async (
  uuid: string,
  token: string,
  data: SubmitActionData,
) =>
  requester().post<SubmitActionResponse>(
    `${BASE_URL}/${uuid}/actions`,
    data,
    asPlayer(token),
  );

export const startRound = async (uuid: string, token: string) =>
  requester().post<StartRoundResponse>(
    `${BASE_URL}/${uuid}/rounds`,
    {},
    asPlayer(token),
  );

export const declareWinners = async (
  uuid: string,
  token: string,
  data: DeclareWinnersData,
) =>
  requester().post<DeclareWinnersResponse>(
    `${BASE_URL}/${uuid}/hands/current/showdown`,
    data,
    asPlayer(token),
  );

export const closeGame = async (uuid: string, token: string) =>
  requester().delete<CloseGameSessionResponse>(
    `${BASE_URL}/${uuid}`,
    asPlayer(token),
  );

export const resolveRound = async (
  uuid: string,
  token: string,
  data: ResolveRoundData = {},
) =>
  requester().post<ResolveRoundResponse>(
    `${BASE_URL}/${uuid}/rounds/current/resolve`,
    data,
    asPlayer(token),
  );
