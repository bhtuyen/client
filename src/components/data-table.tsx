'use client';

import { DataTablePagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@/i18n/routing';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState
} from '@tanstack/react-table';
import { PencilIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

interface DataTableRowActionsProps {
  urlEdit: string;

  onDelete: () => void;
}

export function RowAction({ urlEdit, onDelete }: DataTableRowActionsProps) {
  return (
    <div className='flex items-center gap-4 w-full'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={urlEdit}
            className='rounded-md border border-input size-9 inline-flex items-center justify-center hover:bg-accent'
          >
            <span className='sr-only'>Edit</span>
            <PencilIcon height={16} width={16} />
          </Link>
        </TooltipTrigger>
        <TooltipContent side='top' align='center'>
          <span>Edit</span>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant='outline' size='icon'>
            <span className='sr-only'>Delete</span>
            <TrashIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent side='top' align='center'>
          Delete
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export default function DataTable<TData, TValue>({ data, columns }: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues()
  });

  return (
    <>
      <Table>
        <TableHeader className='sticky top-0 left-0 right-0 z-10 bg-background shadow shadow-border'>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-24 text-center w-auto'>
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DataTablePagination table={table} />
    </>
  );
}
