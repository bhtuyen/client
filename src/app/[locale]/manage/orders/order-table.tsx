'use client';
import AddOrder from '@/app/[locale]/manage/orders/add-order';
import orderTableColumns from '@/app/[locale]/manage/orders/order-table-columns';
import { OrderStatus } from '@/constants/enum';
import { handleErrorApi } from '@/lib/utils';
import { GetOrdersResType, PayGuestOrdersResType, UpdateOrderResType } from '@/schemaValidations/order.schema';
import { createContext, useEffect, useState } from 'react';

import { useOrderListQuery, useUpdateOrderMutation } from '@/app/queries/useOrder';
import { useAppStore } from '@/components/app-provider';
import TButton from '@/components/t-button';
import TDataTable from '@/components/t-data-table';
import { TDateRange } from '@/components/t-date-range';
import { toast } from '@/hooks/use-toast';
import { GuestCreateOrdersResType } from '@/schemaValidations/guest.schema';
import { endOfDay, startOfDay } from 'date-fns';
import { useTranslations } from 'next-intl';
import { DateRange } from 'react-day-picker';

export const OrderTableContext = createContext({
  setOrderIdEdit: (_value: string | undefined) => {},
  orderIdEdit: undefined as string | undefined,
  changeStatus: (_payload: { orderId: string; dishId: string; status: OrderStatus; quantity: number }) => {},
  orderObjectByGuestId: {} as OrderObjectByGuestID
});

export type StatusCountObject = Record<keyof typeof OrderStatus, number>;
export type Statics = {
  status: StatusCountObject;
  table: Record<string, Record<string, StatusCountObject>>;
};
export type OrderObjectByGuestID = Record<string, GetOrdersResType['data']>;
export type ServingGuestByTableNumber = Record<string, OrderObjectByGuestID>;

const initFromDate = startOfDay(new Date());
const initToDate = endOfDay(new Date());
export default function OrderTable() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: initFromDate,
    to: initToDate
  });

  const orderListQuery = useOrderListQuery({
    fromDate: dateRange.from,
    toDate: dateRange.to
  });
  const refreshOrderListQuery = orderListQuery.refetch;
  const orderList = orderListQuery.data?.payload.data ?? [];
  // const dataListQuery = useTableListQuery();
  // const tableList = dataListQuery.data?.payload.data ?? [];
  // const tableListSortedByNumber = tableList.sort();

  // const { statics, orderObjectByGuestId, servingGuestByTableNumber } = useOrderService(orderList);

  const tOrderStatus = useTranslations('order-status');
  const tButton = useTranslations('t-button');

  const updateOrderMutation = useUpdateOrderMutation();

  const { socket } = useAppStore();

  useEffect(() => {
    function refetch() {
      const now = new Date();
      if (now >= dateRange?.from! && now <= dateRange?.to!) {
        refreshOrderListQuery();
      }
    }

    function onUpadteOrder(data: UpdateOrderResType['data']) {
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

    function onNewOrder(data: GuestCreateOrdersResType['data']) {
      const { guest } = data[0];

      toast({
        description: `Khách hàng ${guest?.name} tại bàn ${guest?.tableNumber} vừa đặt ${data.length} đơn`
      });
      refetch();
    }

    function onPayment(data: PayGuestOrdersResType['data']) {
      const { guest } = data[0];
      toast({
        description: `Khách hàng ${guest?.name} tại bàn ${guest?.tableNumber} đã thanh toán thành công ${data.length} đơn`
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
  }, [dateRange.from, dateRange.to, refreshOrderListQuery, socket, tOrderStatus]);

  // Function
  function resetDateFilter() {
    setDateRange({
      from: initFromDate,
      to: initToDate
    });
  }

  async function changeStatus(body: { orderId: string; dishId: string; status: OrderStatus; quantity: number }) {
    try {
      await updateOrderMutation.mutateAsync(body);
    } catch (error) {
      handleErrorApi({ error });
    }
  }

  return (
    <>
      <div className='flex gap-2 p-2 pb-0'>
        <TDateRange dateRange={dateRange} setDateRange={setDateRange} />
        <TButton size='sm' variant={'outline'} onClick={resetDateFilter}>
          {tButton('reset')}
        </TButton>
      </div>

      <TDataTable columns={orderTableColumns} data={orderList} childrenToolbar={<AddOrder />} />
    </>
  );
}
