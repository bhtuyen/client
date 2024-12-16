import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import type { DishStatus } from '@/constants/enum';
import type { DishesRes } from '@/schemaValidations/dish.schema';
import type { ColumnDef, ColumnFiltersState, SortingState, VisibilityState } from '@tanstack/react-table';

import { useDishListQuery } from '@/app/queries/useDish';
import AutoPagination from '@/components/auto-pagination';
import TButton from '@/components/t-button';
import TImage from '@/components/t-image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, simpleMatchText } from '@/lib/utils';

type DishItem = DishesRes['data'][0];

const PAGE_SIZE = 10;
export function DishesDialog({ onChoose }: { onChoose: (_dish: DishItem) => void }) {
  const [open, setOpen] = useState(false);
  const dishListQuery = useDishListQuery();
  const data = dishListQuery.data?.payload.data ?? [];
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
    pageSize: PAGE_SIZE //default page size
  });

  const tDishStatus = useTranslations('dish-status');

  const columns: ColumnDef<DishItem>[] = [
    {
      id: 'dishName',
      header: 'Món ăn',
      cell: ({ row }) => (
        <div className='flex items-center space-x-4'>
          <TImage src={row.original.image} alt={row.original.name} width={50} height={50} className='rounded-md object-cover w-[50px] h-[50px]' />
          <span>{row.original.name}</span>
        </div>
      ),
      filterFn: (row, columnId, filterValue: string) => {
        if (filterValue === undefined) return true;
        return simpleMatchText(String(row.original.name), String(filterValue));
      }
    },
    {
      accessorKey: 'price',
      header: 'Giá cả',
      cell: ({ row }) => <div className='capitalize'>{formatCurrency(row.getValue('price'))}</div>
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => <div>{tDishStatus(row.getValue<DishStatus>('status'))}</div>
    }
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination
    }
  });

  useEffect(() => {
    table.setPagination({
      pageIndex: 0,
      pageSize: PAGE_SIZE
    });
  }, [table]);

  const choose = (dish: DishItem) => {
    onChoose(dish);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TButton variant='outline'>Thay đổi</TButton>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Chọn món ăn</DialogTitle>
        </DialogHeader>
        <div>
          <div className='w-full'>
            <div className='flex items-center py-4'>
              <Input
                placeholder='Lọc tên'
                value={(table.getColumn('dishName')?.getFilterValue() as string) ?? ''}
                onChange={(event) => table.getColumn('dishName')?.setFilterValue(event.target.value)}
                className='max-w-sm'
              />
            </div>
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
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
                        onClick={() => choose(row.original)}
                        className='cursor-pointer'
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className='h-24 text-center'>
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className='flex items-center justify-end space-x-2 py-4'>
              <div className='text-xs text-muted-foreground py-4 flex-1 '>
                Hiển thị <strong>{table.getPaginationRowModel().rows.length}</strong> trong <strong>{data.length}</strong> kết quả
              </div>
              <div>
                <AutoPagination
                  page={table.getState().pagination.pageIndex + 1}
                  pageSize={table.getPageCount()}
                  isLink={false}
                  onClick={(pageNumber) => table.setPagination({ pageIndex: pageNumber - 1, pageSize: PAGE_SIZE })}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
