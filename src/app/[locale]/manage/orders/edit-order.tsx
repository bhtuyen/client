'use client';
import { DishesDialog } from '@/app/[locale]/manage/orders/dishes-dialog';
import { useOrderQuery, useUpdateOrderMutation } from '@/app/queries/useOrder';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrderStatus } from '@/constants/enum';
import { toast } from '@/hooks/use-toast';
import { getEnumValues, handleErrorApi } from '@/lib/utils';
import type { DishDto } from '@/schemaValidations/dish.schema';
import { updateOrder, UpdateOrder } from '@/schemaValidations/order.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

export default function EditOrder({
  id,
  setId,
  onSubmitSuccess
}: {
  id?: string | undefined;
  setId: (_value: string | undefined) => void;
  onSubmitSuccess?: () => void;
}) {
  const [selectedDish, setSelectedDish] = useState<DishDto | null>(null);
  const updateOrderMutation = useUpdateOrderMutation();
  const { data } = useOrderQuery(id!);

  const form = useForm<UpdateOrder>({
    resolver: zodResolver(updateOrder),
    defaultValues: {
      status: OrderStatus.Pending,
      dishId: undefined,
      quantity: 1
    }
  });

  const tOrderStatus = useTranslations('order-status');

  useEffect(() => {
    if (data) {
      const {
        status,
        dishSnapshot: { dishId },
        quantity
      } = data.payload.data;

      form.reset({
        status,
        dishId: dishId!,
        quantity
      });

      setSelectedDish(data.payload.data.dishSnapshot);
    }
  }, [data, form]);

  const onSubmit = async (body: UpdateOrder) => {
    if (updateOrderMutation.isPending) return;

    try {
      const result = await updateOrderMutation.mutateAsync(body);
      toast({
        description: result.payload.message
      });

      reset();
      onSubmitSuccess?.();
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError
      });
    }
  };

  const reset = () => {
    setId(undefined);
  };

  return (
    <Dialog
      open={Boolean(id)}
      onOpenChange={(value) => {
        if (!value) {
          reset();
        }
      }}
    >
      <DialogContent className='sm:max-w-[600px] max-h-screen overflow-auto'>
        <DialogHeader>
          <DialogTitle>Cập nhật đơn hàng</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className='grid auto-rows-max items-start gap-4 md:gap-8'
            id='edit-order-form'
            onSubmit={form.handleSubmit(onSubmit, console.log)}
          >
            <div className='grid gap-4 py-4'>
              <FormField
                control={form.control}
                name='dishId'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-4 items-center justify-items-start gap-4'>
                    <FormLabel>Món ăn</FormLabel>
                    <div className='flex items-center col-span-2 space-x-4'>
                      <Avatar className='aspect-square w-[50px] h-[50px] rounded-md object-cover'>
                        <AvatarImage src={selectedDish?.image} />
                        <AvatarFallback className='rounded-none'>{selectedDish?.name}</AvatarFallback>
                      </Avatar>
                      <div>{selectedDish?.name}</div>
                    </div>

                    <DishesDialog
                      onChoose={(dish) => {
                        field.onChange(dish.id);
                        setSelectedDish(dish);
                      }}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='quantity'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='quantity'>Số lượng</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Input
                          id='quantity'
                          inputMode='numeric'
                          pattern='[0-9]*'
                          className='w-16 text-center'
                          {...field}
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <FormLabel>Trạng thái</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl className='col-span-3'>
                          <SelectTrigger className='w-[200px]'>
                            <SelectValue placeholder='Trạng thái' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getEnumValues(OrderStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                              {tOrderStatus(status)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='edit-order-form'>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
