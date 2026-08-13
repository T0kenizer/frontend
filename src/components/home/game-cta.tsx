'use client';

import { Button } from '@components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import { retrieveSessionOptions } from '@services/sessions/sessions.options';
import { useQuery } from '@tanstack/react-query';
import { Play } from 'lucide-react';
import Link from 'next/link';

export const GameCTA: React.FC = () => {
  const { data: session } = useQuery(retrieveSessionOptions());
  const user = session?.user;

  return (
    <Card className="grid grid-cols-[1fr_auto] gap-8" variant="brand">
      <div>
        <CardHeader>
          <CardTitle>
            <h2 className="text-2xl">Prêt pour une nouvelle soirée ?</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-primary-foreground pt-2">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
              gravida viverra mauris ac lobortis. Vivamus tincidunt molestie ex
              nec suscipit.
            </p>
          </CardDescription>
        </CardContent>
        <CardFooter className="space border-0 bg-transparent!">
          <Button variant="inverse" asChild>
            <Link href="#">
              <Play />
              Lancer une partie
            </Link>
          </Button>
          <Button variant="line" asChild>
            <Link href="#">Rejoindre avec un code</Link>
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
};
