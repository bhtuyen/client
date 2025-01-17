import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import type { Locale } from '@/config';
import type { Metadata } from 'next';

import LoginForm from '@/app/[locale]/(public)/(auth)/login/login-form';
import Logout from '@/app/[locale]/(public)/(auth)/login/logout';
import envConfig from '@/config';

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'login'
  });

  const url = envConfig.NEXT_PUBLIC_URL + `/${locale}`;

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

export default function LoginPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <Suspense>
        <LoginForm />
      </Suspense>
      <Suspense>
        <Logout />
      </Suspense>
    </div>
  );
}
