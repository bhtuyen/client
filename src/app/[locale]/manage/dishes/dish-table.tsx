'use client';

import { useDeleteDishMutation, useDishListQuery } from '@/app/queries/useDish';
import TButton from '@/components/t-button';
import TDataTable, { TCellActions } from '@/components/t-data-table';
import type { DishCategory, DishStatus } from '@/constants/enum';
import { toast } from '@/hooks/use-toast';
import { formatCurrency, handleErrorApi } from '@/lib/utils';
import type { DishDtoDetail, DishGroupDto } from '@/schemaValidations/dish.schema';
import type { ColumnDef } from '@tanstack/react-table';
import { PlusCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useMemo } from 'react';

export default function DishTable() {
  const dishesListQuery = useDishListQuery();
  const data = dishesListQuery.data?.payload.data ?? [];

  // data.push({
  //   id: '1fef656a-3d71-440a-8660-b1abd2e26e23',
  //   name: 'Salad hành paro',
  //   price: 69000,
  //   description: 'Salad hành paro',
  //   image: 'http://localhost:4000/static/0011b20501a14cce8d451357d7fc5282.jpg',
  //   status: DishStatus.Available,
  //   category: DishCategory.Paid,
  //   groupId: 'da5e0a32-fb59-4474-9502-942f70811065',
  //   options: '',
  //   groupName: 'Salad',
  //   createdAt: new Date(),
  //   updatedAt: new Date()
  // });

  const deleteDishMutation = useDeleteDishMutation();
  const tDishStatus = useTranslations('dish-status');
  const tDishCategory = useTranslations('dish-category');
  const tTableColumn = useTranslations('t-data-table.column');
  const tButton = useTranslations('t-button');

  const columns: ColumnDef<DishDtoDetail>[] = useMemo(
    () => [
      {
        accessorKey: 'image',
        header: () => <div className='text-center w-[100px]'>{tTableColumn('image')}</div>,
        cell: ({ row }) => (
          <div className='w-[100px]'>
            <Image
              src={row.getValue('image') ?? '/restaurant.jpg'}
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
        header: () => <div className='w-[150px]'>{tTableColumn('name')}</div>,
        cell: ({ row }) => <div className='capitalize w-[150px]'>{row.getValue('name')}</div>
      },
      {
        accessorKey: 'description',
        header: () => <div className='w-auto'>{tTableColumn('description')}</div>,
        cell: ({ row }) => (
          <div
            dangerouslySetInnerHTML={{ __html: row.getValue('description') }}
            className='whitespace-pre-line w-auto'
          />
        )
      },
      {
        accessorKey: 'price',
        header: () => <div className='text-right w-[100px]'>{tTableColumn('price')}</div>,
        cell: ({ row }) => <div className='text-right w-[100px]'>{formatCurrency(row.getValue('price'))}</div>
      },
      {
        accessorKey: 'category',
        header: () => <div className='text-center w-[100px]'>{tTableColumn('category')}</div>,
        cell: ({ row }) => (
          <div className='text-center w-[100px]'>{tDishCategory(row.getValue<DishCategory>('category'))}</div>
        )
      },
      {
        accessorKey: 'group',
        header: () => <div className='text-center w-[100px]'>{tTableColumn('group-name')}</div>,
        cell: ({ row }) => <div className='text-center w-[100px]'>{row.getValue<DishGroupDto>('group').name}</div>
      },
      {
        accessorKey: 'status',
        header: () => <div className='text-center w-[100px]'>{tTableColumn('status')}</div>,
        cell: ({ row }) => (
          <div className='text-center w-[100px]'>{tDishStatus(row.getValue<DishStatus>('status'))}</div>
        )
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => (
          <TCellActions
            editOption={{
              urlEdit: `/manage/dishes/${row.original.id}/edit`
            }}
            deleteOption={{
              description: {
                key: 'delete-dish',
                values: {
                  name: row.original.name
                }
              },
              title: 'delete-dish',
              onAction: async () => {
                try {
                  const result = await deleteDishMutation.mutateAsync(row.original.id);
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
    [deleteDishMutation, tDishCategory, tDishStatus, tTableColumn]
  );

  return (
    <TDataTable
      data={data}
      columns={columns}
      childrenToolbar={
        <TButton size='sm' className='h-7 gap-1' asLink href='/manage/dishes/create'>
          <PlusCircle className='h-3.5 w-3.5' />
          <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>{tButton('create-dish')}</span>
        </TButton>
      }
    />
  );
}
