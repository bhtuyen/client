'use client';

import { useAccountListQuery, useDeleteEmployeeMutation } from '@/app/queries/useAccount';
import TButton from '@/components/t-button';
import TDataTable, { TCellActions } from '@/components/t-data-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Role } from '@/constants/enum';
import { toast } from '@/hooks/use-toast';
import { handleErrorApi } from '@/lib/utils';
import { AccountDto } from '@/schemaValidations/account.schema';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, PlusCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

export default function EmployeeTable() {
  const employees = useAccountListQuery();
  const data = employees.data?.payload.data ?? [];

  const deleteEmployee = useDeleteEmployeeMutation();

  const tTableColumn = useTranslations('t-data-table.column');
  const tButton = useTranslations('t-button');
  const tRole = useTranslations('role');

  const columns: ColumnDef<AccountDto>[] = useMemo(
    () => [
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
              {tTableColumn('email')}
              <ArrowUpDown className='ml-2 h-4 w-4' />
            </TButton>
          );
        },
        cell: ({ row }) => <div className='lowercase w-[200px]'>{row.getValue('email')}</div>
      },
      {
        accessorKey: 'role',
        header: () => <div className='text-center w-[200px]'>{tTableColumn('role')}</div>,
        cell: ({ row }) => <div className='w-[200px] text-center '>{tRole(row.getValue<Role>('role'))}</div>
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: function Actions({ row }) {
          return (
            <TCellActions
              editOption={{
                urlEdit: `/manage/employees/${row.original.id}/edit`
              }}
              deleteOption={{
                description: {
                  key: 'delete-account',
                  values: {
                    name: row.original.name
                  }
                },
                title: 'delete-account',
                onAction: async () => {
                  try {
                    const result = await deleteEmployee.mutateAsync(row.original.id);
                    toast({
                      description: result.payload.message
                    });
                  } catch (error: any) {
                    handleErrorApi({ error });
                  }
                }
              }}
            />
          );
        }
      }
    ],
    [tRole, tTableColumn, deleteEmployee]
  );
  return (
    <TDataTable
      data={data}
      columns={columns}
      childrenToolbar={
        <TButton size='sm' className='h-7 gap-1' asLink href='/manage/employees/create'>
          <PlusCircle className='h-3.5 w-3.5' />
          <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>{tButton('create-employee')}</span>
        </TButton>
      }
      filter={{ placeholder: { key: 'input-placeholder-employee' }, column: 'email' }}
    />
  );
}
