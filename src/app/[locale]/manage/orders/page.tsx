import OrderTable from '@/app/[locale]/manage/orders/order-table';

import { Suspense } from 'react';

export default function AccountsPage() {
  return (
    <Suspense>
      <OrderTable />
    </Suspense>
  );
}
