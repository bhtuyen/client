'use client';
import { Minus, Plus, ShoppingCart, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import type { OrderDtoDetail } from '@/schemaValidations/order.schema';

import { useGuestOrderMutation } from '@/app/queries/useGuest';
import { useOrderByTableQuery } from '@/app/queries/useOrder';
import { useAppStore } from '@/components/app-provider';
import TButton from '@/components/t-button';
import TImage from '@/components/t-image';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DishCategory } from '@/constants/enum';
import { toast } from '@/hooks/use-toast';
import { cn, formatCurrency, getPrice, handleErrorApi } from '@/lib/utils';

const tabs = [
  { key: 'cart', label: 'Giỏ đồ ăn' },
  { key: 'ordered', label: 'Món đã gọi' }
] as const;

type TabsKeyType = (typeof tabs)[number]['key'];

export default function CartAndOrderDialog({ number }: { number: string }) {
  const [activeTab, setActiveTab] = useState<TabsKeyType>('cart');
  const { cart, changeQuantity, removeDishesFromCart: removeDishFromCart, removeAllCart, socket } = useAppStore();

  const sumPrice = cart.reduce((sum, dish) => sum + (dish.category === DishCategory.Buffet ? 0 : dish.price * dish.quantity), 0);

  const tOrderStatus = useTranslations('order-status');
  const tMessage = useTranslations('t-message');

  const guestOrderMutation = useGuestOrderMutation();
  const { data, refetch } = useOrderByTableQuery(number, activeTab === 'ordered');

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

  useEffect(() => {
    function onUpadteOrder(data: OrderDtoDetail) {
      const {
        dishSnapshot: { name },
        quantity,
        status
      } = data;

      toast({
        description: tMessage('update-order', { name, quantity, status: tOrderStatus(status) })
      });
      refetch();
    }
    function onPayment(data: OrderDtoDetail[]) {
      toast({
        description: tMessage('payment', { orders: data.length })
      });
      refetch();
    }

    socket?.on('update-order', onUpadteOrder);
    socket?.on('payment', onPayment);

    return () => {
      socket?.off('update-order', onUpadteOrder);
      socket?.off('payment', onPayment);
    };
  }, [refetch, socket, tMessage, tOrderStatus]);

  return (
    <Dialog modal={false}>
      <DialogTrigger asChild>
        <TButton
          variant={'ghost'}
          tooltip='cart'
          className='rounded-full bg-[#f2f2f2] h-[60%] aspect-square flex items-center justify-center relative p-0'
        >
          <ShoppingCart color='#000000' />
          <span className='text-white absolute top-[-4px] right-[-4px] rounded-full flex justify-center items-center bg-red-500 h-[45%] aspect-square text-[12px]'>
            {cart.length}
          </span>
        </TButton>
      </DialogTrigger>
      <DialogContent className='w-full h-full p-0 bg-white text-black flex flex-col' isHiddenClose>
        <DialogHeader className='p-4 pb-2 z-10 h-12'>
          <DialogTitle className='flex-auto relative text-center'>
            Gọi món của bạn
            <DialogClose className='absolute top-[50%] translate-y-[-50%] left-0'>
              <X className='h-6 w-6' />
            </DialogClose>
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <Tabs value={activeTab} className='w-full h-[calc(100%_-_3rem)]' onValueChange={(value) => setActiveTab(value as TabsKeyType)}>
          <TabsList className='w-full bg-white p-0 h-11 shadow-sm'>
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

          <TabsContent value='cart' className='mt-0 h-[calc(100%_-_2.75rem)]'>
            <div
              className={cn({
                'bg-white p-0 h-[calc(100%_-_5rem)]': cart.length == 0,
                'bg-[#e6e6e6] p-3 flex-1 h-[calc(100%_-_9rem)] overflow-y-auto space-y-3': cart.length > 0
              })}
            >
              {cart.length > 0 &&
                cart.map((dish) => (
                  <div className='bg-white h-[140px] rounded-md flex p-2 relative text-black' key={dish.id}>
                    <div className='relative h-full aspect-square'>
                      <TImage src={dish.image} alt={dish.name} fill className='rounded-md' sizes='' />
                    </div>
                    <div className='flex-auto flex flex-col justify-between pl-2'>
                      <div>
                        <p>{dish.name}</p>
                      </div>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center rounded-2xl gap-1 border px-2 py-1'>
                          <Minus size={20} onClick={() => changeQuantity(dish.id, dish.quantity - 1)} />
                          <p className='w-6 text-center'>{dish.quantity}</p>
                          <Plus size={20} onClick={() => changeQuantity(dish.id, dish.quantity + 1)} />
                        </div>
                        <p className='text-red-950 font-medium'>
                          {dish.category === DishCategory.Buffet ? 'Buffet' : formatCurrency(dish.price * dish.quantity)}
                        </p>
                      </div>
                    </div>
                    <X className='h-6 w-6 absolute top-3 right-3' onClick={() => removeDishFromCart([dish.id])} />
                  </div>
                ))}

              {cart.length === 0 && (
                <div className='bg-white h-full flex flex-col items-center justify-center'>
                  <TImage src='/empty-cart.jpg' alt='empty-cart' width={200} height={200} />
                  <p>{`Bạn chưa chọn món nào`}</p>
                </div>
              )}
            </div>

            <div
              className={cn({
                'shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-2px_rgba(0,0,0,0.1)] z-10 p-4 h-36': cart.length > 0,
                'p-4 h-auto': cart.length === 0
              })}
            >
              {cart.length > 0 && (
                <>
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
                </>
              )}
              {cart.length === 0 && (
                <DialogClose asChild>
                  <TButton className='text-white bg-black w-full h-12 text-base' variant={'ghost'}>
                    Chọn món ngay
                  </TButton>
                </DialogClose>
              )}
            </div>
          </TabsContent>

          <TabsContent value='ordered' className='mt-0 h-[calc(100%_-_2.75rem)]'>
            <div className={'p-3 flex-1 h-[calc(100%_-_5rem)] overflow-y-auto'}>
              {orders.length > 0 &&
                orders.map(({ id, quantity, status, dishSnapshot }) => (
                  <div className='flex p-4 relative text-black border-b-[1px] border-b-[#e3e3e3] gap-4 items-center' key={id}>
                    <span className='bg-[#f2f2f2] text-lg font-medium h-8 w-8 rounded-md flex items-center justify-center'>{quantity}x</span>
                    <span className='text-lg font-medium flex-auto'>{dishSnapshot.name}</span>
                    <span>{tOrderStatus(status)}</span>
                    <span className='text-red-950 font-medium'>{getPrice(dishSnapshot)}</span>
                  </div>
                ))}

              {orders.length === 0 && (
                <div className='bg-white h-full flex flex-col items-center justify-center'>
                  <TImage src='/empty-cart.jpg' alt='empty-cart' width={200} height={200} />
                  <p>{`Bạn chưa gọi món nào`}</p>
                </div>
              )}
            </div>

            <div className='shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-2px_rgba(0,0,0,0.1)] z-10 p-4'>
              {orders.length > 0 && (
                <div className='text-white bg-black w-full h-12 flex items-center justify-between px-4 text-lg rounded-lg'>
                  <span>Tổng: {formatCurrency(sumOrder)}</span>
                  <span>Thanh toán ngay</span>
                </div>
              )}
              {orders.length === 0 && (
                <DialogClose asChild>
                  <TButton className='text-white bg-black w-full h-12 text-base' variant={'ghost'}>
                    Chọn món ngay
                  </TButton>
                </DialogClose>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
