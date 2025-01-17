import { getTranslations } from 'next-intl/server';

import type { Locale } from '@/config';
import type { Metadata } from 'next';

import ChangePasswordForm from '@/app/[locale]/manage/setting/change-password-form';
import UpdateProfileForm from '@/app/[locale]/manage/setting/update-profile-form';
import envConfig from '@/config';
export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'manage.setting'
  });

  const url = envConfig.NEXT_PUBLIC_URL + `/${locale}/manage/setting`;

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
export default function SettingPage() {
  return (
    <main className='grid gap-2 md:grid-cols-2 p-2'>
      <UpdateProfileForm />
      <ChangePasswordForm />
    </main>
  );
}
