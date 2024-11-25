'use client';

import AddEmployee from '@/app/[locale]/manage/accounts/add-employee';
import { useAccountListQuery } from '@/app/queries/useAccount';
import TTable, { TCellAction } from '@/components/t-data-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AccountType } from '@/schemaValidations/account.schema';
import { CaretSortIcon } from '@radix-ui/react-icons';
import { ColumnDef } from '@tanstack/react-table';

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
      return (
        <TCellAction
          editOption={{
            urlEdit: `/manage/accounts/${row.original.id}/edit`
          }}
          deleteOption={{
            action: {
              key: 'confirm'
            },
            cancel: {
              key: 'cancel'
            },
            description: {
              key: 'delete-account',
              values: {
                name: row.original.name
              }
            },
            title: {
              key: 'delete-account'
            },
            onAction: () => {}
          }}
        />
      );
    }
  }
];

export default function AccountTable() {
  const accountListQuery = useAccountListQuery();
  const data = accountListQuery.data?.payload.data ?? [];

  return (
    <TTable
      data={data}
      columns={columns}
      childrenToolbar={<AddEmployee />}
      filter={{ placeholder: 'Tìm kiếm nhân viên', column: 'email' }}
    />
  );
}
