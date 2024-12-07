'use client';
import GuestsDialog from '@/app/[locale]/manage/orders/guests-dialog';
import { TablesDialog } from '@/app/[locale]/manage/orders/tables-dialog';
import { useDishListQuery } from '@/app/queries/useDish';
import { useCreateGuestMutation } from '@/app/queries/useGuest';
import { useCreateOrderMutation } from '@/app/queries/useOrder';
import TQuantity from '@/components/t-quantity';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Form, FormField, FormItem } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DishCategory, DishStatus } from '@/constants/enum';
import { toast } from '@/hooks/use-toast';
import { cn, formatCurrency, handleErrorApi } from '@/lib/utils';
import { GuestDto, guestLogin, GuestLogin } from '@/schemaValidations/guest.schema';
import { CreateOrder } from '@/schemaValidations/order.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

export default function AddOrder() {
  const [open, setOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<GuestDto | null>(null);
  const [isNewGuest, setIsNewGuest] = useState(true);
  const [createOrders, setCreateOrders] = useState<CreateOrder[]>([]);
  const { data } = useDishListQuery();
  const dishes = useMemo(() => data?.payload.data ?? [], [data?.payload.data]);

  const createOrderMutation = useCreateOrderMutation();
  const createGuestMutation = useCreateGuestMutation();

  const totalPrice = useMemo(() => {
    return dishes.reduce((result, dish) => {
      const order = createOrders.find((order) => order.dishId === dish.id);
      if (!order) return result;
      if (dish.category === DishCategory.Paid) {
        return result + dish.price * order.quantity;
      }
      return result;
    }, 0);
  }, [dishes, createOrders]);

  const form = useForm<GuestLogin>({
    resolver: zodResolver(guestLogin),
    defaultValues: {
      tableNumber: undefined
    }
  });
  const tableNumber = form.watch('tableNumber');

  const handleQuantityChange = ({ dishId, quantity, options }: CreateOrder) => {
    setCreateOrders((prevOrders) => {
      if (quantity === 0) {
        return prevOrders.filter((order) => order.dishId !== dishId);
      }
      const index = prevOrders.findIndex((order) => order.dishId === dishId);
      if (index === -1) {
        return [...prevOrders, { dishId, options, quantity }];
      }
      const newOrders = [...prevOrders];
      newOrders[index] = { ...newOrders[index], quantity };
      return prevOrders;
    });
  };

  const handleOrder = async () => {
    try {
      let guestId = selectedGuest?.id;
      if (isNewGuest) {
        const guestRes = await createGuestMutation.mutateAsync({
          tableNumber
        });

        guestId = guestRes.payload.data.id;
      }
      if (!guestId) {
        toast({ description: 'Hãy chọn một khách hàng' });
        return;
      }
      await createOrderMutation.mutateAsync({
        guestId: guestId!,
        orders: createOrders
      });
      reset();
    } catch (error) {
      handleErrorApi({ error, setError: form.setError });
    }
  };

  const reset = () => {
    form.reset();
    setIsNewGuest(true);
    setSelectedGuest(null);
    setCreateOrders([]);
    setOpen(false);
  };

  return (
    <Dialog
      onOpenChange={(value) => {
        if (!value) {
          reset();
        }
        setOpen(value);
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button size='sm' className='h-7 gap-1'>
          <PlusCircle className='h-3.5 w-3.5' />
          <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>Tạo đơn hàng</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px] max-h-screen overflow-auto'>
        <DialogHeader>
          <DialogTitle>Tạo đơn hàng</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
          <Label htmlFor='isNewGuest'>Khách hàng mới</Label>
          <div className='col-span-3 flex items-center'>
            <Switch id='isNewGuest' checked={isNewGuest} onCheckedChange={setIsNewGuest} />
          </div>
        </div>
        {isNewGuest && (
          <Form {...form}>
            <form noValidate className='grid auto-rows-max items-start gap-4 md:gap-8' id='add-employee-form'>
              <div className='grid gap-4 py-4'>
                <FormField
                  control={form.control}
                  name='tableNumber'
                  render={({ field }) => (
                    <FormItem>
                      <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                        <Label htmlFor='tableNumber'>Chọn bàn</Label>
                        <div className='col-span-3 w-full space-y-2'>
                          <div className='flex items-center gap-4'>
                            <div>{field.value}</div>
                            <TablesDialog
                              onChoose={(table) => {
                                field.onChange(table.number);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        )}
        {!isNewGuest && (
          <GuestsDialog
            onChoose={(guest) => {
              setSelectedGuest(guest);
            }}
          />
        )}
        {!isNewGuest && selectedGuest && (
          <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
            <Label htmlFor='selectedGuest'>Khách đã chọn</Label>
            <div className='col-span-3 w-full gap-4 flex items-center'>
              <div>(#{selectedGuest.id})</div>
              <div>Bàn: {selectedGuest.tableNumber}</div>
            </div>
          </div>
        )}
        {dishes
          .filter((dish) => dish.status !== DishStatus.Hidden)
          .map((dish) => (
            <div
              key={dish.id}
              className={cn('flex gap-4', {
                'pointer-events-none': dish.status === DishStatus.Unavailable
              })}
            >
              <div className='flex-shrink-0 relative'>
                {dish.status === DishStatus.Unavailable && (
                  <span className='absolute inset-0 flex items-center justify-center text-sm'>Hết hàng</span>
                )}
                <Image
                  src={dish.image ?? '/60000155_kem_sua_chua_1.jpg'}
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
                <p className='text-xs font-semibold'>
                  {dish.category == DishCategory.Paid ? formatCurrency(dish.price) : DishCategory.Buffet}
                </p>
              </div>
              <div className='flex-shrink-0 ml-auto flex justify-center items-center'>
                <TQuantity
                  onChange={(value) =>
                    handleQuantityChange({ dishId: dish.id, options: dish.options, quantity: value })
                  }
                  value={createOrders.find((order) => order.dishId === dish.id)?.quantity ?? 0}
                />
              </div>
            </div>
          ))}
        <DialogFooter>
          <Button className='w-full justify-between' onClick={handleOrder} disabled={createOrders.length === 0}>
            <span>Đặt hàng · {createOrders.length} món</span>
            <span>{formatCurrency(totalPrice)}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
