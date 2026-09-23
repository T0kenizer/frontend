import { TableHub } from '@components/game/table/hub/table-hub';
import type { TableActions } from '@components/game/table/table-actions';
import { TableRing } from '@components/game/table/table-ring';
import { useChipFlights } from '@components/game/table/use-chip-flights';
import { useRingGeometry } from '@components/game/table/use-ring-geometry';
import {
  useTableView,
  type GameSession,
} from '@components/game/table/use-table-view';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  BettingStructure,
  ChipModel,
  GameMode,
  GameSessionStatus,
  HandEndReason,
  HandEventType,
  HandStatus,
  ParticipantRole,
  ParticipantStatus,
  PokerAction,
  Street,
  type GameSnapshot,
  type ParticipantSnapshot,
  type PokerGameSnapshot,
} from '@tokenizer/shared/types';

/**
 * The live table, in each of the states it passes through.
 *
 * Worth a story rather than only a running backend: the ring positions its
 * chairs by measuring itself, so the layouts that actually break — nine seats,
 * a panel that grew a row, a phone — are the ones that are tedious to reach by
 * playing a real game to them. The showdown and the side pot are here for the
 * same reason: both are rare at a real table and both are where the panel
 * grows.
 */

const seat = (
  index: number,
  overrides: Partial<ParticipantSnapshot> = {},
): ParticipantSnapshot => ({
  id: `seat-${index}`,
  role: index === 0 ? ParticipantRole.Host : ParticipantRole.Player,
  displayName: `Seat ${index + 1}`,
  photoUrl: null,
  balance: 500,
  seatIndex: index,
  status: ParticipantStatus.Active,
  connected: true,
  claimed: true,
  ...overrides,
});

const SEATS: ParticipantSnapshot[] = [
  seat(0, { displayName: 'Léo C.', balance: 640 }),
  seat(1, { displayName: 'Marie R.', balance: 380 }),
  seat(2, { displayName: 'Théo T.', balance: 505 }),
  seat(3, { displayName: 'Anna S.', balance: 720 }),
  seat(4, { displayName: 'Jules P.', balance: 245 }),
  seat(5, { displayName: 'Sofia M.', balance: 500 }),
  seat(6, { displayName: 'Nico D.', balance: 460 }),
  seat(7, { claimed: false, balance: 500 }),
  seat(8, { claimed: false, balance: 500 }),
];

const baseSnapshot: PokerGameSnapshot = {
  id: '8f4dbcfb-1733-49b5-aca5-f375eaddea19',
  name: 'Friday night',
  mode: GameMode.Poker,
  joinCode: '482791',
  status: GameSessionStatus.Lobby,
  participants: SEATS,
  dealsPlayed: 0,
  currentHand: null,
  stakes: {
    blinds: { small: 5, big: 10 },
    ante: 0,
    bettingStructure: BettingStructure.NoLimit,
  },
  chipModel: ChipModel.AbstractBalance,
  canAddSeat: false,
};

const at = (offset: number) =>
  new Date(Date.now() - offset * 1000).toISOString();

/** A hand mid-flop, with the button on seat 0 and a bet of 60 standing. */
const liveHand = (
  activeParticipant: string,
  overrides: Partial<NonNullable<PokerGameSnapshot['currentHand']>> = {},
): NonNullable<PokerGameSnapshot['currentHand']> => ({
  id: 'hand-1',
  handNumber: 7,
  status: HandStatus.Betting,
  street: Street.Flop,
  dealerParticipant: 'seat-0',
  smallBlindParticipant: 'seat-1',
  bigBlindParticipant: 'seat-2',
  pots: [
    {
      id: 'pot-1',
      amount: 265,
      eligibleParticipants: SEATS.map((entry) => entry.id),
      isSidePot: false,
    },
  ],
  betting: {
    activeParticipant,
    currentBet: 60,
    minRaiseTo: 120,
    committed: { 'seat-1': 60, 'seat-2': 60 },
    legalActions: [
      { action: PokerAction.Fold, label: 'Fold' },
      { action: PokerAction.Call, label: 'Call', min: 60, max: 60 },
      { action: PokerAction.Raise, label: 'Raise', min: 120, max: 720 },
      { action: PokerAction.AllIn, label: 'All in', min: 720, max: 720 },
    ],
  },
  events: [
    {
      id: 'e1',
      participantId: null,
      type: HandEventType.StreetDealt,
      street: Street.Flop,
      timestamp: at(30),
    },
    {
      id: 'e2',
      participantId: 'seat-1',
      type: HandEventType.Bet,
      amount: 60,
      street: Street.Flop,
      timestamp: at(20),
    },
    {
      id: 'e3',
      participantId: 'seat-2',
      type: HandEventType.Call,
      amount: 60,
      street: Street.Flop,
      timestamp: at(10),
    },
    {
      id: 'e4',
      participantId: 'seat-4',
      type: HandEventType.Fold,
      street: Street.Flop,
      timestamp: at(4),
    },
  ],
  ...overrides,
});

