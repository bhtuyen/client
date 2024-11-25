'use client';

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

import { useAppStore } from '@/components/app-provider';
import Quantity from '@/components/quantity';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DishCategory, DishStatus } from '@/constants/enum';
import { formatCurrency } from '@/lib/utils';
import { Dish, DishInCartType } from '@/schemaValidations/dish.schema';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function AddToCart({ dish }: { dish: Dish }) {
  const [quantity, setQuantity] = useState(0);
  const [option, setOption] = useState('');

  const { pushToCart } = useAppStore();

  const getOptions = (options: string | null) => {
    if (!options) return [];
    return options.split(',').map((option) => {
      const str = option.trim();
      return str.charAt(0).toUpperCase() + str.slice(1);
    });
  };

  const handleAddToCart = () => {
    const dishInCart: DishInCartType = {
      ...dish,
      quantity,
      options: option && dish.options ? `${dish.options}, ${option}` : option
    };
    pushToCart(dishInCart);
    setQuantity(0);
    setOption('');
  };

  return (
    <Dialog modal={false}>
      <DialogTrigger asChild>
        <Button className='bg-black shadow-sm rounded-full' size='icon' variant='ghost'>
          <Plus size={30} color='#fff' />
        </Button>
      </DialogTrigger>
      <DialogContent className='w-full h-dvh p-0 bg-white text-black flex flex-col' isHiddenClose>
        <DialogHeader className='relative h-0'>
          <DialogClose className='absolute top-3 left-3 z-10'>
            <Cross2Icon className='h-6 w-6' />
          </DialogClose>
          <DialogTitle hidden />
          <DialogDescription hidden />
        </DialogHeader>
        <div className='flex-auto'>
          <Image src={dish.image} alt={dish.name} className='w-full aspect-auto' width={200} height={200} />
          <div className='p-4 rounded-tl-[2rem] rounded-tr-[2rem] bg-white flex flex-col'>
            <h2 className='text-2xl font-bold'>{dish.name}</h2>
            <span className='text-red-500'>
              {dish.category === DishCategory.Paid ? formatCurrency(dish.price) : dish.category}
            </span>
            <h3 className='text-lg font-semibold mt-2'>Mô tả sản phẩm</h3>
            <p className='text-sm'>{dish.description}</p>
            {getOptions(dish.options).length > 0 && <h3 className='text-base font-semibold mt-2'>Tuỳ chọn</h3>}
            {getOptions(dish.options).map((option) => (
              <Label key={option} htmlFor={option} className='flex item-center gap-2 mt-1'>
                <Checkbox id={option} className='w-[20px] h-[20px] border-black' value={option} />
                <p className='text-sm'>{option}</p>
              </Label>
            ))}
            <Label htmlFor='description'>
              <h4 className='text-base font-semibold mt-2'>Yêu cầu của bạn</h4>
            </Label>
            <Textarea id='description' value={option} onChange={(e) => setOption(e.target.value)} />
          </div>
        </div>
        <DialogFooter className='flex flex-row items-center gap-4 py-2 px-4'>
          <Quantity
            value={quantity}
            onChange={(value) => setQuantity(value)}
            disabled={dish.status === DishStatus.Unavailable}
            classIcon='h-11 w-11 bg-black text-white'
            classInput='h-11 text-base '
          />
          <DialogClose className='flex-auto' disabled={quantity == 0}>
            <Button
              type='button'
              variant={'ghost'}
              className='w-full h-11 bg-black text-white'
              disabled={quantity == 0}
              onClick={handleAddToCart}
            >
              Thêm vào giỏ
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
