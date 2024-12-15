'use client';

import { useDeleteDishMutation, useDishListQuery } from '@/app/queries/useDish';
import TButton from '@/components/t-button';
import TDataTable, { TCellActions } from '@/components/t-data-table';
import TImage from '@/components/t-image';
import { toast } from '@/hooks/use-toast';
import { getDishOptions, getPrice, handleErrorApi, removeAccents } from '@/lib/utils';
import type { DishDtoDetail } from '@/schemaValidations/dish.schema';
import type { ColumnDef } from '@tanstack/react-table';
import { PlusCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

export default function DishTable() {
  const dishesListQuery = useDishListQuery();
  const data = dishesListQuery.data?.payload.data ?? [];

  const deleteDishMutation = useDeleteDishMutation();
  const tDishStatus = useTranslations('dish-status');
  const tDishCategory = useTranslations('dish-category');
  const tTableColumn = useTranslations('t-data-table.column');
  const tButton = useTranslations('t-button');

  const columns = useMemo<ColumnDef<DishDtoDetail>[]>(
    () => [
      {
        accessorKey: 'image',
        header: () => <div className='text-center w-[100px]'>{tTableColumn('image')}</div>,
        cell: ({ row }) => (
          <div className='w-[100px]'>
            <TImage
              src={row.getValue('image') ?? '/restaurant.jpg'}
              alt={row.original.name}
              width={100}
              height={100}
              className='aspect-square w-[100px] h-[100px] rounded-md shadow-md mx-auto'
              quality={100}
            />
          </div>
        )
      },
      {
        accessorKey: 'name',
        header: () => <div className='w-[150px]'>{tTableColumn('name')}</div>,
        cell: ({ row }) => <div className='capitalize w-[150px]'>{row.original.name}</div>
      },
      {
        accessorKey: 'description',
        header: () => <div className='w-auto'>{tTableColumn('description')}</div>,
        cell: ({ row }) => <div className='whitespace-pre-line w-auto capitalize'>{row.original.description}</div>
      },
      {
        accessorKey: 'price',
        header: () => <div className='text-right w-[100px]'>{tTableColumn('price')}</div>,
        cell: ({ row }) => <div className='text-right w-[100px]'>{getPrice(row.original)}</div>
      },
      {
        accessorKey: 'options',
        header: () => <div className='text-left w-[150px]'>{tTableColumn('options')}</div>,
        cell: ({ row }) => (
          <ul className='text-left w-[150px] space-y-1'>
            {getDishOptions(row.original.options).map((option) => (
              <li key={removeAccents(option)} className='capitalize'>
                ➡️ {option}
              </li>
            ))}
          </ul>
        )
      },
      {
        accessorKey: 'category',
        header: () => <div className='text-center w-[100px]'>{tTableColumn('category')}</div>,
        cell: ({ row }) => <div className='text-center w-[100px]'>{tDishCategory(row.original.category)}</div>
      },
      {
        accessorKey: 'group',
        id: 'group-name',
        header: () => <div className='text-center w-[100px]'>{tTableColumn('group-name')}</div>,
        cell: ({ row }) => <div className='text-center w-[100px]'>{row.original.group.name}</div>
      },
      {
        accessorKey: 'status',
        header: () => <div className='text-center w-[100px]'>{tTableColumn('status')}</div>,
        cell: ({ row }) => <div className='text-center w-[100px]'>{tDishStatus(row.original.status)}</div>
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
      filter={{ placeholder: { key: 'input-placeholder-dish' }, columnId: 'name' }}
    />
  );
}
