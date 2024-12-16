import { Suspense } from 'react';

import TableTable from '@/app/[locale]/manage/tables/table-table';

export default function TablesPage() {
  return (
    <Suspense>
      <TableTable />
    </Suspense>
  );
}
