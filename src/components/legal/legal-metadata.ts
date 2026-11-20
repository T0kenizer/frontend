import { APP_NAME } from '@constants/index';
import { LegalDocument } from '@constants/legal';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const generateLegalMetadata =
  (document: LegalDocument) => async (): Promise<Metadata> => {
    const t = await getTranslations(`Legal.documents.${document}`);

    return {
      title: t('title'),
      description: t('description', { appName: APP_NAME }),
    };
  };
