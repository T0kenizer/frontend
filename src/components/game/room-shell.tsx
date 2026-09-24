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
