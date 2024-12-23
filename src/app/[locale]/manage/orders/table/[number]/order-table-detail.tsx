'use client';

import { PlusCircle, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo } from 'react';

import type { OrderDtoDetail } from '@/schemaValidations/order.schema';
import type { ColumnDef } from '@tanstack/react-table';

import { useUpdateOrderMutation } from '@/app/queries/useOrder';
import { useGetTableDetailNowQuery } from '@/app/queries/useTable';
import { useAppStore } from '@/components/app-provider';
import QRCodeTable from '@/components/qrcode-table';
import TButton from '@/components/t-button';
import TDataTable, { TCellActions } from '@/components/t-data-table';
import TImage from '@/components/t-image';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrderStatus } from '@/constants/enum';
import { toast } from '@/hooks/use-toast';
import { formatDateTimeToLocaleString, getDishOptions, getEnumValues, getPrice, handleErrorApi, removeAccents } from '@/lib/utils';

export default function OrderTableDetail({ number }: { number: string }) {
  const tOrderStatus = useTranslations('order-status');
  const tButton = useTranslations('t-button');
  const tTableColumn = useTranslations('t-data-table.column');

  const updateOrderMutation = useUpdateOrderMutation();
  const getTableDetailNowQuery = useGetTableDetailNowQuery(number);
  const tableDetailNow = getTableDetailNowQuery.data?.payload.data;
  const { refetch } = getTableDetailNowQuery;

  const orders = tableDetailNow?.orders ?? [];

  const columns = useMemo<ColumnDef<OrderDtoDetail>[]>(
    () => [
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
                  quantity: original.quantity,
                  options: original.options,
                  orderHandlerId: original.orderHandlerId
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

  const { socket, showAlertDialog } = useAppStore();

  useEffect(() => {
    function onUpadteOrder(data: OrderDtoDetail) {
      refetch();
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
  }, [refetch, socket, tOrderStatus]);

  const handlePayment = () => {
    showAlertDialog({
      title: 'payment',
      description: 'payment',
      onAction: () => {
        console.log('Thanh toán');
      }
    });
  };

  return (
    <>
      <div className='flex items-center gap-4 h-full'>
        {tableDetailNow && (
          <div className='flex flex-col h-full items-center gap-2 my-4 flex-1 border-r border-r-red-700'>
            <QRCodeTable token={tableDetailNow.token} tableNumber={number} className='mx-0' size={300} isFillText={false} />
            <div className='flex items-center gap-2'>
              <span className='text-sm font-semibold'>Sức chứa: {tableDetailNow?.capacity}</span> <Users size={18} />
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-semibold'>Số lượng khách đang tại bàn: {tableDetailNow.guests.length}</span> <Users size={18} />
            </div>
            <TButton onClick={handlePayment}>Thanh toán</TButton>
          </div>
        )}
        <TDataTable
          columns={columns}
          data={orders}
          childrenToolbar={
            <TButton size='sm' className='h-7 gap-1' asLink href='/manage/orders/create'>
              <PlusCircle className='h-3.5 w-3.5' />
              <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>{tButton('create-order')}</span>
            </TButton>
          }
          className='pr-2 flex-[3]'
          filter={{
            columnId: 'tableNumber',
            placeholder: {
              key: 'input-placeholder-default'
            }
          }}
        />
      </div>
    </>
  );
}
