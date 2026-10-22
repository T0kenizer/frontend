'use client';

import ChipsCluster4Shadow from '@assets/images/chips-cluster-4-shadow.png';
import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import ROUTES from '@constants/routes';
import { Play } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

export const GameCTA: React.FC = () => {
  const t = useTranslations('Dashboard.cta');

  return (
    <Card
      className="flex flex-col gap-6 rounded-4xl p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:px-9"
      variant="brand"
    >
      <div className="max-w-md">
        <h2 className="font-heading max-w-xs text-xl leading-none font-extrabold tracking-tight sm:text-2xl">
          {t('title')}
        </h2>
        <p className="mt-2 leading-normal opacity-90">{t('description')}</p>
        <div className="mt-5 flex flex-wrap gap-2.5">
          <Button variant="inverse" asChild>
            <Link href={ROUTES.game.new()}>
              <Play />
              {t('start')}
            </Link>
          </Button>
          <Button variant="line" asChild>
            <Link href={ROUTES.game.join()}>{t('join')}</Link>
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
};
