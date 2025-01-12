'use client';
import { Suspense } from 'react';

import OrderStatics from '@/app/[locale]/manage/orders/order-statics';
import OrderTable from '@/app/[locale]/manage/orders/order-table';
import { OrderStaticsSkeleton } from '@/components/t-skeleton';

export default function OrderDashboard() {
  return (
    <div className='flex gap-2 h-full max-[1366px]:flex-col-reverse max-[1366px]:mr-2 max-[1366px]:p-2 max-[1366px]:justify-between'>
      <OrderTable />
      <div className='flex-[2] border-l pl-2 h-full max-[1366px]:border-l-0 max-[1366px]:pl-0 max-[1366px]:h-36 max-[1366px]:flex-none max-[1366px]:border-b'>
        <Suspense fallback={<OrderStaticsSkeleton />}>
          <OrderStatics />
        </Suspense>
      </div>
    </div>
  );
}
