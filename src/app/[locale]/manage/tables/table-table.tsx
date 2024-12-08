'use client';

import { useDeleteTableMutation, useTableListQuery } from '@/app/queries/useTable';
import QRCodeTable from '@/components/qrcode-table';
import TButton from '@/components/t-button';
import TDataTable, { TCellActions } from '@/components/t-data-table';
import { toast } from '@/hooks/use-toast';
import { handleErrorApi } from '@/lib/utils';
import { TableDto } from '@/schemaValidations/table.schema';
import type { ColumnDef } from '@tanstack/react-table';
import { Loader, PlusCircle, QrCode, Table, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

export default function TableTable() {
  const tableListQuery = useTableListQuery();
  const deleteTableMutation = useDeleteTableMutation();
  const data = tableListQuery.data?.payload.data ?? [];

  const tTableStatus = useTranslations('table-status');
  const tTableColumn = useTranslations('t-data-table.column');
  const tButton = useTranslations('t-button');

  const columns: ColumnDef<TableDto>[] = useMemo(
    () => [
      {
        accessorKey: 'number',
        id: 'table-number',
        header: () => (
          <div className='capitalize flex items-center gap-2 justify-center'>
            <Table size={20} />
            {tTableColumn('table-number')}
          </div>
        ),
        cell: ({ row }) => <div className='capitalize text-center'>{row.original.number}</div>,
        filterFn: 'weakEquals'
      },
      {
        accessorKey: 'capacity',
        header: () => (
          <div className='capitalize flex items-center gap-2 justify-center'>
            <Users size={20} />
            {tTableColumn('capacity')}
          </div>
        ),
        cell: ({ row }) => <div className='capitalize text-center'>{row.original.capacity}</div>
      },
      {
        accessorKey: 'status',
        header: () => (
          <div className='capitalize flex items-center gap-2 justify-center'>
            <Loader size={20} />
            {tTableColumn('status')}
          </div>
        ),
        cell: ({ row }) => <div className='text-center'>{tTableStatus(row.original.status)}</div>
      },
      {
        accessorKey: 'token',
        id: 'qr-code',
        header: () => (
          <div className='capitalize flex items-center gap-2 justify-center'>
            <QrCode size={20} />
            {tTableColumn('qr-code')}
          </div>
        ),
        cell: ({ row }) => <QRCodeTable tableNumber={row.original.number} token={row.original.token} size={150} isFillText={false} />
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => (
          <TCellActions
            editOption={{
              urlEdit: `/manage/tables/${row.original.id}/edit`
            }}
            deleteOption={{
              description: {
                key: 'delete-table',
                values: {
                  name: row.original.number
                }
              },
              title: 'delete-table',
              onAction: async () => {
                try {
                  const result = await deleteTableMutation.mutateAsync(row.original.id);
                  toast({
                    description: result.payload.message
                  });
                } catch (error: any) {
                  handleErrorApi({ error });
                }
              }
            }}
          />
        )
      }
    ],
    [deleteTableMutation, tTableColumn, tTableStatus]
  );

  return (
    <TDataTable
      data={data}
      columns={columns}
      childrenToolbar={
        <TButton size='sm' className='h-7 gap-1' asLink href='/manage/tables/create'>
          <PlusCircle className='h-3.5 w-3.5' />
          <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>{tButton('create-table')}</span>
        </TButton>
      }
      filter={{ placeholder: { key: 'input-placeholder-table' }, columnId: 'table-number' }}
    />
  );
}