const NO_OP_ACTIONS: TableActions = {
  startHand: () => {},
  startRound: () => {},
  submitAction: () => {},
  submitCatalogAction: () => {},
  declareWinners: () => {},
  resolveRound: () => {},
  closeGame: () => {},
  renameSeat: () => {},
  shareTable: () => {},
  pending: null,
  error: null,
};

interface HarnessProps {
  snapshot: GameSnapshot;
  participantId: Nullable<string>;
  resolution?: GameSession['resolution'];
}

/** The two halves wired together, without a socket behind them. */
const TableHarness: React.FC<HarnessProps> = ({
  snapshot,
  participantId,
  resolution = null,
}) => {
  const view = useTableView({
    snapshot,
    participantId,
    resolution,
  } as GameSession);

  const flights = useChipFlights(snapshot.participants);
  const { ringRef, hubRef, geometry } = useRingGeometry(
    snapshot.participants.length,
  );

  if (!view) return null;

  return (
    <div className="felt-surface flex h-dvh w-full flex-col overflow-hidden">
      <TableRing
        seats={view.seats}
        geometry={geometry}
        flights={flights}
        ringRef={ringRef}
        hubRef={hubRef}
        chipModel={view.chipModel}
      >
        <TableHub
          view={view}
          actions={NO_OP_ACTIONS}
          tableName={snapshot.name}
          form={null}
        />
      </TableRing>
    </div>
  );
};

