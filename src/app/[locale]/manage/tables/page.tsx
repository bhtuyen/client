import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import type { Locale } from '@/config';
import type { Metadata } from 'next';

import TableTable from '@/app/[locale]/manage/tables/table-table';
import envConfig from '@/config';

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'manage.tables'
  });

  const url = envConfig.NEXT_PUBLIC_URL + `/${locale}/manage/tables`;

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
export default function TablesPage() {
  return (
    <Suspense>
      <TableTable />
    </Suspense>
  );
}
