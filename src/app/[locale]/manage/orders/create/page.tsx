import { getTranslations } from 'next-intl/server';

import type { Locale } from '@/config';
import type { Metadata } from 'next';

import CreateOrdersForm from '@/app/[locale]/manage/orders/create/create-order-form';
import envConfig from '@/config';
export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'manage.orders.create'
  });

  const url = envConfig.NEXT_PUBLIC_URL + `/${locale}/manage/orders/create`;

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
  return <CreateOrdersForm />;
}
