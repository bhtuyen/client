'use client';
import AddOrder from '@/app/[locale]/manage/orders/add-order';
import orderTableColumns from '@/app/[locale]/manage/orders/order-table-columns';
import type { OrderStatus } from '@/constants/enum';
import { handleErrorApi, periodDefault } from '@/lib/utils';
import { createContext, useEffect, useState } from 'react';

import { useOrderService } from '@/app/[locale]/manage/orders/order.service';
import { useOrderListQuery, useUpdateOrderMutation } from '@/app/queries/useOrder';
import { useTableListQuery } from '@/app/queries/useTable';
import { useAppStore } from '@/components/app-provider';
import TButton from '@/components/t-button';
import TDataTable from '@/components/t-data-table';
import { TDateRange } from '@/components/t-date-range';
import { toast } from '@/hooks/use-toast';
import { Period } from '@/schemaValidations/common.schema';
import { OrderDtoDetail, UpdateOrder } from '@/schemaValidations/order.schema';
import { useTranslations } from 'next-intl';

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
export type OrderObjectByGuestID = Record<string, OrderDtoDetail[]>;
export type ServingGuestByTableNumber = Record<string, OrderObjectByGuestID>;

export default function OrderTable() {
  const [dateRange, setDateRange] = useState<Period>(periodDefault);

  const orderListQuery = useOrderListQuery(dateRange);
  const refreshOrderListQuery = orderListQuery.refetch;
  const orderList = orderListQuery.data?.payload.data ?? [];
  const dataListQuery = useTableListQuery();
  const tableList = dataListQuery.data?.payload.data ?? [];

  const tableListSortedByNumber = tableList.sort();

  const { statics, orderObjectByGuestId, servingGuestByTableNumber } = useOrderService(orderList);

  const tOrderStatus = useTranslations('order-status');
  const tButton = useTranslations('t-button');

  const updateOrderMutation = useUpdateOrderMutation();

  const { socket } = useAppStore();

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

  async function changeStatus(body: UpdateOrder) {
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
