'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Minus, Plus, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import type { DishChooseBody } from '@/schemaValidations/dish.schema';
import type { DishToOrder, CreateOrdersTable, CreateOrdersTableForm } from '@/schemaValidations/order.schema';
import type { TableDto } from '@/schemaValidations/table.schema';

import ChooseDishTable from '@/app/[locale]/manage/dishes/choose-dish-table';
import { ChooseTable } from '@/app/[locale]/manage/orders/choose-table';
import { useDishListQuery } from '@/app/queries/useDish';
import { useCreateOrderMutation } from '@/app/queries/useOrder';
import QRCodeTable from '@/components/qrcode-table';
import TButton from '@/components/t-button';
import TImage from '@/components/t-image';
import { Badge } from '@/components/ui/badge';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DishCategory } from '@/constants/enum';
import { toast } from '@/hooks/use-toast';
import { getTableLink, handleErrorApi } from '@/lib/utils';
import { createOrdersTableForm } from '@/schemaValidations/order.schema';

export default function CreateOrdersForm() {
  const [createOrders, setCreateOrders] = useState<DishToOrder[]>([]);
  const [table, setTable] = useState<TableDto | null>(null);
  const locale = useLocale();
  const { data } = useDishListQuery();
  const dishes = useMemo(() => data?.payload.data ?? [], [data?.payload.data]);

  const createOrderMutation = useCreateOrderMutation();

  const form = useForm<CreateOrdersTableForm>({
    resolver: zodResolver(createOrdersTableForm),
    defaultValues: {
      tableNumber: '',
      dishes: []
    }
  });

  const tButton = useTranslations('t-button');
  const tForm = useTranslations('t-form');

  const dishChooseBody = useMemo<DishChooseBody>(
    () => ({
      categories: [DishCategory.Buffet, DishCategory.ComboPaid, DishCategory.Paid, DishCategory.ComboBuffet],
      ignores: []
    }),
    []
  );

  // const handleQuantityChange = ({ dishId, quantity, options }: CreateOrder) => {
  //   setCreateOrders((prevOrders) => {
  //     if (quantity === 0) {
  //       return prevOrders.filter((order) => order.dishId !== dishId);
  //     }
  //     const index = prevOrders.findIndex((order) => order.dishId === dishId);
  //     if (index === -1) {
  //       return [...prevOrders, { dishId, options, quantity }];
  //     }
  //     const newOrders = [...prevOrders];
  //     newOrders[index] = { ...newOrders[index], quantity };
  //     return prevOrders;
  //   });
  // };

  // const totalPrice = useMemo(() => {
  //   return dishes.reduce((result, dish) => {
  //     const order = createOrders.find((order) => order.dishId === dish.id);
  //     if (!order) return result;
  //     if (dish.category === DishCategory.Paid) {
  //       return result + dish.price * order.quantity;
  //     }
  //     return result;
  //   }, 0);
  // }, [dishes, createOrders]);

  const onSubmit = async ({ tableNumber, dishes }: CreateOrdersTableForm) => {
    if (createOrderMutation.isPending) return;
    try {
      const newBody: CreateOrdersTable = {
        tableNumber,
        dishes: dishes.map<DishToOrder>(({ id: dishId, options, quantity }) => ({ dishId, options, quantity }))
      };
      const result = await createOrderMutation.mutateAsync(newBody);
      toast({
        description: result.payload.message
      });
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
            name='tableNumber'
            render={({ field }) => (
              <FormItem className='h-full'>
                <p>{tForm('table-number')}</p>
                <ChooseTable setTable={setTable} />
                {table && (
                  <Link
                    href={getTableLink({
                      token: table.token,
                      tableNumber: table.number,
                      locale
                    })}
                    target='_blank'
                    className='break-all'
                  >
                    {getTableLink({
                      token: table.token,
                      tableNumber: table.number,
                      locale
                    })}
                  </Link>
                )}
                {table && <QRCodeTable token={table.token} tableNumber={table.number} size={300} />}
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
              <FormItem className='border-l-border border-l h-full pl-2'>
                <ChooseDishTable
                  dishChooseBody={dishChooseBody}
                  getDishSelected={(dishes) => {
                    field.onChange(field.value.concat(dishes));
                  }}
                />
                <ScrollArea className='w-full h-[calc(100%_-_3rem)]'>
                  <div className='space-y-2'>
                    {field.value &&
                      field.value.map(({ key, price, image, name, description, quantity }) => {
                        return (
                          <Badge key={key} variant='secondary' className='w-full flex items-center'>
                            <TImage src={image} alt={name} className='size-20 rounded-full mr-4' />
                            <div>
                              <h3 className='text-sm'>{name}</h3>
                              <p className='text-muted-foreground text-xs'>{description}</p>
                            </div>
                            <div className='flex items-center ml-auto gap-2'>
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

                    {field.value.length === 0 && <span>Chưa chọn</span>}
                  </div>
                </ScrollArea>
              </FormItem>
            )}
          />
        </div>
        <FormItem className='flex flex-row items-center justify-center gap-x-4 h-12 w-full border-t'>
          <TButton type='button' variant='outline' asLink href={'/manage/tables'}>
            {tButton('cancel')}
          </TButton>
          <TButton type='submit' disabled={!form.formState.isDirty}>
            {tButton('save-change')}
          </TButton>
        </FormItem>
      </form>
    </Form>
  );
}
