import TableTable from '@/app/[locale]/manage/tables/table-table';
import { Suspense } from 'react';

export default function TablesPage() {
  return (
    <Suspense>
      <TableTable />
    </Suspense>
  );
}
