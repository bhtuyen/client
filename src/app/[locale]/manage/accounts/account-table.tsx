'use client';

import AddEmployee from '@/app/[locale]/manage/accounts/add-employee';
import { useAccountListQuery } from '@/app/queries/useAccount';
import TButton from '@/components/t-button';
import TTable, { TCellAction } from '@/components/t-data-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AccountType } from '@/schemaValidations/account.schema';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AccountTable() {
  const accountListQuery = useAccountListQuery();
  const data = accountListQuery.data?.payload.data ?? [];
  const tTableColumn = useTranslations('t-data-table.column');
  const columns: ColumnDef<AccountType>[] = [
    {
      accessorKey: 'avatar',
      header: () => <div className=''>{tTableColumn('employee')}</div>,
      cell: ({ row }) => (
        <div className='flex items-center gap-4 w-[200px]'>
          <Avatar className='size-10 rounded-full object-cover'>
            <AvatarImage src={row.getValue('avatar')} />
            <AvatarFallback className='rounded-none'>{row.original.name}</AvatarFallback>
          </Avatar>
          <span className='capitalize'>{row.original.name}</span>
        </div>
      ),
      enableHiding: false
    },
    {
      accessorKey: 'phone',
      header: () => <div className='w-[200px]'>{tTableColumn('phone')}</div>,
      cell: ({ row }) => <div className='w-[200px]'>{row.getValue('phone')}</div>
    },
    {
      accessorKey: 'email',
      header: ({ column }) => {
        return (
          <TButton
            variant='ghost'
            size='sm'
            className='justify-start -ml-3'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Email
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </TButton>
        );
      },
      cell: ({ row }) => <div className='lowercase w-[200px]'>{row.getValue('email')}</div>
    },
    {
      accessorKey: 'role',
      header: () => <div className='w-[200px]'>{tTableColumn('role')}</div>,
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
              action: 'confirm',
              cancel: 'cancel',
              description: {
                key: 'delete-account',
                values: {
                  name: row.original.name
                }
              },
              title: 'delete-account',
              onAction: () => {}
            }}
          />
        );
      }
    }
  ];
  return (
    <TTable
      data={data}
      columns={columns}
      childrenToolbar={<AddEmployee />}
      filter={{ placeholder: { key: 'input-placeholder-employee' }, column: 'email' }}
    />
  );
}
