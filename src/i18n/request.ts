import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

import type { Locale } from '@/config';

import { routing } from '@/i18n/routing';

export default getRequestConfig(async ({ locale }) => {
  if (!routing.locales.includes(locale as Locale)) notFound();

  return {
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
