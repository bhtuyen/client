'use client';

import { useGuestOrderListQuery } from '@/app/queries/useGuest';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, getVietnameseOrderStatus } from '@/lib/utils';
import Image from 'next/image';
import { useMemo } from 'react';

export default function OrderCart() {
  const { data } = useGuestOrderListQuery();

  const orders = useMemo(() => data?.payload.data || [], [data]);

  const totalPrice = useMemo(
    () => orders.reduce((total, order) => total + order.dishSnapshot.price * order.quantity, 0),
    [orders]
  );

  return (
    <>
      {orders.map((order) => (
        <div key={order.id} className='flex gap-4'>
          <div className='flex-shrink-0 relative'>
            <Image
              src={order.dishSnapshot.image}
              alt={order.dishSnapshot.name}
              height={100}
              width={100}
              quality={100}
              className='object-cover w-[80px] h-[80px] rounded-md'
            />
          </div>
          <div className='space-y-1'>
            <h3 className='text-sm'>{order.dishSnapshot.name}</h3>
            <p className='text-xs font-semibold'>
              {formatCurrency(order.dishSnapshot.price)} x {order.quantity}
            </p>
          </div>
          <div className='flex-shrink-0 ml-auto flex justify-center items-center'>
            <Badge variant='outline'>{getVietnameseOrderStatus(order.status)}</Badge>
          </div>
        </div>
      ))}
      <div className='sticky bottom-0'>
        <div className='w-full flex space-x-4 text-xl font-semibold'>
          <span>Giá tiền · {orders.length} món</span>
          <span>{formatCurrency(totalPrice)}</span>
        </div>
      </div>
    </>
  );
}
