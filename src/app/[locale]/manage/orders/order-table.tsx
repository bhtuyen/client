/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
'use client';
import { PencilIcon, PlusCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import type { OrderDtoDetail } from '@/schemaValidations/order.schema';
import type { ColumnDef } from '@tanstack/react-table';

import EditOrderForm from '@/app/[locale]/manage/orders/edit-order-form';
import { useUpdateOrderMutation } from '@/app/queries/useOrder';
import TButton from '@/components/t-button';
import TDataTable, { TCellActions } from '@/components/t-data-table';
import TImage from '@/components/t-image';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { OrderStatus } from '@/constants/enum';
import { formatDateTimeToLocaleString, getOptions, getEnumValues, getPrice, handleErrorApi, removeAccents } from '@/lib/utils';

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
            {getOptions(row.original.options).map((option) => (
              <li key={removeAccents(option)} className='capitalize'>
                ✅ {option}
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
                  quantity: original.quantity,
                  options: original.options
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
              {getEnumValues(OrderStatus)
                .filter((status) => status != OrderStatus.Paid)
                .map((status) => (
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
        cell: ({ row, table }) => (
          <TCellActions
            editOption={{
              render: (
                <Sheet>
                  <SheetTrigger asChild>
                    <TButton size='icon' tooltip='edit' variant='outline'>
                      <PencilIcon height={16} width={16} />
                    </TButton>
                  </SheetTrigger>
                  <SheetContent side='left' className='w-[500px]'>
                    <SheetHeader>
                      <SheetTitle>Edit order</SheetTitle>
                      <SheetDescription></SheetDescription>
                    </SheetHeader>
                    <EditOrderForm orderId={row.original.id} />
                  </SheetContent>
                </Sheet>
              )
            }}
          />
        )
      }
    ],
    [tOrderStatus, tTableColumn, updateOrderMutation]
  );

  return (
    <TDataTable
      columns={columns}
      data={orders}
      childrenToolbar={
        <TButton size='sm' className='h-7 gap-1' asLink href='/manage/orders/create'>
          <PlusCircle className='h-3.5 w-3.5' />
          <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>{tButton('create-order')}</span>
        </TButton>
      }
      className='!h-[calc(100%_-_2.25rem)]'
      filter={{
        columnId: 'tableNumber',
        placeholder: {
          key: 'input-placeholder-default'
        }
      }}
    />
  );
}
