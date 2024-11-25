import AccountTable from '@/app/[locale]/manage/accounts/account-table';
import { Suspense } from 'react';

export default function AccountsPage() {
  return (
    <Suspense>
      <AccountTable />
    </Suspense>
  );
}
