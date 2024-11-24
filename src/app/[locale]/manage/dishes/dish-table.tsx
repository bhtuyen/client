'use client';

import { ColumnDef } from '@tanstack/react-table';

import AddDish from '@/app/[locale]/manage/dishes/add-dish';
import { useDeleteDishMutation, useDishListQuery } from '@/app/queries/useDish';
import DataTable, { RowAction } from '@/components/data-table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { DishCategory, DishStatus } from '@/constants/enum';
import { toast } from '@/hooks/use-toast';
import { formatCurrency, handleErrorApi } from '@/lib/utils';
import { DishListResType } from '@/schemaValidations/dish.schema';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

type DishItem = DishListResType['data'][0];

function AlertDialogDeleteDish({
  dishDelete,
  setDishDelete
}: {
  dishDelete: DishItem | null;
  setDishDelete: (_value: DishItem | null) => void;
}) {
  const deleteDishMutation = useDeleteDishMutation();

  const handleDeleteAccount = async () => {
    if (dishDelete) {
      try {
        const result = await deleteDishMutation.mutateAsync(dishDelete.id);
        setDishDelete(null);
        toast({
          description: result.payload.message
        });
      } catch (error: any) {
        handleErrorApi({ error });
      }
    }
  };

  return (
    <AlertDialog
      open={Boolean(dishDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setDishDelete(null);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa món ăn?</AlertDialogTitle>
          <AlertDialogDescription>
            Món <span className='bg-foreground text-primary-foreground rounded px-1'>{dishDelete?.name}</span> sẽ bị xóa
            vĩnh viễn
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteAccount}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
// Số lượng item trên 1 trang
const PAGE_SIZE = 10;
export default function DishTable() {
  const dishesListQuery = useDishListQuery();
  const data = dishesListQuery.data?.payload.data ?? [];

  const tDishStatus = useTranslations('dish-status');
  const tDishCategory = useTranslations('dish-category');

  const columns: ColumnDef<DishItem>[] = [
    {
      accessorKey: 'image',
      header: ({}) => {
        return <div className='text-center w-[150px]'>Ảnh</div>;
      },
      cell: ({ row }) => (
        <div className='w-[150px]'>
          <Image
            src={row.getValue('image')}
            alt={row.original.name}
            width={100}
            height={100}
            objectFit='cover'
            className='aspect-square w-[100px] h-[100px] rounded-md shadow-md mx-auto'
            layout='responsive'
            loading='lazy'
            quality={100}
          />
        </div>
      )
    },
    {
      accessorKey: 'name',
      header: 'Tên',
      cell: ({ row }) => <div className='capitalize'>{row.getValue('name')}</div>
    },
    {
      accessorKey: 'price',
      header: 'Giá cả',
      cell: ({ row }) => <div className='capitalize'>{formatCurrency(row.getValue('price'))}</div>
    },
    {
      accessorKey: 'description',
      header: 'Mô tả',
      cell: ({ row }) => (
        <div dangerouslySetInnerHTML={{ __html: row.getValue('description') }} className='whitespace-pre-line' />
      )
    },
    {
      accessorKey: 'category',
      header: 'Loại món',
      cell: ({ row }) => <div>{tDishCategory(row.getValue<DishCategory>('category'))}</div>
    },
    {
      accessorKey: 'groupName',
      header: 'Nhóm',
      cell: ({ row }) => <div>{row.getValue('groupName')}</div>
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => <div>{tDishStatus(row.getValue<DishStatus>('status'))}</div>
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => <RowAction urlEdit={`/manage/dishes/${row.original.id}/edit`} onDelete={() => {}} />
    }
  ];

  return (
    <div className='h-full flex flex-col gap-4'>
      <div className='flex items-center'>
        {/* <Input
          placeholder='Lọc tên'
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
          className='max-w-sm'
          IconLeft={Search}
        /> */}
        <div className='ml-auto flex items-center gap-2'>
          <AddDish />
        </div>
      </div>
      <DataTable data={data} columns={columns} />
    </div>
  );
}
