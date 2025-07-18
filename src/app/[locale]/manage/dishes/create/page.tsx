import { getTranslations } from 'next-intl/server';

import type { Locale } from '@/config';
import type { Metadata } from 'next';

import CreateDishForm from '@/app/[locale]/manage/dishes/create/create-dish-form';
import envConfig from '@/config';
export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'manage.dishes.create'
  });

  const url = envConfig.NEXT_PUBLIC_URL + `/${locale}/manage/dishes/create`;

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
export default function Page() {
  return <CreateDishForm />;
}
