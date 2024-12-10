'use client';
import AddOrder from '@/app/[locale]/manage/orders/create/create-order-form';
import { useOrderService } from '@/app/[locale]/manage/orders/order.service';
import { useOrderListQuery, useUpdateOrderMutation } from '@/app/queries/useOrder';
import { useTableListQuery } from '@/app/queries/useTable';
import { useAppStore } from '@/components/app-provider';
import TButton from '@/components/t-button';
import TDataTable, { TCellActions } from '@/components/t-data-table';
import { TDateRange } from '@/components/t-date-range';
import TImage from '@/components/t-image';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrderStatus } from '@/constants/enum';
import { toast } from '@/hooks/use-toast';
import { formatDateTimeToLocaleString, getEnumValues, getPrice, handleErrorApi, periodDefault } from '@/lib/utils';
import { Period } from '@/schemaValidations/common.schema';
import { OrderDtoDetail } from '@/schemaValidations/order.schema';
import type { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { createContext, useEffect, useMemo, useState } from 'react';
import { PlusCircle } from 'lucide-react';


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

export default function OrderTable() {
  const { socket } = useAppStore();

  const [dateRange, setDateRange] = useState<Period>(periodDefault);

  const orderListQuery = useOrderListQuery(dateRange);
  const refreshOrderListQuery = orderListQuery.refetch;
  const orderList = orderListQuery.data?.payload.data ?? [];
  const dataListQuery = useTableListQuery();
  const tableList = dataListQuery.data?.payload.data ?? [];

  const { statics, orderObjectByGuestId, servingGuestByTableNumber } = useOrderService(orderList);

  const tOrderStatus = useTranslations('order-status');
  const tButton = useTranslations('t-button');
  const tTableColumn = useTranslations('t-data-table.column');

  const updateOrderMutation = useUpdateOrderMutation();

  useEffect(() => {
    function refetch() {
      const now = new Date();
      if (now >= dateRange.fromDate && now <= dateRange.toDate) {
        refreshOrderListQuery();
      }
    }

    function onUpadteOrder(data: OrderDtoDetail) {
      refreshOrderListQuery();
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
  }, [refreshOrderListQuery, socket, tOrderStatus, dateRange]);

  // Function
  function resetDateFilter() {
    setDateRange(periodDefault);
  }

  const orderTableColumns = useMemo<ColumnDef<OrderDtoDetail>[]>(
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
            <TImage src={row.original.dishSnapshot.image} alt={row.original.dishSnapshot.name} width={50} height={50} className='rounded-md object-cover w-[50px] h-[50px]' />
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
      <div className='flex gap-2 p-2 pb-0'>
        <TDateRange dateRange={dateRange} setDateRange={setDateRange} />
        <TButton size='sm' variant={'outline'} onClick={resetDateFilter}>
          {tButton('reset')}
        </TButton>
      </div>

      <TDataTable
        columns={orderTableColumns}
        data={orderList}
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
