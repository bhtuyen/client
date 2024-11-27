'use client';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Locale, locales } from '@/config';
import { usePathname, useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';

export function SwitchLanguage() {
  const tSwitchLanguage = useTranslations('switch-language');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  return (
    <Select
      value={locale}
      onValueChange={(value) => {
        router.replace(pathname, { locale: value as Locale });
      }}
    >
      <SelectTrigger className='w-[180px] h-8' title='swith-language'>
        <SelectValue placeholder={tSwitchLanguage('title')} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {locales.map((locale) => {
            return (
              <SelectItem key={locale} value={locale}>
                <SelectLabel>{tSwitchLanguage(locale)}</SelectLabel>
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
