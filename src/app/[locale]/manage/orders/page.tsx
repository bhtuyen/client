import { getTranslations } from 'next-intl/server';

import type { Locale } from '@/config';
import type { Metadata } from 'next';

import OrderDashboard from '@/app/[locale]/manage/orders/order-dashboard';
import envConfig from '@/config';

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'manage.orders'
  });

  const url = envConfig.NEXT_PUBLIC_URL + `/${locale}/manage/orders`;

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
export default function EmployeesPage() {
  return <OrderDashboard />;
}
