'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useDishListQuery } from '@/app/queries/useDish';
import Quantity from '@/app/guest/menu/quantity';
import { useMemo, useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { GuestCreateOrdersBodyType } from '@/schemaValidations/guest.schema';

export default function MenuOrder() {
  const { data } = useDishListQuery();

  const dishes = useMemo(() => {
    return data?.payload.data || [];
  }, [data]);

  const [orders, setOrders] = useState<GuestCreateOrdersBodyType>([]);

  const handleQuantityChange = (dishId: number, quantity: number) => {
    setOrders((prevOrder) => {
      if (quantity === 0) {
        return prevOrder.filter((dish) => dish.dishId !== dishId);
      }

      const dishIndex = prevOrder.findIndex((dish) => dish.dishId === dishId);

      if (dishIndex === -1) {
        return [...prevOrder, { dishId, quantity }];
      }

      const newOrder = [...prevOrder];
      newOrder[dishIndex].quantity = quantity;
      return newOrder;
    });
  };

  const totalPrice = useMemo(() => {
    return orders.reduce((total, order) => {
      return total + (dishes.find((dish) => dish.id === order.dishId)?.price ?? 0) * order.quantity;
    }, 0);
  }, [dishes, orders]);

  return (
    <div className='max-w-[400px] mx-auto space-y-4'>
      <h1 className='text-center text-xl font-bold'>🍕 Menu quán</h1>
      {dishes.map((dish) => (
        <div key={dish.id} className='flex gap-4'>
          <div className='flex-shrink-0'>
            <Image
              src={dish.image}
              alt={dish.name}
              height={100}
              width={100}
              quality={100}
              className='object-cover w-[80px] h-[80px] rounded-md'
            />
          </div>
          <div className='space-y-1'>
            <h3 className='text-sm'>{dish.name}</h3>
            <p className='text-xs'>{dish.description}</p>
            <p className='text-xs font-semibold'>{formatCurrency(dish.price)}</p>
          </div>
          <div className='flex-shrink-0 ml-auto flex justify-center items-center'>
            <Quantity
              onChange={(value) => handleQuantityChange(dish.id, value)}
              value={orders.find((order) => order.dishId === dish.id)?.quantity || 0}
            />
          </div>
        </div>
      ))}
      <div className='sticky bottom-0'>
        <Button className='w-full justify-between'>
          <span>Giỏ hàng · {orders.length} món</span>
          <span>{formatCurrency(totalPrice)}</span>
        </Button>
      </div>
    </div>
  );
}
