import Modal from '@/app/[locale]/(public)/@modal/(.)dishes/[id]/modal';
import { dishApiRequets } from '@/app/apiRequests/dish';
import { formatCurrency, wrapperServerApi } from '@/lib/utils';
import React from 'react';
import Image from 'next/image';

export default async function page({
  params: { id }
}: {
  params: {
    id: string;
  };
}) {
  const reslut = await wrapperServerApi(() => dishApiRequets.getById(Number(id)));
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
