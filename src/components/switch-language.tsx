'use client';
import { useLocale, useTranslations } from 'next-intl';

import type { Locale } from '@/config';

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { locales } from '@/config';
import { usePathname, useRouter } from '@/i18n/routing';

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
              <SelectItem
                key={locale}
                value={locale}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
              >
                <SelectLabel>{tSwitchLanguage(locale)}</SelectLabel>
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
