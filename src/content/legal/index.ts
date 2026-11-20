import { LegalDocument } from '@constants/legal';
import type { Lang } from '@lib/i18n/langs';
import type { MDXContent } from 'mdx/types';

type LegalContentModule = { default: MDXContent };

// Spelled out rather than built from a template path, so the type checker
// refuses a language or a document that is missing its file.
const CONTENT: Record<
  Lang,
  Record<LegalDocument, () => Promise<LegalContentModule>>
> = {
  'en-US': {
    [LegalDocument.LegalNotice]: () => import('./en-US/legal-notice.md'),
    [LegalDocument.PrivacyPolicy]: () => import('./en-US/privacy-policy.md'),
    [LegalDocument.TermsOfService]: () => import('./en-US/terms-of-service.md'),
  },
  'fr-FR': {
    [LegalDocument.LegalNotice]: () => import('./fr-FR/legal-notice.md'),
    [LegalDocument.PrivacyPolicy]: () => import('./fr-FR/privacy-policy.md'),
    [LegalDocument.TermsOfService]: () => import('./fr-FR/terms-of-service.md'),
  },
};

export const loadLegalContent = async (
  document: LegalDocument,
  lang: Lang,
): Promise<MDXContent> => (await CONTENT[lang][document]()).default;
