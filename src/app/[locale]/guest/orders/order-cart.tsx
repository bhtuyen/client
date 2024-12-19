'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { useOrderByTableQuery } from '@/app/queries/useOrder';
import TImage from '@/components/t-image';
import { Badge } from '@/components/ui/badge';
import { DishCategory, OrderStatus } from '@/constants/enum';
import { formatCurrency, getPrice } from '@/lib/utils';

export default function OrderCart() {
  const { data, refetch } = useOrderByTableQuery('', true);

  const tOrderStatus = useTranslations('order-status');

  const orders = useMemo(() => data?.payload.data || [], [data]);

  const { waitingForPaying, paid } = useMemo(
    () =>
      orders.reduce(
        (result, { quantity, status, dishSnapshot }) => {
          if (
            (status === OrderStatus.Delivered || status === OrderStatus.Processing || status === OrderStatus.Pending) &&
            dishSnapshot.category === DishCategory.Paid
          ) {
            return {
              ...result,
              waitingForPaying: {
                price: result.paid.price + dishSnapshot.price * quantity,
                quantity: result.waitingForPaying.quantity + quantity
              }
            };
          }

          if (status === OrderStatus.Paid && dishSnapshot.category === DishCategory.Paid) {
            return {
              ...result,
              paid: {
                price: result.paid.price + dishSnapshot.price * quantity,
                quantity: result.paid.quantity + quantity
              }
            };
          }

          return result;
        },
        {
          waitingForPaying: {
            price: 0,
            quantity: 0
          },
          paid: {
            price: 0,
            quantity: 0
          }
        }
      ),
    [orders]
  );

  return (
    <>
      {orders.map((order) => (
        <div key={order.id} className='flex gap-4'>
          <div className='flex-shrink-0 relative'>
            <TImage
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
            <p className='text-xs font-semibold'>{getPrice(order.dishSnapshot)}</p>
          </div>
          <div className='flex-shrink-0 ml-auto flex justify-center items-center'>
            <Badge variant='outline'>{tOrderStatus(order.status)}</Badge>
          </div>
        </div>
      ))}
      <div className='sticky bottom-0'>
        <div className='w-full flex space-x-4 text-xl font-semibold'>
          <span>Đơn chưa thanh toán · {waitingForPaying.quantity} món</span>
          <span>{formatCurrency(waitingForPaying.price)}</span>
        </div>
      </div>
      <div className='sticky bottom-0'>
        <div className='w-full flex space-x-4 text-xl font-semibold'>
          <span>Đơn đã thanh toán · {paid.quantity} món</span>
          <span>{formatCurrency(paid.price)}</span>
        </div>
      </div>
    </>
  );
}
