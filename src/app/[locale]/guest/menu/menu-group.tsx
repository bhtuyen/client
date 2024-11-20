'use client';
import { useDishListQuery } from '@/app/queries/useDish';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { DishCategory } from '@/constants/enum';
import { formatCurrency } from '@/lib/utils';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

export default function MenuGroup() {
  const tabs = [
    { key: 'cart', label: 'Giỏ đồ ăn' },
    { key: 'ordered', label: 'Món đã gọi' }
  ];
  const dishesListQuery = useDishListQuery();
  const dishes = dishesListQuery.data?.payload.data ?? [];
  return (
    <div>
      <p>Rượu</p>
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-5'>
        {dishes.map((dish) => (
          <div className='grid grid-rows-10 h-[350px] bg-white shadow-sm rounded-md p-3' key={dish.id}>
            <div className='row-span-6 relative'>
              <Image
                src={dish.image}
                alt={dish.name}
                fill
                className='h-full w-full rounded-md'
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              />
            </div>
            <div className='row-span-2 flex items-center'>Món ngon</div>
            <div className='row-span-2 flex justify-between items-end'>
              <div>{dish.category === DishCategory.Paid ? formatCurrency(dish.price) : dish.category}</div>
              <Dialog modal={false}>
                <DialogTrigger asChild>
                  <Button className='bg-black shadow-sm rounded-full' size='icon' variant='ghost'>
                    <Plus size={30} color='#fff' />
                  </Button>
                </DialogTrigger>
                <DialogContent className='w-full h-full p-0 bg-white text-black flex flex-col' isHiddenClose>
                  <DialogHeader className='relative'>
                    <DialogClose className='absolute top-3 left-3'>
                      <Cross2Icon className='h-6 w-6' />
                    </DialogClose>
                    <DialogTitle hidden />
                    <DialogDescription hidden />
                    <div className='w-full aspect-square relative'>
                      <Image src={dish.image} alt={dish.name} fill sizes='' />
                    </div>
                  </DialogHeader>
                  <div className='flex-auto p-4 rounded-[2rem]'>
                    <h2 className='text-2xl font-medium'>{dish.name}</h2>
                  </div>
                  <DialogFooter>
                    <Button type='button'>Thêm vào giỏ</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
