'use client';
import Tabs, { TabsKeyType } from '@/components/tabs';
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
import { Dish } from '@/schemaValidations/dish.schema';
import clsx from 'clsx';
import { Minus, Plus, ShoppingCart, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
export default function Cart() {
  const tabs = [
    { key: 'cart', label: 'Giỏ đồ ăn' },
    { key: 'ordered', label: 'Món đã gọi' }
  ] as const;

  const [activeTab, setActiveTab] = useState<TabsKeyType<typeof tabs>>('cart');

  const dishes: Dish[] = [
    // {
    //   id: 1,
    //   name: 'Cơm chiên',
    //   price: 20000,
    //   image: '/60000155_kem_sua_chua_1.jpg',
    //   description: 'Cơm chiên thập cẩm',
    //   category: 'food',
    //   status: 'Available',
    //   type: 'Paid',
    //   createdAt: new Date(),
    //   updatedAt: new Date()
    // },
    // {
    //   id: 1,
    //   name: 'Cơm chiên',
    //   price: 20000,
    //   image: '/60000155_kem_sua_chua_1.jpg',
    //   description: 'Cơm chiên thập cẩm',
    //   category: 'food',
    //   status: 'Available',
    //   type: 'Paid',
    //   createdAt: new Date(),
    //   updatedAt: new Date()
    // },
    // {
    //   id: 1,
    //   name: 'Cơm chiên',
    //   price: 20000,
    //   image: '/60000155_kem_sua_chua_1.jpg',
    //   description: 'Cơm chiên thập cẩm',
    //   category: 'food',
    //   status: 'Available',
    //   type: 'Paid',
    //   createdAt: new Date(),
    //   updatedAt: new Date()
    // },
    // {
    //   id: 1,
    //   name: 'Cơm chiên',
    //   price: 20000,
    //   image: '/60000155_kem_sua_chua_1.jpg',
    //   description: 'Cơm chiên thập cẩm',
    //   category: 'food',
    //   status: 'Available',
    //   type: 'Paid',
    //   createdAt: new Date(),
    //   updatedAt: new Date()
    // },
    // {
    //   id: 1,
    //   name: 'Cơm chiên',
    //   price: 20000,
    //   image: '/60000155_kem_sua_chua_1.jpg',
    //   description: 'Cơm chiên thập cẩm',
    //   category: 'food',
    //   status: 'Available',
    //   type: 'Paid',
    //   createdAt: new Date(),
    //   updatedAt: new Date()
    // },
    // {
    //   id: 1,
    //   name: 'Cơm chiên',
    //   price: 20000,
    //   image: '/60000155_kem_sua_chua_1.jpg',
    //   description: 'Cơm chiên thập cẩm',
    //   category: 'food',
    //   status: 'Available',
    //   type: 'Paid',
    //   createdAt: new Date(),
    //   updatedAt: new Date()
    // },
    // {
    //   id: 1,
    //   name: 'Cơm chiên',
    //   price: 20000,
    //   image: '/60000155_kem_sua_chua_1.jpg',
    //   description: 'Cơm chiên thập cẩm',
    //   category: 'food',
    //   status: 'Available',
    //   type: 'Paid',
    //   createdAt: new Date(),
    //   updatedAt: new Date()
    // },
    // {
    //   id: 1,
    //   name: 'Cơm chiên',
    //   price: 20000,
    //   image: '/60000155_kem_sua_chua_1.jpg',
    //   description: 'Cơm chiên thập cẩm',
    //   category: 'food',
    //   status: 'Available',
    //   type: 'Paid',
    //   createdAt: new Date(),
    //   updatedAt: new Date()
    // },
    // {
    //   id: 1,
    //   name: 'Cơm chiên',
    //   price: 20000,
    //   image: '/60000155_kem_sua_chua_1.jpg',
    //   description: 'Cơm chiên thập cẩm',
    //   category: 'food',
    //   status: 'Available',
    //   type: 'Paid',
    //   createdAt: new Date(),
    //   updatedAt: new Date()
    // },
    // {
    //   id: 1,
    //   name: 'Cơm chiên',
    //   price: 20000,
    //   image: '/60000155_kem_sua_chua_1.jpg',
    //   description: 'Cơm chiên thập cẩm',
    //   category: 'food',
    //   status: 'Available',
    //   type: 'Paid',
    //   createdAt: new Date(),
    //   updatedAt: new Date()
    // }
  ];
  return (
    <Dialog modal={false}>
      <DialogTrigger asChild>
        <div className='rounded-full bg-[#f2f2f2] h-[60%] aspect-square flex items-center justify-center relative'>
          <ShoppingCart color='#000000' />
          <span className='text-white absolute top-[-4px] right-[-4px] rounded-full flex justify-center items-center bg-red-500 h-[45%] aspect-square text-[12px]'>
            0
          </span>
        </div>
      </DialogTrigger>
      <DialogContent className='w-full h-full p-0 bg-white text-black flex flex-col' isHiddenClose>
        <DialogHeader className='p-4 pb-2 shadow-md z-10'>
          <DialogTitle className='flex-auto relative text-center'>
            Gọi món của bạn
            <DialogClose className='absolute top-[50%] translate-y-[-50%] left-0'>
              <X className='h-6 w-6' />
            </DialogClose>
          </DialogTitle>
          <DialogDescription />
          <Tabs tabs={tabs} onChangeActive={setActiveTab} />
        </DialogHeader>
        {/* Tab Cart */}
        {dishes.length > 0 && activeTab === 'cart' && (
          <div className='flex-auto bg-[#e6e6e6] overflow-y-auto'>
            <div className='p-3 grid gap-3'>
              {dishes.map((dish) => (
                <div className='bg-white h-[140px] rounded-md flex p-2 relative text-black' key={dish.id}>
                  <div className='relative h-full aspect-square'>
                    <Image src={dish.image} alt={dish.name} fill className='rounded-md' sizes='' />
                  </div>
                  <div className='flex-auto flex flex-col justify-between pl-2'>
                    <div>
                      <p>{dish.name}</p>
                    </div>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center rounded-2xl gap-3 border px-2 py-1'>
                        <Minus size={20} />
                        <p>1</p>
                        <Plus size={20} />
                      </div>
                      <p>{dish.category === DishCategory.Buffet ? 'Buffet' : dish.price}</p>
                    </div>
                  </div>
                  <X className='h-6 w-6 absolute top-3 right-3' />
                </div>
              ))}
            </div>
          </div>
        )}
        {dishes.length === 0 && (
          <div className='flex-auto bg-white flex flex-col items-center justify-center'>
            <Image src='/empty-cart.jpg' alt='empty-cart' width={200} height={200} />
            <p>Bạn chưa chọn món nào</p>
          </div>
        )}

        {/* #region Footer */}
        {/* Tab Cart */}
        {activeTab === 'cart' && (
          <DialogFooter
            className={clsx({
              'shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-2px_rgba(0,0,0,0.1)] z-10 p-4': dishes.length > 0,
              'p-4': dishes.length === 0
            })}
          >
            {dishes.length > 0 && (
              <div className='w-full'>
                <div className='flex items-center justify-between pb-4 text-lg'>
                  <p>Tạm tính</p>
                  <p className='text-red-900'>10000</p>
                </div>
                <div className='flex items-center gap-4 pb-4'>
                  <Button variant={'outline'} className='bg-white w-full h-[50px] text-base'>
                    Thanh toán
                  </Button>
                  <Button className='text-white bg-black w-full h-[50px] text-base' variant={'ghost'}>
                    Gọi món ngay
                  </Button>
                </div>
              </div>
            )}
            {dishes.length === 0 && (
              <Button className='text-white bg-black w-full h-[50px] text-base' variant={'ghost'}>
                Chọn món ngay
              </Button>
            )}
          </DialogFooter>
        )}
        {/* Tab Ordered */}
        {activeTab === 'ordered' && (
          <DialogFooter>
            <Button type='submit'>Save changes</Button>
          </DialogFooter>
        )}
        {/* #endregion */}
      </DialogContent>
    </Dialog>
  );
}
