'use client';

import { Button } from '@components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import { unlinkGoogleOptions } from '@services/profile/profile.options';
import { useMutation } from '@tanstack/react-query';

export const UnlinkGoogleSection: React.FC = () => {
  const { mutate: unlinkGoogle, isPending } = useMutation(
    unlinkGoogleOptions(),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Account</CardTitle>
        <CardDescription>
          Your account is linked to Google. You can unlink it if you have a
          password set.
        </CardDescription>
      </CardHeader>
      <CardContent className="mb-4">
        <Button
          variant="outline"
          disabled={isPending}
          onClick={() => unlinkGoogle()}
        >
          Unlink Google
        </Button>
      </CardContent>
    </Card>
  );
};
