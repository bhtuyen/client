'use client';

import { useAppStore } from '@/components/app-provider';
import TButton from '@/components/t-button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { convertToKebabCase } from '@/lib/utils';
import type { DeleteOption, EditOption } from '@/types/common.type';
import type { TMessageKeys, TMessageOption } from '@/types/message.type';
import type { ColumnDef, ColumnFiltersState, SortingState, VisibilityState } from '@tanstack/react-table';
import {
  type Table as TableType,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  PencilIcon,
  Search,
  Settings2,
  TrashIcon
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { useState } from 'react';

interface TCellActionsProps {
  editOption: EditOption;

  deleteOption: DeleteOption;
}

interface TToolbarProps<TData> {
  table: TableType<TData>;
  children?: ReactNode;
  filter?: {
    placeholder: TMessageOption<'t-data-table.filter'>;
    column: string;
  };
}

interface TFilterProps<TData> {
  table: TableType<TData>;

  filter?: {
    placeholder: TMessageOption<'t-data-table.filter'>;
    column: string;
  };
}

interface TOptionProps<TData> {
  table: TableType<TData>;
}

interface TTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];

  childrenToolbar?: ReactNode;

  filter?: {
    placeholder: TMessageOption<'t-data-table.filter'>;
    column: string;
  };
}

interface DataTablePaginationProps<TData> {
  table: TableType<TData>;
}

export default function TDataTable<TData, TValue>({
  data,
  columns,
  childrenToolbar,
  filter
}: TTableProps<TData, TValue>) {
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
  const tDataTable = useTranslations('t-data-table');

  return (
    <div className='flex flex-col gap-2 p-2 w-full overflow-hidden'>
      <TToolbar table={table} filter={filter}>
        {childrenToolbar}
      </TToolbar>
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
              <TableCell colSpan={columns.length} className='h-24'>
                {tDataTable('no-data')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TDataTablePagination table={table} />
    </div>
  );
}

export function TFilter<TData>({
  table,
  filter = {
    placeholder: {
      key: 'input-placeholder-default',
      values: {}
    },
    column: 'name'
  }
}: TFilterProps<TData>) {
  const { column, placeholder } = filter;
  const tTableFilter = useTranslations('t-data-table.filter');
  return (
    <Input
      placeholder={tTableFilter(placeholder?.key, placeholder?.values)}
      value={(table.getColumn(column)?.getFilterValue() as string) ?? ''}
      onChange={(event) => table.getColumn(column)?.setFilterValue(event.target.value)}
      className='max-w-sm h-8'
      IconLeft={Search}
    />
  );
}
export function TOption<TData>({ table }: TOptionProps<TData>) {
  const tButton = useTranslations('t-button');
  const tTableColumn = useTranslations('t-data-table.column');
  const tTableCustomize = useTranslations('t-data-table.customize');
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <TButton variant='outline' size='sm'>
          <Settings2 />
          {tButton('customize')}
        </TButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[150px]'>
        <DropdownMenuLabel className='text-center'>{tTableCustomize('toggle-column')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                className='cursor-pointer'
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {tTableColumn(convertToKebabCase(column.id) as TMessageKeys<'t-data-table.column'>)}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
export function TToolbar<TData>({ table, children, filter }: TToolbarProps<TData>) {
  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <TFilter table={table} filter={filter} />
        <TOption table={table} />
      </div>
      {children}
    </div>
  );
}

export function TCellActions({ editOption, deleteOption }: TCellActionsProps) {
  const { showAlertDialog } = useAppStore();
  const { urlEdit } = editOption;

  const deleteOptionDefault: DeleteOption = {
    action: 'confirm',
    cancel: 'cancel',
    description: 'delete-row-table-default',
    onAction: () => {},
    title: 'delete-row-table-default'
  };

  const handleDeleteRow = () => {
    showAlertDialog(deleteOption ?? deleteOptionDefault);
  };
  return (
    <div className='flex items-center gap-4 w-full'>
      <TButton size='icon' href={urlEdit} tooltip='edit' variant='outline' asLink>
        <PencilIcon height={16} width={16} />
      </TButton>
      <TButton size='icon' onClick={handleDeleteRow} variant='outline' tooltip='delete'>
        <TrashIcon />
      </TButton>
    </div>
  );
}

export function TDataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  const tDataTablePagination = useTranslations('t-data-table.pagination');
  return (
    <div className='flex items-center justify-between'>
      <div className='flex-1 text-sm text-muted-foreground'>
        {tDataTablePagination('row-selected-info', { count: table.getFilteredSelectedRowModel().rows.length })}
      </div>
      <div className='flex items-center space-x-6 lg:space-x-8'>
        <div className='flex items-center space-x-2'>
          <p className='text-sm font-medium'>{tDataTablePagination('rows-per-page')}</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side='top'>
              {[5, 10, 15, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
          {tDataTablePagination('page-info', {
            page: table.getState().pagination.pageIndex + 1,
            total: table.getPageCount()
          })}
        </div>
        <div className='flex items-center space-x-2'>
          <TButton
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            tooltip='first'
            size='icon'
          >
            <ChevronsLeft />
          </TButton>
          <TButton
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            tooltip='previous'
            size='icon'
          >
            <ChevronLeft />
          </TButton>
          <TButton size='icon' onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} tooltip='next'>
            <ChevronRight />
          </TButton>
          <TButton
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            size='icon'
            tooltip='last'
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight />
          </TButton>
        </div>
      </div>
    </div>
  );
}
