import { Suspense } from 'react';

import EmployeeTable from '@/app/[locale]/manage/employees/employee-table';

export default function EmployeesPage() {
  return (
    <Suspense>
      <EmployeeTable />
    </Suspense>
  );
}
