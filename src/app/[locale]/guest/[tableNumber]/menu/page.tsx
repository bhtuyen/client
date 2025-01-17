import { getTranslations } from 'next-intl/server';

import type { Locale } from '@/config';
import type { Metadata } from 'next';

import Header from '@/app/[locale]/guest/[tableNumber]/menu/header';
import MenuTabs from '@/app/[locale]/guest/[tableNumber]/menu/menu-tabs';
import envConfig from '@/config';

export async function generateMetadata({ params: { locale, tableNumber } }: { params: { locale: Locale; tableNumber: string } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'guest.order'
  });

  const url = envConfig.NEXT_PUBLIC_URL + `/${locale}/guest/${tableNumber}/menu`;

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: url
    },
    robots: {
      index: false
    }
  };
}

export default async function Page({ params: { tableNumber } }: { params: { tableNumber: string } }) {
  return (
    <div className='h-dvh bg-white'>
      <Header tableNumber={tableNumber} />
      <MenuTabs tableNumber={tableNumber} />
    </div>
  );
}
