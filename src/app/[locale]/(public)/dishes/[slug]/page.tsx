import { dishApiRequets } from '@/app/apiRequests/dish';
import { generateSlugify, getIdFromSlugifyString, wrapperServerApi } from '@/lib/utils';
import React from 'react';
import DishDetail from '@/app/[locale]/(public)/dishes/[slug]/dish-detail';
import { unstable_setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';

interface PostPageProps {
  params: {
    slug: string;
    locale: string;
  };
}

export async function generateStaticParams(): Promise<PostPageProps['params'][]> {
  const reslut = await wrapperServerApi(() => dishApiRequets.getAll());

  const listDish = reslut?.payload.data ?? [];

  const locales = routing.locales;

  return listDish.flatMap((dish) =>
    locales.map((locale) => ({
      slug: generateSlugify({ id: dish.id, name: dish.name }),
      locale
    }))
  );
}

export default async function DishDetailPage({
  params: { slug, locale }
}: {
  params: {
    slug: string;
    locale: string;
  };
}) {
  unstable_setRequestLocale(locale);
  const id = getIdFromSlugifyString(slug);
  const reslut = await wrapperServerApi(() => dishApiRequets.getById(id));
  const dish = reslut?.payload.data;
  return <DishDetail dish={dish} />;
}
