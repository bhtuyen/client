import Modal from '@/app/[locale]/(public)/@modal/(.)dishes/[slug]/modal';
import { dishApiRequets } from '@/app/apiRequests/dish';
import { formatCurrency, generateSlugify, getIdFromSlugifyString, wrapperServerApi } from '@/lib/utils';
import React from 'react';
import Image from 'next/image';
import { routing } from '@/i18n/routing';
import { unstable_setRequestLocale } from 'next-intl/server';
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

export default async function page({
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
  return (
    <Modal>
      {dish && (
        <div className='space-y-4'>
          <h1 className='text-2xl lg:text-3xl font-semibold'>{dish.name}</h1>
          <div className='font-semibold'>Giá: {formatCurrency(dish.price)}</div>
          <Image
            src={dish.image}
            className='object-cover w-full h-full max-w-[1080px] max-h-[1080px] rounded-md'
            quality={100}
            width={300}
            height={300}
            alt={dish.name}
          />
          <p>{dish.description}</p>
        </div>
      )}
      {!dish && <div>Không tìm thấy món ăn</div>}
    </Modal>
  );
}
