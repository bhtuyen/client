/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
'use client';
import { PencilIcon, PlusCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import type { Period } from '@/schemaValidations/common.schema';
import type { OrderDtoDetail } from '@/schemaValidations/order.schema';
import type { ColumnDef } from '@tanstack/react-table';

import EditOrderForm from '@/app/[locale]/manage/orders/edit-order-form';
import { useOrderByPeriodQuery, useUpdateOrderMutation } from '@/app/queries/useOrder';
import { useAppStore } from '@/components/app-provider';
import TButton from '@/components/t-button';
import TDataTable, { TCellActions } from '@/components/t-data-table';
import { TDateRange } from '@/components/t-date-range';
import TImage from '@/components/t-image';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { OrderStatus } from '@/constants/enum';
import { toast } from '@/hooks/use-toast';
import { formatDateTimeToLocaleString, getOptions, getEnumValues, getPriceString, handleErrorApi, removeAccents, periodDefault } from '@/lib/utils';

export default function OrderTable() {
  const tOrderStatus = useTranslations('order-status');
  const tButton = useTranslations('t-button');
  const tTableColumn = useTranslations('t-data-table.column');
  const tFilter = useTranslations('t-data-table.filter');
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
        header: () => <div className='text-left'>{tTableColumn('dish')}</div>,
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
              <span className='italic'>{getPriceString(row.original.dishSnapshot)}</span>
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
        id: 'status',
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
        cell: ({ row }) => <div className='capitalize text-center'>{row.original.orderHandler?.name ?? ''}</div>
      },
      {
        id: 'create-update',
        header: () => <div className='text-center'>{tTableColumn('create-update')}</div>,
        cell: ({ row }) => (
          <div className='space-y-2 text-sm'>
            <div className='flex items-center justify-center space-x-4'>{formatDateTimeToLocaleString(row.original.createdAt)}</div>
            <div className='flex items-center justify-center space-x-4'>{formatDateTimeToLocaleString(row.original.updatedAt)}</div>
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

  const { socket } = useAppStore();
  const [dateRange, setDateRange] = useState<Period>(periodDefault);

  const { refetch, data } = useOrderByPeriodQuery(dateRange);

  const orders = useMemo(() => data?.payload.data ?? [], [data?.payload.data]);

  useEffect(() => {
    function refetchOrders() {
      const now = new Date();
      if (now >= dateRange.fromDate && now <= dateRange.toDate) {
        refetch();
      }
    }

    function onUpadteOrder(data: OrderDtoDetail) {
      refetchOrders();
      const {
        dishSnapshot: { name },
        quantity,
        status
      } = data;

      toast({
        description: `Món ${name} (SL: ${quantity}) đã được cập nhật sang trạng thái ${tOrderStatus(status)}`
      });
    }

    function onNewOrder(data: OrderDtoDetail[]) {
      const { guest } = data[0];

      toast({
        description: `Khách hàng tại bàn ${guest?.tableNumber} vừa đặt ${data.length} đơn`
      });
      refetch();
    }
    function onPayment(data: OrderDtoDetail[]) {
      const { guest } = data[0];
      toast({
        description: `Khách hàng tại bàn ${guest?.tableNumber} đã thanh toán thành công ${data.length} đơn`
      });
      refetch();
    }

    socket?.on('update-order', onUpadteOrder);
    socket?.on('new-order', onNewOrder);
    socket?.on('payment', onPayment);

    return () => {
      socket?.off('update-order', onUpadteOrder);
      socket?.off('new-order', onNewOrder);
      socket?.off('payment', onPayment);
    };
  }, [refetch, socket, tOrderStatus, dateRange]);

  return (
    <TDataTable
      columns={columns}
      data={orders}
      childrenToolbar={
        <TButton className='gap-1' asLink href='/manage/orders/create'>
          <PlusCircle className='h-3.5 w-3.5' />
          <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>{tButton('create-order')}</span>
        </TButton>
      }
      className='flex-[7] h-full max-[1366px]:h-[calc(100%_-_9.5rem)] max-[1366px]:flex-none'
      filter={{
        columnId: 'tableNumber',
        placeholder: {
          key: 'input-placeholder-table'
        }
      }}
      filterCustom={(table) => {
        return (
          <div className='flex items-center gap-2'>
            <Select
              onValueChange={(value) => {
                const statusCol = table.getColumn('status');
                if (statusCol) {
                  statusCol.setFilterValue(value);
                }
              }}
              value={(table.getColumn('status')?.getFilterValue() as string) ?? ''}
            >
              <SelectTrigger className='min-w-60'>
                <SelectValue placeholder={tFilter('select-placeholder-status')} />
              </SelectTrigger>
              <SelectContent>
                {getEnumValues(OrderStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {tOrderStatus(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <TDateRange dateRange={dateRange} setDateRange={setDateRange} />
            <TButton variant={'outline'} onClick={() => setDateRange(periodDefault)}>
              {tButton('reset')}
            </TButton>
          </div>
        );
      }}
    />
  );
}
