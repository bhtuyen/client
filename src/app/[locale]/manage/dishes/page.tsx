import { Suspense } from 'react';

import DishTable from '@/app/[locale]/manage/dishes/dish-table';

export default function DishesPage() {
  return (
    <Suspense>
      <DishTable />
    </Suspense>
  );
}
