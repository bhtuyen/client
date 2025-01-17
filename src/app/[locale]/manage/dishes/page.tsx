import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import type { Locale } from '@/config';
import type { Metadata } from 'next';

import DishTable from '@/app/[locale]/manage/dishes/dish-table';
import envConfig from '@/config';

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'manage.dishes'
  });

  const url = envConfig.NEXT_PUBLIC_URL + `/${locale}/manage/dishes`;

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

export default function DishesPage() {
  return (
    <Suspense>
      <DishTable />
    </Suspense>
  );
}
