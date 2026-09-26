'use client';

import { type LogoProps, Logo as BaseLogo } from '@components/layout/logo';
import { useHome } from '@hooks/use-home';

type Props = Omit<LogoProps, 'href'>;

export const Logo: React.FC<Props> = ({ ...props }) => {
  const home = useHome();

  return <BaseLogo {...props} href={home()} />;
};
