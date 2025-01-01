'use client';
import { useTranslations } from 'next-intl';
import { Suspense, useEffect, useMemo, useState } from 'react';

import type { Period } from '@/schemaValidations/common.schema';
import type { OrderDtoDetail } from '@/schemaValidations/order.schema';

import OrderStatics from '@/app/[locale]/manage/orders/order-statics';
import OrderTable from '@/app/[locale]/manage/orders/order-table';
import { useOrderByPeriodQuery } from '@/app/queries/useOrder';
import { useAppStore } from '@/components/app-provider';
import TButton from '@/components/t-button';
import { TDateRange } from '@/components/t-date-range';
import { OrderStaticsSkeleton } from '@/components/t-skeleton';
import { toast } from '@/hooks/use-toast';
import { periodDefault } from '@/lib/utils';

export default function OrderDashboard() {
  const { socket } = useAppStore();
  const [dateRange, setDateRange] = useState<Period>(periodDefault);

  const { refetch, data } = useOrderByPeriodQuery(dateRange);

  const orders = useMemo(() => data?.payload.data ?? [], [data?.payload.data]);

  const tButton = useTranslations('t-button');
  const tOrderStatus = useTranslations('order-status');

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
    <div className='flex gap-2 h-full'>
      <div className='flex-[7] space-y-2 h-full'>
        <div className='flex gap-2 pb-0'>
          <TDateRange dateRange={dateRange} setDateRange={setDateRange} />
          <TButton size='sm' variant={'outline'} onClick={() => setDateRange(periodDefault)}>
            {tButton('reset')}
          </TButton>
        </div>
        <OrderTable orders={orders} />
      </div>
      <div className='flex-[2] border-l pl-2 h-full'>
        <Suspense fallback={<OrderStaticsSkeleton />}>
          <OrderStatics />
        </Suspense>
      </div>
    </div>
  );
}
