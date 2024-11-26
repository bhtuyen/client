'use client';

import AddDish from '@/app/[locale]/manage/dishes/add-dish';
import { useDeleteDishMutation, useDishListQuery } from '@/app/queries/useDish';
import TTable, { TCellAction } from '@/components/t-data-table';
import { DishCategory, DishStatus } from '@/constants/enum';
import { toast } from '@/hooks/use-toast';
import { formatCurrency, handleErrorApi } from '@/lib/utils';
import { DishListResType } from '@/schemaValidations/dish.schema';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useMemo } from 'react';

type DishItem = DishListResType['data'][0];

export default function DishTable() {
  const dishesListQuery = useDishListQuery();
  const data = dishesListQuery.data?.payload.data ?? [];
  const deleteDishMutation = useDeleteDishMutation();

  const handleDeleteAccount = async (id: string) => {
    try {
      const result = await deleteDishMutation.mutateAsync(id);
      toast({
        description: result.payload.message
      });
    } catch (error: any) {
      handleErrorApi({ error });
    }
  };

  const tDishStatus = useTranslations('dish-status');
  const tDishCategory = useTranslations('dish-category');
  const tTableColumn = useTranslations('t-data-table.column');

  const columns: ColumnDef<DishItem>[] = useMemo(
    () => [
      {
        accessorKey: 'image',
        header: ({ column }) => <div className='text-center w-[100px]'>{tTableColumn('image')}</div>,
        cell: ({ row }) => (
          <div className='w-[100px]'>
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
        header: () => <div className='text-center w-[100px]'>{tTableColumn('name')}</div>,
        cell: ({ row }) => <div className='capitalize'>{row.getValue('name')}</div>
      },
      {
        accessorKey: 'price',
        header: () => <div className='text-center w-[100px]'>{tTableColumn('price')}</div>,
        cell: ({ row }) => <div className='capitalize'>{formatCurrency(row.getValue('price'))}</div>
      },
      {
        accessorKey: 'description',
        header: () => <div className='text-center w-[100px]'>{tTableColumn('description')}</div>,
        cell: ({ row }) => (
          <div dangerouslySetInnerHTML={{ __html: row.getValue('description') }} className='whitespace-pre-line' />
        )
      },
      {
        accessorKey: 'category',
        header: () => <div className='text-center w-[100px]'>{tTableColumn('category')}</div>,
        cell: ({ row }) => <div>{tDishCategory(row.getValue<DishCategory>('category'))}</div>
      },
      {
        accessorKey: 'groupName',
        header: () => <div className='text-center w-[100px]'>{tTableColumn('group-name')}</div>,
        cell: ({ row }) => <div>{row.getValue('groupName')}</div>
      },
      {
        accessorKey: 'status',
        header: () => <div className='text-center w-[100px]'>{tTableColumn('status')}</div>,
        cell: ({ row }) => <div>{tDishStatus(row.getValue<DishStatus>('status'))}</div>
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => (
          <TCellAction
            editOption={{
              urlEdit: `/manage/accounts/${row.original.id}/edit`
            }}
            deleteOption={{
              action: 'confirm',
              cancel: 'cancel',
              description: {
                key: 'delete-dish',
                values: {
                  name: row.original.name
                }
              },
              title: 'delete-dish',
              onAction: () => {
                handleDeleteAccount(row.original.id);
              }
            }}
          />
        )
      }
    ],
    [handleDeleteAccount, tDishCategory, tDishStatus, tTableColumn]
  );

  return <TTable data={data} columns={columns} childrenToolbar={<AddDish />} />;
}
