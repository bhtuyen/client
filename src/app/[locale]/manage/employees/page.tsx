import EmployeeTable from '@/app/[locale]/manage/employees/employee-table';
import { Suspense } from 'react';

export default function EmployeesPage() {
  return (
    <Suspense>
      <EmployeeTable />
    </Suspense>
  );
}
