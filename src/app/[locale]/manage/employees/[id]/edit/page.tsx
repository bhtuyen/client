import { getTranslations } from 'next-intl/server';

import type { Locale } from '@/config';
import type { Metadata } from 'next';

import EditEmployeeForm from '@/app/[locale]/manage/employees/[id]/edit/edit-employee-form';
import envConfig from '@/config';

export async function generateMetadata({ params: { locale, id } }: { params: { locale: Locale; id: string } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'manage.employees.edit'
  });

  const url = envConfig.NEXT_PUBLIC_URL + `/${locale}/manage/employees/${id}/edit`;

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

export default function Page({ params: { id } }: { params: { id: string } }) {
  return <EditEmployeeForm id={id} />;
}
