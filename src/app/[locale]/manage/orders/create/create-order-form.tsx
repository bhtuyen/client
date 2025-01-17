'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Minus, Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import type { DishChooseBody } from '@/schemaValidations/dish.schema';

import ChooseDishTable from '@/app/[locale]/manage/dishes/choose-dish-table';
import { ChooseTable } from '@/app/[locale]/manage/orders/choose-table';
import { useCreateOrderMutation } from '@/app/queries/useOrder';
import QRCodeTable from '@/components/qrcode-table';
import TButton from '@/components/t-button';
import TImage from '@/components/t-image';
import { Badge } from '@/components/ui/badge';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DishCategory, PaymentStatus, TableStatus } from '@/constants/enum';
import { toast } from '@/hooks/use-toast';
import { useRouter } from '@/i18n/routing';
import { getPriceString, getTotalPrice, getTotalQuantity, handleErrorApi } from '@/lib/utils';
import { type DishToOrder, type CreateOrdersTable, type CreateOrdersTableForm, createOrdersTableForm } from '@/schemaValidations/order.schema';

export default function CreateOrdersForm() {
  const createOrderMutation = useCreateOrderMutation();
  const router = useRouter();

  const form = useForm<CreateOrdersTableForm>({
    resolver: zodResolver(createOrdersTableForm),
    values: {
      table: {
        capacity: 0,
        number: '',
        token: '',
        status: TableStatus.Available,
        callStaff: false,
        requestPayment: false,
        id: '',
        dishBuffetId: null,
        paymentStatus: PaymentStatus.Unpaid
      },
      dishes: []
    }
  });

  const table = form.watch('table');
  const dishes = form.watch('dishes');

  const comboBuffetId = useMemo(() => {
    return dishes.find((dish) => dish.category === DishCategory.ComboBuffet)?.id;
  }, [dishes]);

  const tButton = useTranslations('t-button');
  const tInfo = useTranslations('t-info');

  const dishChooseBody = useMemo<DishChooseBody>(() => {
    if (!comboBuffetId) {
      return {
        categories: [DishCategory.ComboPaid, DishCategory.Paid, DishCategory.ComboBuffet],
        ignores: []
      };
    } else {
      return {
        categories: [DishCategory.ComboPaid, DishCategory.Paid, DishCategory.Buffet],
        ignores: [comboBuffetId],
        comboBuffetId
      };
    }
  }, [comboBuffetId]);

  const onSubmit = async ({ table: { number }, dishes }: CreateOrdersTableForm) => {
    if (createOrderMutation.isPending) return;
    try {
      const newBody: CreateOrdersTable = {
        tableNumber: number,
        dishes: dishes.map<DishToOrder>(({ id: dishId, options, quantity }) => ({ dishId, options, quantity }))
      };
      const result = await createOrderMutation.mutateAsync(newBody);
      toast({
        description: result.payload.message
      });
      router.push('/manage/orders');
    } catch (error) {
      handleErrorApi({ error, setError: form.setError });
    }
  };

  return (
    <Form {...form}>
      <form noValidate className='h-full flex flex-col justify-between p-0' onSubmit={form.handleSubmit(onSubmit, console.log)}>
        <div className='h-[calc(100%_-_3rem)] grid grid-cols-[2fr,3fr] gap-4'>
          <FormField
            control={form.control}
            name='table'
            render={({
              field: {
                value: { id, token, number },
                onChange
              }
            }) => (
              <FormItem className='h-full'>
                <ChooseTable setTable={onChange} />
                {id && <QRCodeTable token={token} tableNumber={number} size={300} />}
                <div className='h-5'>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='dishes'
            render={({ field }) => (
              <FormItem className='border-l-border border-l h-full overflow-hidden pl-2'>
                <ChooseDishTable
                  dishChooseBody={dishChooseBody}
                  submit={(dishes) => {
                    field.onChange(field.value.concat(dishes));
                  }}
                />
                {field.value.length > 0 && (
                  <ScrollArea className='w-full h-[calc(100%_-_5.75rem)]'>
                    <div className='space-y-2 pb-2 pr-2'>
                      {field.value &&
                        field.value.map(({ key, price, image, name, description, quantity, category, options }, index) => {
                          return (
                            <Badge key={key} variant='secondary' className='w-full flex items-center py-2 gap-x-4'>
                              <div className='text-sm pl-1.5'>{index + 1}</div>
                              <Separator orientation='vertical' className='h-10' />
                              <TImage src={image} alt={name} className='size-32 rounded-full mr-4' />
                              <div className='flex flex-1 items-center justify-between gap-2'>
                                <div>
                                  <h3 className='text-sm'>{name}</h3>
                                  <p className='text-muted-foreground text-xs mb-3'>{description}</p>
                                  {options && options.trim() && <p>{`${tInfo('note')}: ${options}`}</p>}
                                </div>
                                <div>
                                  <span className='text-sm'>{getPriceString({ price, category })}</span>
                                </div>
                              </div>
                              <div className='flex items-center gap-2'>
                                <div className='flex items-center gap-1 px-2 py-1 rounded-2xl border border-foreground'>
                                  <TButton
                                    size='icon'
                                    className='size-4'
                                    variant='ghost'
                                    type='button'
                                    tooltip='decrease'
                                    onClick={() => {
                                      if (quantity === 1) return;
                                      field.onChange(
                                        field.value.map((item) =>
                                          item.key === key
                                            ? {
                                                ...item,
                                                quantity: quantity - 1
                                              }
                                            : item
                                        )
                                      );
                                    }}
                                  >
                                    <Minus />
                                  </TButton>
                                  <p className='w-4 text-center'>{quantity}</p>
                                  <TButton
                                    size='icon'
                                    className='size-4'
                                    variant='ghost'
                                    type='button'
                                    tooltip='increase'
                                    onClick={() => {
                                      if (quantity === 20) return;
                                      field.onChange(
                                        field.value.map((item) =>
                                          item.key === key
                                            ? {
                                                ...item,
                                                quantity: quantity + 1
                                              }
                                            : item
                                        )
                                      );
                                    }}
                                  >
                                    <Plus />
                                  </TButton>
                                </div>
                                <Separator orientation='vertical' className='h-6' />
                                <TButton
                                  size='icon'
                                  className='size-4'
                                  variant='ghost'
                                  type='button'
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                  tooltip='delete'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    field.onChange(field.value.filter((item) => item.key !== key));
                                  }}
                                >
                                  <X />
                                </TButton>
                              </div>
                            </Badge>
                          );
                        })}
                    </div>
                  </ScrollArea>
                )}
                {field.value.length === 0 && (
                  <div className='flex items-center justify-center w-full h-[calc(100%_-_5.75rem)]'>
                    <span>Chưa chọn</span>
                  </div>
                )}
                <div className='h-12 pr-2 flex flex-col'>
                  <Separator />
                  <div className='flex items-center justify-between flex-1'>
                    <span className='text-sm font-semibold'>{tInfo('number-of-dishes', { number: getTotalQuantity(field.value) })}</span>
                    <span className='pr-20 text-sm font-semibold text-red-500'>{tInfo('total-price', { amount: getTotalPrice(field.value) })}</span>
                  </div>
                </div>
              </FormItem>
            )}
          />
        </div>
        <FormItem className='flex flex-row items-center justify-center gap-x-4 h-12 w-full border-t'>
          <TButton type='button' variant='outline' asLink href={'/manage/tables'}>
            {tButton('cancel')}
          </TButton>
          <TButton type='submit' disabled={!table.id || dishes.length === 0 || createOrderMutation.isPending}>
            {tButton('save-change')}
          </TButton>
        </FormItem>
      </form>
    </Form>
  );
}
