'use client';

import { useAppStore } from '@/components/app-provider';
import { DataTablePagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from '@/i18n/routing';
import { DeleteOption, EditOption } from '@/types/common.type';
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
  VisibilityState,
  type Table as TableType
} from '@tanstack/react-table';
import { PencilIcon, Search, Settings2, TrashIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ReactNode, useState } from 'react';

interface TCellActionsProps {
  editOption: EditOption;

  deleteOption: DeleteOption;
}

interface TToolbarProps<TData> {
  table: TableType<TData>;
  children?: ReactNode;
  filter?: {
    placeholder: string;
    column: string;
  };
}

interface TFilterProps<TData> {
  table: TableType<TData>;

  filter?: {
    placeholder: string;
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
    placeholder: string;
    column: string;
  };
}

export default function TTable<TData, TValue>({ data, columns, childrenToolbar, filter }: TTableProps<TData, TValue>) {
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
    <div className='h-full flex flex-col gap-4 w-full'>
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
              <TableCell colSpan={columns.length} className='h-24 text-center w-auto'>
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DataTablePagination table={table} />
    </div>
  );
}

export function TFilter<TData>({ table, filter }: TFilterProps<TData>) {
  const { column, placeholder } = filter ?? {};
  return (
    <Input
      placeholder={placeholder ?? 'Search...'}
      value={(table.getColumn(column ?? 'name')?.getFilterValue() as string) ?? ''}
      onChange={(event) => table.getColumn(column ?? 'name')?.setFilterValue(event.target.value)}
      className='max-w-sm'
      IconLeft={Search}
    />
  );
}
export function TOption<TData>({ table }: TOptionProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm' className='ml-auto hidden h-8 lg:flex'>
          <Settings2 />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[150px]'>
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className='capitalize'
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
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
      <div className='flex items-center gap-4'>
        <TFilter table={table} filter={filter} />
        <TOption table={table} />
      </div>
      {children}
    </div>
  );
}

export function TCellAction({ editOption, deleteOption }: TCellActionsProps) {
  const { showAlertDialog } = useAppStore();
  const tButton = useTranslations('button');
  const { urlEdit } = editOption;

  const deleteOptionDefault: DeleteOption = {
    action: {
      key: 'confirm',
      values: {}
    },
    cancel: {
      key: 'cancel',
      values: {}
    },
    description: {
      key: 'delete-row-table-default',
      values: {}
    },
    onAction: () => {},
    title: {
      key: 'delete-row-table-default',
      values: {}
    }
  };

  const handleDeleteRow = () => {
    showAlertDialog(deleteOption ?? deleteOptionDefault);
  };
  return (
    <div className='flex items-center gap-4 w-full'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={urlEdit}
            className='rounded-md border border-input size-9 inline-flex items-center justify-center hover:bg-accent'
          >
            <span className='sr-only'>{tButton('edit')}</span>
            <PencilIcon height={16} width={16} />
          </Link>
        </TooltipTrigger>
        <TooltipContent side='top' align='center'>
          <span>{tButton('edit')}</span>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant='outline' size='icon' onClick={handleDeleteRow}>
            <span className='sr-only'>{tButton('delete')}</span>
            <TrashIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent side='top' align='center'>
          {tButton('delete')}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