const meta = {
  title: 'Game/Table',
  component: TableHarness,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TableHarness>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The host, before anyone has been dealt in. */
export const LobbyAsHost: Story = {
  args: { snapshot: baseSnapshot, participantId: 'seat-0' },
};

/**
 * The host alone at a table nobody else has reached yet — dealable, because a
 * hand needs the host and nothing more.
 */
export const LobbyHostAlone: Story = {
  args: {
    snapshot: {
      ...baseSnapshot,
      participants: SEATS.map((entry, index) =>
        index === 0 ? entry : { ...entry, claimed: false },
      ),
    },
    participantId: 'seat-0',
  },
};

/** Someone seated, waiting on the host to deal. */
export const LobbyAsPlayer: Story = {
  args: { snapshot: baseSnapshot, participantId: 'seat-3' },
};

/** Your move: the action panel, at the sizes the server called legal. */
export const YourTurn: Story = {
  args: {
    snapshot: {
      ...baseSnapshot,
      status: GameSessionStatus.Running,
      currentHand: liveHand('seat-3'),
    },
    participantId: 'seat-3',
  },
};

/** Nothing owed: the check is the filled button, and there is no call. */
export const YourTurnUnopened: Story = {
  args: {
    snapshot: {
      ...baseSnapshot,
      status: GameSessionStatus.Running,
      currentHand: liveHand('seat-3', {
        betting: {
          activeParticipant: 'seat-3',
          currentBet: 0,
          minRaiseTo: 10,
          committed: {},
          legalActions: [
            { action: PokerAction.Fold, label: 'Fold' },
            { action: PokerAction.Check, label: 'Check' },
            { action: PokerAction.Bet, label: 'Bet', min: 10, max: 720 },
            { action: PokerAction.AllIn, label: 'All in', min: 720, max: 720 },
          ],
        },
      }),
    },
    participantId: 'seat-3',
  },
};

/** Someone else's move: the summary, which is what this state must never omit. */
export const WatchingAnotherPlayer: Story = {
  args: {
    snapshot: {
      ...baseSnapshot,
      status: GameSessionStatus.Running,
      currentHand: liveHand('seat-1'),
    },
    participantId: 'seat-3',
  },
};

/** The turn has landed on an unclaimed chair, and the host plays it. */
export const HostPlayingAnEmptySeat: Story = {
  args: {
    snapshot: {
      ...baseSnapshot,
      status: GameSessionStatus.Running,
      currentHand: liveHand('seat-7'),
    },
    participantId: 'seat-0',
  },
};

/**
 * The betting is finished and the cards are on the table. This is the one call
 * the app cannot make for itself.
 */
export const ShowdownAsHost: Story = {
  args: {
    snapshot: {
      ...baseSnapshot,
      status: GameSessionStatus.Running,
      currentHand: liveHand('seat-3', {
        street: Street.River,
        status: HandStatus.Showdown,
        betting: {
          activeParticipant: null,
          currentBet: 0,
          minRaiseTo: 0,
          committed: {},
          legalActions: [],
        },
      }),
    },
    participantId: 'seat-0',
  },
};

/**
 * A short stack went all-in, so the betting above them formed a second pot only
 * the seats that could cover it may take. The rarest panel, and the one that
 * most needs to be right.
 */
export const ShowdownWithASidePot: Story = {
  args: {
    snapshot: {
      ...baseSnapshot,
      status: GameSessionStatus.Running,
      participants: SEATS.map((entry, index) =>
        index === 4
          ? { ...entry, status: ParticipantStatus.AllIn, balance: 0 }
          : entry,
      ),
      currentHand: liveHand('seat-3', {
        street: Street.River,
        status: HandStatus.Showdown,
        pots: [
          {
            id: 'pot-1',
            amount: 735,
            eligibleParticipants: ['seat-1', 'seat-3', 'seat-4'],
            isSidePot: false,
          },
          {
            id: 'pot-2',
            amount: 310,
            eligibleParticipants: ['seat-1', 'seat-3'],
            isSidePot: true,
          },
        ],
        betting: {
          activeParticipant: null,
          currentBet: 0,
          minRaiseTo: 0,
          committed: {},
          legalActions: [],
        },
      }),
    },
    participantId: 'seat-0',
  },
};

/**
 * A table playing in chips rather than an abstract balance — every stack is
 * drawn as the denominations that make it up.
 */
export const DenominatedChips: Story = {
  args: {
    snapshot: {
      ...baseSnapshot,
      status: GameSessionStatus.Running,
      chipModel: ChipModel.Denominated,
      currentHand: liveHand('seat-1'),
    },
    participantId: 'seat-3',
  },
};

/** Folded, all-in, eliminated and away, all visible at a glance. */
export const SeatStatuses: Story = {
  args: {
    snapshot: {
      ...baseSnapshot,
      status: GameSessionStatus.Running,
      participants: SEATS.map((entry, index) => {
        if (index === 1)
          return { ...entry, status: ParticipantStatus.Folded, balance: 380 };
        if (index === 2)
          return { ...entry, status: ParticipantStatus.Eliminated, balance: 0 };
        if (index === 4)
          return { ...entry, status: ParticipantStatus.AllIn, balance: 0 };
        if (index === 5) return { ...entry, connected: false };
        return entry;
      }),
      currentHand: liveHand('seat-3'),
    },
    participantId: 'seat-3',
  },
};

/** Between two hands, with the last pot just settled. */
export const BetweenHands: Story = {
  args: {
    snapshot: {
      ...baseSnapshot,
      status: GameSessionStatus.Running,
      currentHand: liveHand('seat-1', { status: HandStatus.Settled }),
    },
    participantId: 'seat-0',
    resolution: {
      mode: GameMode.Poker,
      handId: 'hand-1',
      reason: HandEndReason.Showdown,
      winners: ['seat-3'],
      payouts: [{ participantId: 'seat-3', amount: 265 }],
    },
  },
};

/** A full table the host may still extend — the "add a seat" affordance. */
export const FullTableWithExtraSeats: Story = {
  args: {
    snapshot: {
      ...baseSnapshot,
      participants: SEATS.map((entry) => ({ ...entry, claimed: true })),
      canAddSeat: true,
    },
    participantId: 'seat-0',
  },
};

/** Over, on the standings. */
export const Finished: Story = {
  args: {
    snapshot: {
      ...baseSnapshot,
      status: GameSessionStatus.Finished,
      currentHand: null,
    },
    participantId: 'seat-3',
  },
};
