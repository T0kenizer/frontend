import { FeltEyebrow } from '@components/game/felt/felt-stage';
import {
  LandingRevealGroup,
  LandingRevealItem,
} from '@components/landing/landing-reveal';
import { Main } from '@components/layout/main';
import { LegalNav } from '@components/legal/legal-nav';
import type { LegalDocument } from '@constants/legal';
import { loadLegalContent } from '@content/legal';
import { getLocale, getTranslations } from 'next-intl/server';

export type LegalPageProps = {
  document: LegalDocument;
};

export const LegalPage = async ({ document }: LegalPageProps) => {
  const [t, Content] = await Promise.all([
    getTranslations('Legal'),
    getLocale().then((lang) => loadLegalContent(document, lang)),
  ]);

  return (
    <Main>
      <section className="felt-surface text-on-media-foreground overflow-hidden pt-36 pb-20">
        <LandingRevealGroup
          immediate
          stagger={0.12}
          delay={0.1}
          className="mx-auto flex w-full max-w-7xl flex-col px-5 sm:px-8"
        >
          <LandingRevealItem>
            <FeltEyebrow className="border-on-media-border bg-on-media text-on-media-foreground w-fit rounded-full border px-3.5 py-1.5 backdrop-blur-sm">
              {t('eyebrow')}
            </FeltEyebrow>
          </LandingRevealItem>
          <LandingRevealItem>
            <h1 className="font-heading mt-5 max-w-[20ch] text-4xl leading-none font-extrabold tracking-tighter text-balance sm:text-5xl">
              {t(`documents.${document}.title`)}
            </h1>
          </LandingRevealItem>
        </LandingRevealGroup>
      </section>
      <section className="pt-12 pb-24 lg:pt-16">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-14">
          <aside className="min-w-0">
            <LegalNav active={document} />
          </aside>
          <article className="bg-card min-h-96 w-full max-w-3xl min-w-0 rounded-2xl border px-6 py-8 md:px-10 md:py-11">
            <Content />
          </article>
        </div>
      </section>
    </Main>
  );
};
