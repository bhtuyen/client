/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
'use client';
import { PlusCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { createContext, useMemo } from 'react';

import type { OrderDtoDetail } from '@/schemaValidations/order.schema';
import type { ColumnDef } from '@tanstack/react-table';

import { useUpdateOrderMutation } from '@/app/queries/useOrder';
import TButton from '@/components/t-button';
import TDataTable, { TCellActions } from '@/components/t-data-table';
import TImage from '@/components/t-image';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrderStatus } from '@/constants/enum';
import { formatDateTimeToLocaleString, getDishOptions, getEnumValues, getPrice, handleErrorApi, removeAccents } from '@/lib/utils';

export const OrderTableContext = createContext({
  setOrderIdEdit: (_value: string | undefined) => {},
  orderIdEdit: undefined as string | undefined,
  changeStatus: (_payload: { orderId: string; dishId: string; status: OrderStatus; quantity: number }) => {},
  orderObjectByGuestId: {} as OrderObjectByGuestID
});

export type StatusCountObject = Record<OrderStatus, number>;
export type Statics = {
  status: StatusCountObject;
  table: Record<string, Record<string, StatusCountObject>>;
};
export type OrderObjectByGuestID = Record<string, OrderDtoDetail[]>;
export type ServingGuestByTableNumber = Record<string, OrderObjectByGuestID>;

export default function OrderTable({ orders }: { orders: OrderDtoDetail[] }) {
  const tOrderStatus = useTranslations('order-status');
  const tButton = useTranslations('t-button');
  const tTableColumn = useTranslations('t-data-table.column');
  const updateOrderMutation = useUpdateOrderMutation();

  const columns = useMemo<ColumnDef<OrderDtoDetail>[]>(
    () => [
      {
        accessorKey: 'tableNumber',
        header: () => <div className='capitalize text-center'>{tTableColumn('table-number')}</div>,
        cell: ({ row }) => <div className='capitalize text-center'>{row.original.tableNumber}</div>
      },
      {
        id: 'dish-name',
        header: 'Món ăn',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <TImage
              src={row.original.dishSnapshot.image}
              alt={row.original.dishSnapshot.name}
              width={50}
              height={50}
              className='rounded-md object-cover w-[50px] h-[50px]'
            />
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <span>{row.original.dishSnapshot.name}</span>
                <Badge className='px-1' variant={'secondary'}>
                  x{row.original.quantity}
                </Badge>
              </div>
              <span className='italic'>{getPrice(row.original.dishSnapshot)}</span>
            </div>
          </div>
        )
      },
      {
        accessorKey: 'options',
        header: () => <div className='text-left w-[150px]'>{tTableColumn('options')}</div>,
        cell: ({ row }) => (
          <ul className='text-left w-[150px] space-y-1'>
            {getDishOptions(row.original.options).map((option) => (
              <li key={removeAccents(option)} className='capitalize'>
                ➡️ {option}
              </li>
            ))}
          </ul>
        )
      },
      {
        accessorKey: 'status',
        header: () => <div className='capitalize text-center'>{tTableColumn('status')}</div>,
        cell: ({ row: { original } }) => (
          <Select
            onValueChange={async (status: OrderStatus) => {
              try {
                await updateOrderMutation.mutateAsync({
                  id: original.id,
                  dishId: original.dishSnapshot.dishId,
                  status,
                  quantity: original.quantity
                });
              } catch (error) {
                handleErrorApi({ error });
              }
            }}
            value={original.status}
          >
            <SelectTrigger>
              <SelectValue placeholder='Theme' />
            </SelectTrigger>
            <SelectContent>
              {getEnumValues(OrderStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {tOrderStatus(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      },
      {
        id: 'order-handler',
        header: () => <div className='capitalize text-center'>{tTableColumn('order-handler')}</div>,
        cell: ({ row }) => <div>{row.original.orderHandler?.name ?? ''}</div>
      },
      {
        id: 'create-update',
        header: () => <div>{tTableColumn('create-update')}</div>,
        cell: ({ row }) => (
          <div className='space-y-2 text-sm'>
            <div className='flex items-center space-x-4'>{formatDateTimeToLocaleString(row.original.createdAt)}</div>
            <div className='flex items-center space-x-4'>{formatDateTimeToLocaleString(row.original.updatedAt)}</div>
          </div>
        )
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => (
          <TCellActions
            editOption={{
              urlEdit: `/manage/orders/${row.original.id}/edit`
            }}
          />
        )
      }
    ],
    [tOrderStatus, tTableColumn, updateOrderMutation]
  );

  return (
    <>
      <TDataTable
        columns={columns}
        data={orders}
        childrenToolbar={
          <TButton size='sm' className='h-7 gap-1' asLink href='/manage/orders/create'>
            <PlusCircle className='h-3.5 w-3.5' />
            <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>{tButton('create-order')}</span>
          </TButton>
        }
        filter={{
          columnId: 'tableNumber',
          placeholder: {
            key: 'input-placeholder-default'
          }
        }}
      />
    </>
  );
}
