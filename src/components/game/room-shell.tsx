'use client';

import { FeltPanel, FeltStage } from '@components/game/felt/felt-stage';
import { Loader2 } from 'lucide-react';

export const RoomShell: React.FC<React.PropsWithChildren> = ({ children }) => (
  <FeltStage variant="table" className="justify-center">
    {children}
  </FeltStage>
);

export const RoomLoading: React.FC<React.PropsWithChildren> = ({
  children,
}) => (
  <RoomShell>
    <FeltPanel className="flex items-center justify-center gap-2.5 py-12 text-sm">
      <Loader2 aria-hidden className="size-4 animate-spin" />
      {children}
    </FeltPanel>
  </RoomShell>
);

interface RoomUnavailableProps extends React.PropsWithChildren {
  message: Optional<string>;
}

/** The table could not be reached; `children` offers a way out. */
export const RoomUnavailable: React.FC<RoomUnavailableProps> = ({
  message,
  children,
}) => (
  <RoomShell>
    <FeltPanel className="flex flex-col items-center gap-4 py-10 text-center">
      <p className="text-sm font-semibold xl:text-lg">
        {message ?? 'That table is no longer available.'}
      </p>
      {children}
    </FeltPanel>
  </RoomShell>
);
