'use client';

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
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, PencilIcon, Search, Settings2, TrashIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import type { DeleteOption, EditOption } from '@/types/common.type';
import type { TMessageKeys, TMessKey } from '@/types/message.type';
import type { ColumnDef, ColumnFiltersState, SortingState, VisibilityState } from '@tanstack/react-table';
import type { ReactNode } from 'react';

import { useAppStore } from '@/components/app-provider';
import TButton from '@/components/t-button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { convertToKebabCase, getArguments } from '@/lib/utils';

interface TCellActionsProps {
  editOption?: EditOption;

  deleteOption?: DeleteOption;
}

interface TToolbarProps<TData> {
  table: TableType<TData>;
  children?: ReactNode;
  filter?: {
    placeholder: TMessKey<'t-data-table.filter'>;
    columnId: string;
  };

  filterCustom?: (table: TableType<TData>) => ReactNode;
}

interface TFilterProps<TData> {
  table: TableType<TData>;
  filter?: {
    placeholder: TMessKey<'t-data-table.filter'>;
    columnId: string;
  };
  filterCustom?: (table: TableType<TData>) => ReactNode;
}

interface TOptionProps<TData> {
  table: TableType<TData>;
}

interface TTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  className?: string | undefined;
  childrenToolbar?: ReactNode;
  filter?: {
    placeholder: TMessKey<'t-data-table.filter'>;
    columnId: string;
  };

  filterCustom?: (table: TableType<TData>) => ReactNode;
  selected?: TData[];
  setRowsSelected?: (rowsSelected: TData[]) => void;
  onlyOneSelected?: boolean;
  hasDbClickToSelect?: boolean;
  hideColumn?: string[];
}

interface DataTablePaginationProps<TData> {
  table: TableType<TData>;
  hasDbClickToSelect?: boolean;
  onlyOneSelected?: boolean;
}

export default function TDataTable<TData, TValue>({
  data,
  filter,
  columns,
  childrenToolbar,
  className,
  hasDbClickToSelect = false,
  setRowsSelected,
  onlyOneSelected = false,
  hideColumn = [],
  filterCustom
}: TTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    hideColumn.length > 0 ? hideColumn.reduce((acc, column) => ({ ...acc, [column]: false }), {}) : {}
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      rowSelection
    },
    enableRowSelection: true,
    autoResetPageIndex: false,
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

  useEffect(() => {
    if (onlyOneSelected) {
      setColumnVisibility({
        select: false
      });
    }
  }, [onlyOneSelected]);

  useEffect(() => {
    if (setRowsSelected) {
      setRowsSelected(table.getSelectedRowModel().rows.map((row) => row.original));
    }
  }, [setRowsSelected, table, data, rowSelection]);

  const tDataTable = useTranslations('t-data-table');

  return (
    <div className={`flex flex-col gap-2 w-full h-full ${className} select-none`}>
      <TToolbar table={table} filter={filter} filterCustom={filterCustom}>
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
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (hasDbClickToSelect) {
                    row.toggleSelected();
                  }
                }}
                onClick={() => {
                  if (setRowsSelected && onlyOneSelected && !row.getIsSelected()) {
                    table.toggleAllRowsSelected(false);
                    row.toggleSelected();
                  }
                }}
                className='cursor-pointer'
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-24 flex items-center justify-center w-full col-span-7'>
                {tDataTable('no-data')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TDataTablePagination table={table} hasDbClickToSelect={hasDbClickToSelect} onlyOneSelected={onlyOneSelected} />
    </div>
  );
}

export function TFilter<TData>({
  table,
  filter = {
    placeholder: 'input-placeholder-default',
    columnId: 'name'
  },
  filterCustom
}: TFilterProps<TData>) {
  const { columnId: column, placeholder } = filter;
  const tTableFilter = useTranslations('t-data-table.filter');
  return (
    <div className='flex items-center gap-2'>
      <Input
        placeholder={tTableFilter(...getArguments(placeholder))}
        value={(table.getColumn(column)?.getFilterValue() as string) ?? ''}
        onChange={(event) => table.getColumn(column)?.setFilterValue(event.target.value)}
        className='max-w-sm min-w-60'
        IconLeft={Search}
      />
      {filterCustom && filterCustom(table)}
    </div>
  );
}
export function TOption<TData>({ table }: TOptionProps<TData>) {
  const tButton = useTranslations('t-button');
  const tTableColumn = useTranslations('t-data-table.column');
  const tTableCustomize = useTranslations('t-data-table.customize');
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <TButton variant='outline'>
          <Settings2 />
          {tButton('customize')}
        </TButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[150px]'>
        <DropdownMenuLabel className='text-center'>{tTableCustomize('toggle-column')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter((column) => (typeof column.accessorFn !== 'undefined' || typeof column.id !== 'undefined') && column.getCanHide())
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
export function TToolbar<TData>({ table, children, filter, filterCustom }: TToolbarProps<TData>) {
  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <TFilter table={table} filter={filter} filterCustom={filterCustom} />
        <TOption table={table} />
      </div>
      {children}
    </div>
  );
}

export function TCellActions({ editOption, deleteOption }: TCellActionsProps) {
  const { showAlertDialog } = useAppStore();

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
    <div className='flex items-center justify-center gap-4 w-full'>
      {editOption && !editOption.render && (
        <TButton size='icon' href={editOption.urlEdit} tooltip='edit' variant='outline' asLink>
          <PencilIcon height={16} width={16} />
        </TButton>
      )}
      {editOption && editOption.render}
      {deleteOption && (
        <TButton size='icon' onClick={handleDeleteRow} variant='outline' tooltip='delete'>
          <TrashIcon />
        </TButton>
      )}
    </div>
  );
}

export function TDataTablePagination<TData>({ table, hasDbClickToSelect = false, onlyOneSelected = false }: DataTablePaginationProps<TData>) {
  const tDataTablePagination = useTranslations('t-data-table.pagination');
  return (
    <div className='flex items-center justify-between'>
      <div className='flex-1 flex items-center gap-x-4 pl-2'>
        {hasDbClickToSelect && !onlyOneSelected && (
          <>
            <Checkbox
              checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            />
            <span className='text-sm text-muted-foreground'>
              {tDataTablePagination('row-selected-info', { selected: table.getFilteredSelectedRowModel().rows.length, count: table.getRowCount() })}
            </span>
          </>
        )}
        {!hasDbClickToSelect && !onlyOneSelected && (
          <span className='text-sm text-muted-foreground'>{tDataTablePagination('total-row', { count: table.getRowCount() })}</span>
        )}
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
          <TButton onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} tooltip='first' size='icon'>
            <ChevronsLeft />
          </TButton>
          <TButton onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} tooltip='previous' size='icon'>
            <ChevronLeft />
          </TButton>
          <TButton size='icon' onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} tooltip='next'>
            <ChevronRight />
          </TButton>
          <TButton onClick={() => table.setPageIndex(table.getPageCount() - 1)} size='icon' tooltip='last' disabled={!table.getCanNextPage()}>
            <ChevronsRight />
          </TButton>
        </div>
      </div>
    </div>
  );
}
