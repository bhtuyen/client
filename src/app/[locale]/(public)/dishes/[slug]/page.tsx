import { dishApiRequets } from '@/app/apiRequests/dish';
import { getIdFromSlugifyString, wrapperServerApi } from '@/lib/utils';
import React from 'react';
import DishDetail from '@/app/[locale]/(public)/dishes/[slug]/dish-detail';

export default async function DishDetailPage({
  params: { slug }
}: {
  params: {
    slug: string;
  };
}) {
  const id = getIdFromSlugifyString(slug);
  const reslut = await wrapperServerApi(() => dishApiRequets.getById(id));
  const dish = reslut?.payload.data;
  return <DishDetail dish={dish} />;
}
