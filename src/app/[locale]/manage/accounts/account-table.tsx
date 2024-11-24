'use client';

import AddEmployee from '@/app/[locale]/manage/accounts/add-employee';
import { useAccountListQuery, useDeleteEmployeeMutation } from '@/app/queries/useAccount';
import DataTable, { RowAction } from '@/components/data-table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { handleErrorApi } from '@/lib/utils';
import { AccountListResType, AccountType } from '@/schemaValidations/account.schema';
import { CaretSortIcon } from '@radix-ui/react-icons';
import { ColumnDef } from '@tanstack/react-table';

type AccountItem = AccountListResType['data'][0];

export const columns: ColumnDef<AccountType>[] = [
  {
    accessorKey: 'avatar',
    header: 'Nhân viên',
    cell: ({ row }) => (
      <div className='flex items-center gap-4 w-[200px]'>
        <Avatar className='size-10 rounded-full object-cover'>
          <AvatarImage src={row.getValue('avatar')} />
          <AvatarFallback className='rounded-none'>{row.original.name}</AvatarFallback>
        </Avatar>
        <span className='capitalize'>{row.original.name}</span>
      </div>
    )
  },
  {
    accessorKey: 'phone',
    header: 'Số điện thoại',
    cell: ({ row }) => <div className='w-[200px]'>{row.getValue('phone')}</div>
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='sm'
          className='w-[200px] justify-start -ml-3'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Email
          <CaretSortIcon className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => <div className='lowercase w-[200px]'>{row.getValue('email')}</div>
  },
  {
    accessorKey: 'role',
    header: 'Chức vụ',
    cell: ({ row }) => <div className='lowercase w-[200px]'>{row.getValue('role')}</div>
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: function Actions({ row }) {
      return <RowAction urlEdit={`/manage/accounts/${row.original.id}/edit`} onDelete={() => {}} />;
    }
  }
];

function AlertDialogDeleteAccount({
  employeeDelete,
  setEmployeeDelete
}: {
  employeeDelete: AccountItem | null;
  setEmployeeDelete: (_value: AccountItem | null) => void;
}) {
  const deleteAccount = useDeleteEmployeeMutation();

  const handleDeleteAccount = async () => {
    if (employeeDelete) {
      try {
        const result = await deleteAccount.mutateAsync(employeeDelete.id);
        setEmployeeDelete(null);
        toast({
          description: result.payload.message
        });
      } catch (error: any) {
        handleErrorApi({ error });
      }
    }
  };
  return (
    <AlertDialog
      open={Boolean(employeeDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setEmployeeDelete(null);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa nhân viên?</AlertDialogTitle>
          <AlertDialogDescription>
            Tài khoản <span className='bg-foreground text-primary-foreground rounded px-1'>{employeeDelete?.name}</span>{' '}
            sẽ bị xóa vĩnh viễn
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteAccount}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
export default function AccountTable() {
  const accountListQuery = useAccountListQuery();
  const data = accountListQuery.data?.payload.data ?? [];

  return (
    <div className='w-full space-y-4'>
      <div className='flex items-center'>
        {/* <Input
          placeholder='Filter emails...'
          value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('email')?.setFilterValue(event.target.value)}
          className='max-w-sm'
          IconLeft={Search}
        /> */}
        <div className='ml-auto flex items-center gap-2'>
          <AddEmployee />
        </div>
      </div>
      <DataTable data={data} columns={columns} />
    </div>
  );
}
