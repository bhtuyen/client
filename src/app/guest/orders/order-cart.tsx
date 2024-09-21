'use client';

import { useGuestOrderListQuery } from '@/app/queries/useGuest';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import socket from '@/lib/socket';
import { formatCurrency, getVietnameseOrderStatus } from '@/lib/utils';
import { UpdateOrderResType } from '@/schemaValidations/order.schema';
import Image from 'next/image';
import { useEffect, useMemo } from 'react';

export default function OrderCart() {
  const { data, refetch } = useGuestOrderListQuery();

  const orders = useMemo(() => data?.payload.data || [], [data]);

  const totalPrice = useMemo(
    () => orders.reduce((total, order) => total + order.dishSnapshot.price * order.quantity, 0),
    [orders]
  );

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      console.log(socket.id);
    }

    function onDisconnect() {
      console.log('disconnected');
    }

    function onUpadteOrder(data: UpdateOrderResType['data']) {
      refetch();
      const {
        dishSnapshot: { name },
        quantity,
        status
      } = data;

      toast({
        description: `Món ${name} (SL: ${quantity}) đã được cập nhật sang trạng thái ${getVietnameseOrderStatus(status)}`
      });
    }

    socket.on('connect', onConnect);

    socket.on('update-order', onUpadteOrder);

    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('update-order', onUpadteOrder);
    };
  }, [refetch]);

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
