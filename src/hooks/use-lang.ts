'use client';

import {
  LangContext,
  LangContextValue,
} from '@components/providers/lang-provider';
import { use } from 'react';

export const useLang = (): LangContextValue => {
  const context = use(LangContext);

  if (!context) throw new Error('useLang must be used within a LangProvider');

  return context;
};

export default useLang;
