import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DishTable from '@/app/[locale]/manage/dishes/dish-table';
import { Suspense } from 'react';

export default function DishesPage() {
  return (
    <Suspense>
      <DishTable />
    </Suspense>
  );
}
