'use client';
import { Loader, QrCode, Table, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import type { TableDto } from '@/schemaValidations/table.schema';
import type { ColumnDef } from '@tanstack/react-table';

import { useTableListQuery } from '@/app/queries/useTable';
import QRCodeTable from '@/components/qrcode-table';
import TButton from '@/components/t-button';
import TDataTable from '@/components/t-data-table';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export function ChooseTable({ setTable }: { setTable: (table: TableDto) => void }) {
  const [open, setOpen] = useState(false);
  const [rowsSelected, setRowsSelected] = useState<TableDto[]>([]);
  const tableListQuery = useTableListQuery(open);
  const tables = useMemo(() => tableListQuery.data?.payload.data ?? [], [tableListQuery.data?.payload.data]);

  const tTableStatus = useTranslations('table-status');
  const tTableColumn = useTranslations('t-data-table.column');
  const tButton = useTranslations('t-button');
  const tSheet = useTranslations('t-sheet');

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
        cell: ({ row }) => <div className='capitalize text-center'>{row.original.number}</div>
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
        cell: ({ row }) => <QRCodeTable tableNumber={row.original.number} token={row.original.token} size={100} isFillText={false} />
      }
    ],
    [tTableColumn, tTableStatus]
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <TButton variant='outline' type='button'>
          {tButton('choose-table')}
        </TButton>
      </SheetTrigger>
      <SheetContent className='w-[1000px] sm:max-w-[1000px] p-4'>
        <SheetHeader className='h-14 mb-2'>
          <SheetTitle>{tSheet('choose-table-title')}</SheetTitle>
          <SheetDescription>{tSheet('choose-table-description')}</SheetDescription>
        </SheetHeader>
        <TDataTable
          setRowsSelected={setRowsSelected}
          data={tables}
          onlyOneSelected
          className='!h-[calc(100%_-_6.75rem)] mb-2'
          columns={columns}
          filter={{ placeholder: { key: 'input-placeholder-table' }, columnId: 'table-number' }}
        />
        <SheetFooter>
          <TButton
            type='button'
            disabled={rowsSelected.length === 0}
            onClick={() => {
              if (rowsSelected.length > 0) {
                setTable(rowsSelected[0]);
                setOpen(false);
              }
            }}
          >
            {tButton('confirm')}
          </TButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
