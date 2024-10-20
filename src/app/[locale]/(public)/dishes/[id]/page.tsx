import { dishApiRequets } from '@/app/apiRequests/dish';
import { wrapperServerApi } from '@/lib/utils';
import React from 'react';
import DishDetail from '@/app/[locale]/(public)/dishes/[id]/dish-detail';

export default async function DishDetailPage({
  params: { id }
}: {
  params: {
    id: string;
  };
}) {
  const reslut = await wrapperServerApi(() => dishApiRequets.getById(Number(id)));
  const dish = reslut?.payload.data;
  return <DishDetail dish={dish} />;
}
