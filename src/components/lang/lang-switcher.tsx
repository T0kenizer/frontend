'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { useLang } from '@hooks/use-lang';
import { ALLOWED_LANGS, type Lang, langLabel } from '@lib/i18n';
import { cn } from '@lib/utils';
import { useTranslations } from 'next-intl';

interface LangOption {
  value: Lang;
  label: string;
}

const LANG_OPTIONS: LangOption[] = ALLOWED_LANGS.map((lang) => ({
  value: lang,
  label: langLabel(lang),
}));

export type LangSwitcherProps = Omit<
  React.ComponentProps<typeof SelectTrigger>,
  'children'
>;

export const LangSwitcher: React.FC<LangSwitcherProps> = ({
  className,
  ...props
}) => {
  const t = useTranslations('LangSwitcher');
  const { lang, setLang } = useLang();

  return (
    <Select value={lang} onValueChange={(value) => setLang(value as Lang)}>
      <SelectTrigger
        aria-label={t('label')}
        className={cn('w-56', className)}
        {...props}
      >
        <SelectValue placeholder={t('label')} />
      </SelectTrigger>
      <SelectContent>
        {LANG_OPTIONS.map(({ value, label }) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LangSwitcher;
