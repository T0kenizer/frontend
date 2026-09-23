import { JoinGame } from '@components/game/join-game';

export const metadata = {
  title: 'Join game',
};

/**
 * The join screen with no table named yet, so it opens on the identification
 * step. A link or a QR carries the uuid in the path instead and lands on
 * `/game/join/[uuid]`, past that step.
 */
const JoinGamePage = () => <JoinGame />;

export default JoinGamePage;
