'use client';

import { Cross2Icon } from '@radix-ui/react-icons';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { DishDto, DishInCart } from '@/schemaValidations/dish.schema';

import { useAppStore } from '@/components/app-provider';
import TButton from '@/components/t-button';
import TImage from '@/components/t-image';
import TQuantity from '@/components/t-quantity';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DishCategory, DishStatus } from '@/constants/enum';
import { capitalize, formatCurrency, getDishOptions, removeAccents } from '@/lib/utils';

export default function AddToCartDialog({ dish }: { dish: DishDto }) {
  const [quantity, setQuantity] = useState(0);
  const [dishOptions, setDishOptions] = useState<
    {
      id: string;
      option: string;
      checked: boolean;
    }[]
  >(dish.options ? getDishOptions(dish.options).map((option) => ({ id: removeAccents(option), option, checked: false })) : []);

  const [guestOption, setGuestOption] = useState<string>('');

  const { pushToCart } = useAppStore();

  const tButton = useTranslations('t-button');
  const tGuestAddToCart = useTranslations('guest.add-to-cart');

  const onCheckedChange = (id: string) => (checked: boolean) => {
    setDishOptions((prev) =>
      prev.map((option) => {
        if (option.id === id) {
          return {
            ...option,
            checked
          };
        }
        return option;
      })
    );
  };

  const reset = () => {
    setQuantity(0);
    setDishOptions([]);
    setGuestOption('');
  };

  const getOrderOptions = (guestOption: string) => {
    const dishOptionsChecked = dishOptions
      .filter((option) => option.checked)
      .map((option) => option.option)
      .join(', ');

    return capitalize(`${dishOptionsChecked}${guestOption ? `, ${guestOption}` : ''}`);
  };

  const handleAddToCart = () => {
    const dishInCart: DishInCart = {
      ...dish,
      quantity,
      options: getOrderOptions(guestOption)
    };
    pushToCart([dishInCart]);
    reset();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <TButton className='bg-black shadow-sm rounded-full' size='icon' variant='ghost'>
          <Plus size={30} color='#fff' />
        </TButton>
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
          <TImage src={dish.image} alt={dish.name} className='w-full aspect-auto' width={200} height={200} />
          <div className='p-4 rounded-tl-[2rem] rounded-tr-[2rem] bg-white flex flex-col'>
            <h2 className='text-2xl font-bold'>{dish.name}</h2>
            <span className='text-red-500'>{dish.category === DishCategory.Paid ? formatCurrency(dish.price) : dish.category}</span>
            <h3 className='text-lg font-semibold mt-2'>{tGuestAddToCart('dish-description')}</h3>
            <p className='text-sm'>{dish.description}</p>
            {dishOptions.length > 0 && <h3 className='text-base font-semibold mt-2 mb-1'>{tGuestAddToCart('options')}</h3>}
            {dishOptions.length > 0 && (
              <ul className='space-y-2'>
                {dishOptions.map(({ id, option, checked }) => (
                  <li key={id} className='flex items-center gap-x-2'>
                    <Checkbox id={id} className='w-[20px] h-[20px] border-black' checked={checked} onCheckedChange={onCheckedChange(id)} />
                    <Label className='text-sm capitalize' htmlFor={id}>
                      {option}
                    </Label>
                  </li>
                ))}
              </ul>
            )}
            <Label htmlFor='description' className='text-base font-semibold mt-2'>
              {tGuestAddToCart('your-request')}
            </Label>
            <Textarea id='description' value={guestOption} onChange={(e) => setGuestOption(e.target.value)} />
          </div>
        </div>
        <DialogFooter className='flex flex-row items-center gap-4 py-2 px-4'>
          <TQuantity
            value={quantity}
            onChange={(value) => setQuantity(value)}
            disabled={dish.status === DishStatus.Unavailable}
            classIcon='h-11 w-11 bg-black text-white'
            classInput='h-11 text-base '
          />
          <DialogClose className='flex-auto' disabled={quantity == 0} asChild>
            <TButton type='button' variant={'ghost'} className='w-full h-11 bg-black text-white' disabled={quantity == 0} onClick={handleAddToCart}>
              {tButton('add-to-cart')}
            </TButton>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
