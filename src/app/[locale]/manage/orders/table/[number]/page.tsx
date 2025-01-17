import { getTranslations } from 'next-intl/server';

import type { Locale } from '@/config';
import type { Metadata } from 'next';

import OrderTableDetail from '@/app/[locale]/manage/orders/table/[number]/order-table-detail';
import envConfig from '@/config';

export async function generateMetadata({ params: { locale, number } }: { params: { locale: Locale; number: string } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'manage.orders.table'
  });

  const url = envConfig.NEXT_PUBLIC_URL + `/${locale}/manage/orders/table/${number}`;

  return {
    title: t('title', { number }),
    description: t('description', { number }),
    alternates: {
      canonical: url
    },
    robots: {
      index: false
    }
  };
}

export default function page({ params: { number } }: { params: { number: string } }) {
  return <OrderTableDetail number={number} />;
}
