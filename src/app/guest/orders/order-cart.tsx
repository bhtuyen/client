'use client';

import { useGuestOrderListQuery } from '@/app/queries/useGuest';
import { useAppStore } from '@/components/app-provider';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { OrderStatus } from '@/constants/type';
import { formatCurrency, getVietnameseOrderStatus } from '@/lib/utils';
import { PayGuestOrdersResType, UpdateOrderResType } from '@/schemaValidations/order.schema';
import Image from 'next/image';
import { useEffect, useMemo } from 'react';

export default function OrderCart() {
  const { data, refetch } = useGuestOrderListQuery();

  const { socket } = useAppStore();

  const orders = useMemo(() => data?.payload.data || [], [data]);

  const { waitingForPaying, paid } = useMemo(
    () =>
      orders.reduce(
        (result, order) => {
          if (
            order.status === OrderStatus.Delivered ||
            order.status === OrderStatus.Processing ||
            order.status === OrderStatus.Pending
          ) {
            return {
              ...result,
              waitingForPaying: {
                price: result.waitingForPaying.price + order.dishSnapshot.price * order.quantity,
                quantity: result.waitingForPaying.quantity + order.quantity
              }
            };
          }

          if (order.status === OrderStatus.Paid) {
            return {
              ...result,
              paid: {
                price: result.paid.price + order.dishSnapshot.price * order.quantity,
                quantity: result.paid.quantity + order.quantity
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

  useEffect(() => {
    function onUpadteOrder(data: UpdateOrderResType['data']) {
      const {
        dishSnapshot: { name },
        quantity,
        status
      } = data;

      toast({
        description: `Món ${name} (SL: ${quantity}) đã được cập nhật sang trạng thái ${getVietnameseOrderStatus(status)}`
      });
      refetch();
    }
    function onPayment(data: PayGuestOrdersResType['data']) {
      toast({
        description: `Bạn đã thanh toán thành công ${data.length} đơn`
      });
      refetch();
    }

    socket?.on('update-order', onUpadteOrder);
    socket?.on('payment', onPayment);

    return () => {
      socket?.off('update-order', onUpadteOrder);
      socket?.off('payment', onPayment);
    };
  }, [refetch, socket]);

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
