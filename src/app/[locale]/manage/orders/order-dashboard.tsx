'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import type { Period } from '@/schemaValidations/common.schema';
import type { OrderDtoDetail } from '@/schemaValidations/order.schema';

import OrderTable from '@/app/[locale]/manage/orders/order-table';
import { useOrderService } from '@/app/[locale]/manage/orders/order.service';
import { useOrderByPeriodQuery } from '@/app/queries/useOrder';
import { useTableListQuery } from '@/app/queries/useTable';
import { useAppStore } from '@/components/app-provider';
import TButton from '@/components/t-button';
import { TDateRange } from '@/components/t-date-range';
import { toast } from '@/hooks/use-toast';
import { periodDefault } from '@/lib/utils';

export default function OrderDashboard() {
  const { socket } = useAppStore();
  const [dateRange, setDateRange] = useState<Period>(periodDefault);

  const { refetch, data } = useOrderByPeriodQuery(dateRange);
  const dataListQuery = useTableListQuery();

  const orders = useMemo(() => data?.payload.data ?? [], [data?.payload.data]);

  const tables = useMemo(() => dataListQuery.data?.payload.data ?? [], [dataListQuery.data?.payload.data]);

  const { statics, orderObjectByGuestId, servingGuestByTableNumber } = useOrderService(orders);

  const tButton = useTranslations('t-button');
  const tOrderStatus = useTranslations('order-status');

  useEffect(() => {
    function refetch() {
      const now = new Date();
      if (now >= dateRange.fromDate && now <= dateRange.toDate) {
        refetch();
      }
    }

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
  }, [refetch, socket, tOrderStatus, dateRange]);

  return (
    <>
      <div className='flex gap-2 pb-0'>
        <TDateRange dateRange={dateRange} setDateRange={setDateRange} />
        <TButton size='sm' variant={'outline'} onClick={() => setDateRange(periodDefault)}>
          {tButton('reset')}
        </TButton>
      </div>
      <OrderTable orders={orders} />
    </>
  );
}
