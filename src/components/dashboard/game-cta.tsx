'use client';

import ChipsCluster4Shadow from '@assets/images/chips-cluster-4-shadow.png';
import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import ROUTES from '@constants/routes';
import { Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const GameCTA: React.FC = () => (
  <Card
    className="flex flex-col gap-6 rounded-4xl p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:px-9"
    variant="brand"
  >
    <div className="max-w-md">
      <h2 className="font-heading max-w-xs text-xl leading-none font-extrabold tracking-tight sm:text-2xl">
        Ready for another game night?
      </h2>
      <p className="mt-2 leading-normal opacity-90">
        Create a table, deal the cards with a swipe, and cast the game to your
        TV. Each player manages their bets from their phone.
      </p>
      <div className="mt-5 flex flex-wrap gap-2.5">
        <Button variant="inverse" asChild>
          <Link href={ROUTES.game.new()}>
            <Play />
            Start a game
          </Link>
        </Button>
        <Button variant="line" asChild>
          <Link href={ROUTES.game.join()}>Join with a code</Link>
        </Button>
      </div>
    </div>
    <Image
      src={ChipsCluster4Shadow}
      alt=""
      height={160}
      className="hidden shrink-0 lg:block"
    />
  </Card>
);
