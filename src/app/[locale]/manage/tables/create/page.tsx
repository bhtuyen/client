import { getTranslations } from 'next-intl/server';

import type { Locale } from '@/config';
import type { Metadata } from 'next';

import CreateTableForm from '@/app/[locale]/manage/tables/create/create-table-form';
import envConfig from '@/config';

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'manage.tables.create'
  });

  const url = envConfig.NEXT_PUBLIC_URL + `/${locale}/manage/tables/create`;

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
  return <CreateTableForm />;
}
