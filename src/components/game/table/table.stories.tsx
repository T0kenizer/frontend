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
  AmountForm,
  ChipModel,
  GameSessionStatus,
  ParticipantRole,
  ParticipantStatus,
  RoundStatus,
  type GameSnapshot,
  type ParticipantSnapshot,
} from '@tokenizer/shared/types';
import * as React from 'react';

/**
 * The live table, in each of the states it passes through.
 *
 * Worth a story rather than only a running backend: the ring positions its
 * chairs by measuring itself, so the layouts that actually break — nine seats,
 * a panel that grew a row, a phone — are the ones that are tedious to reach by
 * playing a real game to them.
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

const baseSnapshot: GameSnapshot = {
  id: '8f4dbcfb-1733-49b5-aca5-f375eaddea19',
  name: 'Friday night',
  joinCode: '4KQ792',
  status: GameSessionStatus.Lobby,
  participants: SEATS,
  currentRound: null,
  chipModel: ChipModel.AbstractBalance,
  canAddSeat: false,
};

const liveRound = (
  activeParticipant: string,
): NonNullable<GameSnapshot['currentRound']> => ({
  id: 'round-1',
  status: RoundStatus.InProgress,
  pots: [
    { id: 'pot-1', amount: 265, eligibleParticipants: SEATS.map((s) => s.id) },
  ],
  turn: {
    activeParticipant,
    interruptionOpen: false,
    pendingClaims: 0,
    legalActions: [
      {
        id: 'check',
        label: 'Check',
        amountForm: AmountForm.None,
        grantsInterruption: false,
      },
      {
        id: 'call',
        label: 'Call',
        amountForm: AmountForm.Constrained,
        grantsInterruption: false,
      },
      {
        id: 'raise',
        label: 'Raise',
        amountForm: AmountForm.Raise,
        grantsInterruption: false,
      },
      {
        id: 'fold',
        label: 'Fold',
        amountForm: AmountForm.None,
        grantsInterruption: false,
        foldsParticipant: true,
      },
    ],
  },
  actionLog: [
    {
      id: 'a1',
      participantId: 'seat-1',
      definitionId: 'call',
      amount: 20,
      timestamp: new Date().toISOString(),
    },
    {
      id: 'a2',
      participantId: 'seat-2',
      definitionId: 'raise',
      amount: 60,
      timestamp: new Date().toISOString(),
    },
    {
      id: 'a3',
      participantId: 'seat-4',
      definitionId: 'fold',
      amount: undefined,
      timestamp: new Date().toISOString(),
    },
  ],
});

const NO_OP_ACTIONS: TableActions = {
  startRound: () => {},
  submitAction: () => {},
  resolveRound: () => {},
  closeGame: () => {},
  renameSeat: () => {},
  addSeat: () => {},
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
 * The host alone at a table nobody else has reached yet — startable, because a
 * game needs the host and nothing more.
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

/** Someone seated, waiting on the host to start. */
export const LobbyAsPlayer: Story = {
  args: { snapshot: baseSnapshot, participantId: 'seat-3' },
};

/** Your move: the action panel. */
export const YourTurn: Story = {
  args: {
    snapshot: {
      ...baseSnapshot,
      status: GameSessionStatus.Running,
      currentRound: liveRound('seat-3'),
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
      currentRound: liveRound('seat-1'),
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
      currentRound: liveRound('seat-7'),
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
      currentRound: liveRound('seat-1'),
    },
    participantId: 'seat-3',
  },
};

/** Folded, eliminated and away, all visible at a glance. */
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
        if (index === 5) return { ...entry, connected: false };
        return entry;
      }),
      currentRound: liveRound('seat-4'),
    },
    participantId: 'seat-3',
  },
};

/** Between two rounds, with the last pot just settled. */
export const BetweenRounds: Story = {
  args: {
    snapshot: {
      ...baseSnapshot,
      status: GameSessionStatus.Running,
      currentRound: { ...liveRound('seat-1'), status: RoundStatus.Resolved },
    },
    participantId: 'seat-0',
    resolution: {
      roundId: 'round-1',
      reason: 'MANUAL_HOST',
      winners: ['seat-3'],
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
      currentRound: null,
    },
    participantId: 'seat-3',
  },
};
