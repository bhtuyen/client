import { getTranslations } from 'next-intl/server';

import type { Locale } from '@/config';
import type { Metadata } from 'next';

import DishMenu from '@/app/[locale]/(public)/dish-menu';
import envConfig from '@/config';

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'menu-public'
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

export default function Page() {
  return <DishMenu />;
}
