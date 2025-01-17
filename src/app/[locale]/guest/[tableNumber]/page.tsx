import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import type { Locale } from '@/config';
import type { Metadata } from 'next';

import ChooseLanguage from '@/app/[locale]/guest/[tableNumber]/choose-language';
import TImage from '@/components/t-image';
import envConfig from '@/config';

export async function generateMetadata({ params: { locale, tableNumber } }: { params: { locale: Locale; tableNumber: string } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'guest.choose-language'
  });

  const url = envConfig.NEXT_PUBLIC_URL + `/${locale}/guest/${tableNumber}`;

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

export default function page({ params: { tableNumber } }: { params: { tableNumber: string } }) {
  return (
    <div className='h-dvh relative'>
      <TImage src={'/restaurant.jpg'} alt='' fill style={{ objectFit: 'cover' }} quality={100} />
      <Suspense>
        <ChooseLanguage tableNumber={tableNumber} />
      </Suspense>
    </div>
  );
}
