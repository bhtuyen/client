'use client';

import AddTable from '@/app/[locale]/manage/tables/create/add-table';
import { useDeleteTableMutation, useTableListQuery } from '@/app/queries/useTable';
import QRCodeTable from '@/components/qrcode-table';
import TDataTable, { TCellActions } from '@/components/t-data-table';
import type { TableStatus } from '@/constants/enum';
import { toast } from '@/hooks/use-toast';
import { handleErrorApi } from '@/lib/utils';
import { TableDto } from '@/schemaValidations/table.schema';
import type { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo } from 'react';

export default function TableTable() {
  const tableListQuery = useTableListQuery();
  const data = tableListQuery.data?.payload.data ?? [];

  const tTableStatus = useTranslations('table-status');
  const tTableColumn = useTranslations('t-data-table.column');

  const deleteTableMutation = useDeleteTableMutation();
  const handleDeleteAccount = useCallback(
    async (tableNumber: string) => {
      try {
        const result = await deleteTableMutation.mutateAsync(tableNumber);
        toast({
          description: result.payload.message
        });
      } catch (error: any) {
        handleErrorApi({ error });
      }
    },
    [deleteTableMutation]
  );

  const columns: ColumnDef<TableDto>[] = useMemo(
    () => [
      {
        accessorKey: 'number',
        id: 'table-number',
        header: () => <div className='capitalize'>{tTableColumn('table-number')}</div>,
        cell: ({ row }) => <div className='capitalize'>{row.getValue('number')}</div>,
        filterFn: 'weakEquals'
      },
      {
        accessorKey: 'capacity',
        header: () => <div className='capitalize'>{tTableColumn('capacity')}</div>,
        cell: ({ row }) => <div className='capitalize'>{row.getValue('capacity')}</div>
      },
      {
        accessorKey: 'status',
        header: () => <div className='capitalize'>{tTableColumn('status')}</div>,
        cell: ({ row }) => <div>{tTableStatus(row.getValue<TableStatus>('status'))}</div>
      },
      {
        accessorKey: 'token',
        id: 'qr-code',
        header: () => <div className='capitalize'>{tTableColumn('qr-code')}</div>,
        cell: ({ row }) => (
          <div>
            <QRCodeTable tableNumber={row.getValue('number')} token={row.getValue('token')} />
          </div>
        )
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: function Actions({ row }) {
          return (
            <TCellActions
              editOption={{
                urlEdit: `/manage/tables/${row.original.number}/edit`
              }}
              deleteOption={{
                description: {
                  key: 'delete-account',
                  values: {
                    name: row.original.number
                  }
                },
                title: 'delete-account',
                onAction: () => {
                  handleDeleteAccount(row.original.number);
                }
              }}
            />
          );
        }
      }
    ],
    [handleDeleteAccount, tTableColumn, tTableStatus]
  );

  return <TDataTable data={data} columns={columns} childrenToolbar={<AddTable />} />;
}
