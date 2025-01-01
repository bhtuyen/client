'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import type { DishChooseBody } from '@/schemaValidations/dish.schema';
import type { OrderDtoDetail } from '@/schemaValidations/order.schema';

import ChooseDishTable from '@/app/[locale]/manage/dishes/choose-dish-table';
import { useOrderDetailQuery, useUpdateOrderMutation } from '@/app/queries/useOrder';
import TButton from '@/components/t-button';
import TImage from '@/components/t-image';
import TQuantity from '@/components/t-quantity';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SheetClose } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { DishCategory, OrderStatus } from '@/constants/enum';
import { buildKey, getEnumValues, getOptions, getPrice, handleErrorApi } from '@/lib/utils';
import { orderDtoDetail } from '@/schemaValidations/order.schema';

export default function EditOrderForm({ orderId }: { orderId: string }) {
  const { data } = useOrderDetailQuery(orderId);
  const { mutateAsync, isPending } = useUpdateOrderMutation();
  const [options, setOptions] = useState<{
    optionsCheckbox: { value: string; enabled: boolean; key: string }[];
    newOptions: string;
  }>({
    optionsCheckbox: [],
    newOptions: ''
  });

  const order = data.payload.data;

  const form = useForm<Omit<OrderDtoDetail, 'createdAt' | 'updatedAt'>>({
    resolver: zodResolver(orderDtoDetail.omit({ createdAt: true, updatedAt: true })),
    values: order
  });

  const formOptions = form.watch('options');

  useEffect(() => {
    setOptions({
      optionsCheckbox: getOptions(formOptions).map((option) => ({ value: option, enabled: true, key: buildKey(option) })),
      newOptions: ''
    });
  }, [formOptions]);

  const dishChooseBody = useMemo<DishChooseBody>(
    () => ({
      categories: [DishCategory.Paid, DishCategory.ComboPaid, DishCategory.ComboBuffet],
      ignores: []
    }),
    []
  );

  const tOrderStatus = useTranslations('order-status');
  const tForm = useTranslations('t-form');
  const tButton = useTranslations('t-button');

  const onSubmit = async (data: Omit<OrderDtoDetail, 'createdAt' | 'updatedAt'>) => {
    if (isPending) return;
    try {
      const newOptions = options.optionsCheckbox.filter(({ enabled }) => enabled).map(({ value }) => value);
      if (options.newOptions) {
        newOptions.push(options.newOptions);
      }

      data.options = newOptions.join(', ');
      await mutateAsync({
        dishId: data.dishSnapshot.dishId,
        options: data.options,
        quantity: data.quantity,
        status: data.status,
        id: data.id
      });
    } catch (error) {
      handleErrorApi({ error, setError: form.setError });
    }
  };

  return (
    <Form {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit, console.log)} className='space-y-4 h-[calc(100%_-_2.25rem)]'>
        <FormField
          control={form.control}
          name='dishSnapshot'
          render={({ field }) => (
            <FormItem>
              <TImage src={field.value.image} alt={field.value.name} width={100} height={100} className='w-full object-center rounded-md' />
              <FormLabel className=''>
                <p className='text-xl font-bold'>{field.value.name}</p>
                <p className='text-sm text-muted-foreground'>{field.value.description}</p>
                <p className='text-sm font-semibold'>{getPrice(field.value)}</p>
              </FormLabel>
              <ChooseDishTable
                dishChooseBody={dishChooseBody}
                onlyOneSelected
                side='left'
                triggerKey='change-dish'
                submit={(dishes) => {
                  const dish = dishes[0];
                  field.onChange({
                    ...field.value,
                    ...dish,
                    dishId: dish.id
                  });
                  form.setValue('options', dish.options);
                  form.setValue('quantity', dish.quantity);
                }}
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='options'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='flex items-center gap-x-1 text-base'>{tForm('order-options')}</FormLabel>
              {options.optionsCheckbox.map(({ value, enabled, key }) => (
                <div key={key} className='flex items-center gap-x-1'>
                  <Checkbox
                    id={key}
                    checked={enabled}
                    onCheckedChange={(value) => {
                      setOptions((prev) => ({
                        ...prev,
                        optionsCheckbox: prev.optionsCheckbox.map((option) => (option.key === key ? { ...option, enabled: !!value } : option))
                      }));
                    }}
                  />
                  <Label className='text-sm capitalize' htmlFor={key}>
                    {value}
                  </Label>
                </div>
              ))}
              <Textarea
                value={options.newOptions}
                onChange={(e) => {
                  setOptions((prev) => ({ ...prev, newOptions: e.target.value }));
                }}
                placeholder={tForm('add-option')}
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='status'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='flex items-center gap-x-1'>{tForm('order-status')}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={''} />
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
              <div className='h-5'>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='quantity'
          render={({ field }) => (
            <FormItem className='flex flex-col items-center w-full gap-x-6'>
              <TQuantity value={field.value} onChange={field.onChange} classIcon='size-9' classInput='h-9 text-base ' />
            </FormItem>
          )}
        />
        <FormItem className='flex flex-row items-center justify-center gap-x-4'>
          <SheetClose asChild>
            <TButton type='button' variant={'outline'}>
              {tButton('cancel')}
            </TButton>
          </SheetClose>
          <TButton type='submit'>{tButton('confirm')}</TButton>
        </FormItem>
      </form>
    </Form>
  );
}
