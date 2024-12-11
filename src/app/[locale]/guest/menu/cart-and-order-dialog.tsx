'use client';
import { useGuestOrderMutation, useGuestOrdersQuery } from '@/app/queries/useGuest';
import { useAppStore } from '@/components/app-provider';
import TButton from '@/components/t-button';
import TImage from '@/components/t-image';
import type { TabsKeyType } from '@/components/tabs';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DishCategory } from '@/constants/enum';
import { formatCurrency, getPrice, handleErrorApi } from '@/lib/utils';
import clsx from 'clsx';
import { Minus, Plus, ShoppingCart, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

const tabs = [
  { key: 'cart', label: 'Giỏ đồ ăn' },
  { key: 'ordered', label: 'Món đã gọi' }
] as const;

export default function CartAndOrderDialog() {
  const [activeTab, setActiveTab] = useState<TabsKeyType<typeof tabs>>('cart');
  const { cart, changeQuantity, removeDishesFromCart: removeDishFromCart, removeAllCart } = useAppStore();

  const sumPrice = cart.reduce((sum, dish) => sum + (dish.category === DishCategory.Buffet ? 0 : dish.price * dish.quantity), 0);

  const tOrderStatus = useTranslations('order-status');

  const guestOrderMutation = useGuestOrderMutation();
  const { data, refetch } = useGuestOrdersQuery();

  const handleGuestOrder = async () => {
    try {
      await guestOrderMutation.mutateAsync(cart.map((dish) => ({ dishId: dish.id, quantity: dish.quantity, options: dish.options })));
      setActiveTab('ordered');
      removeAllCart();
      refetch();
    } catch (error) {
      handleErrorApi({ error });
    }
  };

  const orders = useMemo(() => data?.payload.data || [], [data]);

  const sumOrder = orders.reduce(
    (sum, order) => {
      const dishSnapshot = order.dishSnapshot;
      if (dishSnapshot.category === DishCategory.Buffet) return sum;
      return sum + dishSnapshot.price * order.quantity;
    },

    0
  );

  return (
    <Dialog modal={false}>
      <DialogTrigger asChild>
        <div className='rounded-full bg-[#f2f2f2] h-[60%] aspect-square flex items-center justify-center relative'>
          <ShoppingCart color='#000000' />
          <span className='text-white absolute top-[-4px] right-[-4px] rounded-full flex justify-center items-center bg-red-500 h-[45%] aspect-square text-[12px]'>{cart.length}</span>
        </div>
      </DialogTrigger>
      <DialogContent className='w-full h-full p-0 bg-white text-black flex flex-col' isHiddenClose>
        <DialogHeader className='p-4 pb-2 z-10'>
          <DialogTitle className='flex-auto relative text-center'>
            Gọi món của bạn
            <DialogClose className='absolute top-[50%] translate-y-[-50%] left-0'>
              <X className='h-6 w-6' />
            </DialogClose>
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <Tabs value={activeTab} className='w-full' onValueChange={(value) => setActiveTab(value as TabsKeyType<typeof tabs>)}>
          <TabsList className='w-full bg-white p-0 h-11'>
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className='bg-white relative text-base flex-1 data-[state=active]:bg-white data-[state=active]:text-red-700 data-[state=active]:shadow-none data-[state=active]:before:contents-[""] data-[state=active]:before:absolute data-[state=active]:before:bottom-0 data-[state=active]:before:right-0 data-[state=active]:before:left-0 data-[state=active]:before:border-b-[2px] data-[state=active]:before:border-red-500'
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value='cart'>
            <div>
              {cart.length > 0 && (
                <div className='flex-auto bg-[#e6e6e6] overflow-y-auto'>
                  <div className='p-3 grid gap-3'>
                    {cart.map((dish) => (
                      <div className='bg-white h-[140px] rounded-md flex p-2 relative text-black' key={dish.id}>
                        <div className='relative h-full aspect-square'>
                          <TImage src={dish.image} alt={dish.name} fill className='rounded-md' sizes='' />
                        </div>
                        <div className='flex-auto flex flex-col justify-between pl-2'>
                          <div>
                            <p>{dish.name}</p>
                          </div>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center rounded-2xl gap-3 border px-2 py-1'>
                              <Minus size={20} onClick={() => changeQuantity(dish.id, dish.quantity - 1)} />
                              <p>{dish.quantity}</p>
                              <Plus size={20} onClick={() => changeQuantity(dish.id, dish.quantity + 1)} />
                            </div>
                            <p className='text-red-950 font-medium'>{dish.category === DishCategory.Buffet ? 'Buffet' : formatCurrency(dish.price * dish.quantity)}</p>
                          </div>
                        </div>
                        <X className='h-6 w-6 absolute top-3 right-3' onClick={() => removeDishFromCart([dish.id])} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {cart.length === 0 && (
                <div className='flex-auto bg-white flex flex-col items-center justify-center'>
                  <TImage src='/empty-cart.jpg' alt='empty-cart' width={200} height={200} />
                  <p>{`Bạn chưa chọn món nào`}</p>
                </div>
              )}
            </div>
            <div
              className={clsx({
                'shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-2px_rgba(0,0,0,0.1)] z-10 p-4': cart.length > 0,
                'p-4': cart.length === 0
              })}
            >
              {cart.length > 0 && (
                <div className='w-full'>
                  <div className='flex items-center justify-between pb-4 text-lg'>
                    <p>Tạm tính</p>
                    <p className='text-red-950 font-medium text-xl'>{formatCurrency(sumPrice)}</p>
                  </div>
                  <div className='flex items-center gap-4 pb-4'>
                    <TButton variant={'outline'} className='bg-white w-full h-[50px] text-base'>
                      Thanh toán
                    </TButton>
                    <TButton className='text-white bg-black w-full h-[50px] text-base' variant={'ghost'} onClick={() => handleGuestOrder()}>
                      Gọi món ngay
                    </TButton>
                  </div>
                </div>
              )}
              {cart.length === 0 && (
                <DialogClose asChild>
                  <TButton className='text-white bg-black w-full h-[50px] text-base' variant={'ghost'}>
                    Chọn món ngay
                  </TButton>
                </DialogClose>
              )}
            </div>
          </TabsContent>

          <TabsContent value='ordered'>
            {activeTab === 'ordered' && orders.length > 0 && (
              <div className='flex-auto overflow-y-auto'>
                {orders.map(({ id, quantity, status, dishSnapshot }) => (
                  <div className='flex p-4 relative text-black border-b-[1px] border-b-[#e3e3e3] gap-4 items-center' key={id}>
                    <span className='bg-[#f2f2f2] text-lg font-medium h-8 w-8 rounded-md flex items-center justify-center'>{quantity}x</span>
                    <span className='text-lg font-medium flex-auto'>{dishSnapshot.name}</span>
                    <span>{tOrderStatus(status)}</span>
                    <span className='text-red-950 font-medium'>{getPrice(dishSnapshot)}</span>
                  </div>
                ))}
              </div>
            )}
            <DialogFooter
              className={clsx({
                'shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-2px_rgba(0,0,0,0.1)] z-10 p-4': cart.length > 0,
                'p-4': cart.length === 0
              })}
            >
              {orders.length > 0 && (
                <div className='text-white bg-black w-full h-[50px] flex items-center justify-between px-4 text-lg rounded-lg'>
                  <span>Tổng: {formatCurrency(sumOrder)}</span>
                  <span>Thanh toán ngay</span>
                </div>
              )}
              {orders.length === 0 && (
                <TButton className='text-white bg-black w-full h-[50px] text-base' variant={'ghost'}>
                  Chọn món ngay
                </TButton>
              )}
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
