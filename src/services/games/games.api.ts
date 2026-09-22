import requester, { client } from '@lib/requester';
import { PLAYER_TOKEN_HEADER } from '@tokenizer/shared/constants/games.constants';
import { buildGameQrUrl } from '@tokenizer/shared/schemas';
import {
  ClaimSeatData,
  ClaimSeatResponse,
  CloseGameSessionResponse,
  CreateGameSessionData,
  CreateGameSessionResponse,
  JoinByCodeResponse,
  ListGameTemplatesResponse,
  ResolveRoundData,
  ResolveRoundResponse,
  RetrieveGameSessionResponse,
  RetrieveRoomByCodeResponse,
  StartRoundResponse,
  SubmitActionData,
  SubmitActionResponse,
} from '@tokenizer/shared/types';

const BASE_URL = '/games';

const asPlayer = (token: string) => ({
  headers: { [PLAYER_TOKEN_HEADER]: token },
});

/**
 * Absolute URL for a path served by the API itself.
 *
 * Only for routes this app builds by hand, like the QR below. Nothing a
 * snapshot carries goes through here: a seat's `photoUrl` is already an
 * absolute, signed URL pointing at the bucket, and prefixing it with the API
 * origin is how the avatars at the table ended up pointing nowhere.
 */
const resolveApiUrl = (path: string): string =>
  `${client.defaults.baseURL}${path}`;

/**
 * Where an `<img>` points to show a room's join QR.
 *
 * Deliberately a URL rather than a fetch: the image is immutable behind its
 * uuid and served with a year of `Cache-Control`, so letting the browser own it
 * beats carrying base64 through JSON on every render.
 */
export const gameQrUrl = (uuid: string): string =>
  resolveApiUrl(buildGameQrUrl(uuid));

export const createGame = async (data: CreateGameSessionData) =>
  requester().post<CreateGameSessionResponse>(BASE_URL, data);

/** Public: browsable before sign-in, same as the templates a host picks from. */
export const listGameTemplates = async () =>
  requester().get<ListGameTemplatesResponse>(`${BASE_URL}/templates`);

/** Fetching a game lazily (re)opens its room server-side. */
export const retrieveGame = async (uuid: string) =>
  requester().get<RetrieveGameSessionResponse>(`${BASE_URL}/${uuid}`);

/**
 * Resolves a dictated 6-digit code to the session uuid behind it. That uuid is
 * what every other call — and the socket room — is keyed by; the code is not
 * used again.
 */
export const joinByCode = async (code: string) =>
  requester().post<JoinByCodeResponse>(`${BASE_URL}/join-by-code`, { code });

/**
 * The public view behind a code: enough to confirm the room before joining it.
 * Deliberately does not include the uuid.
 */
export const retrieveRoomByCode = async (code: string) =>
  requester().get<RetrieveRoomByCodeResponse>(
    `${BASE_URL}/room-by-code/${code}`,
  );

/** Takes a seat and returns the player token to keep for this session. */
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

/** Host only. */
export const startRound = async (uuid: string, token: string) =>
  requester().post<StartRoundResponse>(
    `${BASE_URL}/${uuid}/rounds`,
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

/** Host only. */
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

/** Host only. */
export const closeGame = async (uuid: string, token: string) =>
  requester().delete<CloseGameSessionResponse>(
    `${BASE_URL}/${uuid}`,
    asPlayer(token),
  );
