import DishTable from '@/app/[locale]/manage/dishes/dish-table';
import { Suspense } from 'react';

export default function DishesPage() {
  return (
    <Suspense>
      <DishTable />
    </Suspense>
  );
}
