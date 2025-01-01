import { capitalize } from 'lodash';
import { Minus, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import type { DishDtoDetailChoose, DishChooseBody } from '@/schemaValidations/dish.schema';
import type { TMessageKeys } from '@/types/message.type';
import type { ColumnDef } from '@tanstack/react-table';

import { useDishesChooseQuery } from '@/app/queries/useDish';
import TButton from '@/components/t-button';
import TDataTable from '@/components/t-data-table';
import TImage from '@/components/t-image';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { buildKey, getOptions, getPrice } from '@/lib/utils';
type ChooseDishTableProps = {
  dishChooseBody: DishChooseBody;
  submit?: (dishes: DishDtoDetailChoose[]) => void;
  submitKey?: TMessageKeys<'t-button'>;
  triggerKey?: TMessageKeys<'t-button'>;
  hasOptions?: boolean;
  hideColumn?: string[];
  onlyOneSelected?: boolean;
  side?: 'top' | 'bottom' | 'left' | 'right';
};

type DishChoose = DishDtoDetailChoose & {
  optionsCheckbox: { value: string; enabled: boolean; key: string }[];
  newOptions: string | undefined;
};
export default function ChooseDishTable({
  dishChooseBody,
  onlyOneSelected = false,
  submit,
  submitKey = 'confirm',
  triggerKey = 'choose-dish',
  hideColumn = [],
  side = 'right'
}: ChooseDishTableProps) {
  const [rowsSelected, setRowsSelected] = useState<DishChoose[]>([]);
  const [open, setOpen] = useState(false);
  const [dishesChoose, setDishesChoose] = useState<DishChoose[]>([]);
  const { data } = useDishesChooseQuery(dishChooseBody, open);

  useEffect(() => {
    if (data && open) {
      setDishesChoose(
        data.payload.data.map<DishChoose>((dish) => ({
          ...dish,
          key: uuidv4(),
          optionsCheckbox: getOptions(dish.options).map((option) => ({ value: option, enabled: false, key: buildKey(option) })),
          newOptions: ''
        }))
      );
    }
  }, [data, open]);

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity < 1) return;
      if (quantity > 20) return;
      setDishesChoose((prev) => prev.map((dish) => (dish.id === id ? { ...dish, quantity } : dish)));
    },
    [setDishesChoose]
  );

  const tTableColumn = useTranslations('t-data-table.column');
  const tDishStatus = useTranslations('dish-status');
  const tButton = useTranslations('t-button');
  const tSheet = useTranslations('t-sheet');
  const tDishCategory = useTranslations('dish-category');

  const handleUpdateOptions = (id: string, value: string) => {
    setDishesChoose((prev) => prev.map((dish) => (dish.id === id ? { ...dish, newOptions: value } : dish)));
  };

  const checkOption = (id: string, key: string, checked: boolean) => {
    setDishesChoose((prev) =>
      prev.map((dish) =>
        dish.id === id
          ? { ...dish, optionsCheckbox: dish.optionsCheckbox.map((opt) => (opt.key === key ? { ...opt, enabled: checked } : opt)) }
          : dish
      )
    );
  };

  const columns = useMemo<ColumnDef<DishChoose>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected() || ((table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected()) && 'indeterminate')}
            onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
          />
        ),
        cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} />,
        enableHiding: false
      },
      {
        accessorKey: 'image',
        header: () => <div className='text-center w-[150px]'>{tTableColumn('image')}</div>,
        cell: ({ row }) => (
          <div className='w-[150px]'>
            <TImage
              src={row.getValue('image') ?? '/restaurant.jpg'}
              alt={row.original.name}
              width={150}
              height={150}
              className='aspect-square size-21 rounded-md shadow-md mx-auto'
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
        id: 'options',
        header: () => <div className='text-center w-[100px]'>{tTableColumn('options')}</div>,
        cell: ({ row }) => (
          <div className='text-center w-[100px]'>
            <ul className='space-y-2'>
              {row.original.optionsCheckbox.map(({ key, value, enabled }) => (
                <li key={key} className='flex items-center gap-1'>
                  <Checkbox
                    id={key}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                    }}
                    checked={enabled}
                    onCheckedChange={(checked) => checkOption(row.original.id, key, !!checked)}
                  />
                  <Label htmlFor={key} onDoubleClick={(e) => e.stopPropagation()}>
                    {value}
                  </Label>
                </li>
              ))}
              <Textarea
                className='mt-1 text-xs'
                value={row.original.newOptions}
                onChange={(e) => handleUpdateOptions(row.original.id, e.target.value)}
                onKeyDown={(e) => {}}
                placeholder='Tùy chọn'
              />
            </ul>
          </div>
        )
      },
      {
        accessorKey: 'status',
        header: () => <div className='text-center w-[100px]'>{tTableColumn('status')}</div>,
        cell: ({ row }) => <div className='text-center w-[100px]'>{tDishStatus(row.original.status)}</div>
      },
      {
        accessorKey: 'quantity',
        header: () => <div className='text-center w-[100px]'>{tTableColumn('quantity')}</div>,
        cell: ({ row }) => (
          <div
            className='w-[100px]'
            onDoubleClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className='flex w-fit mx-auto items-center gap-1 px-2 py-1 rounded-2xl border border-foreground'>
              <TButton
                size='icon'
                className='size-4'
                variant='ghost'
                type='button'
                tooltip='delete'
                onClick={() => {
                  updateQuantity(row.original.id, row.original.quantity - 1);
                }}
              >
                <Minus />
              </TButton>
              <p className='w-4 text-center'>{row.original.quantity}</p>
              <TButton
                size='icon'
                className='size-4'
                variant='ghost'
                type='button'
                tooltip='delete'
                onClick={() => {
                  updateQuantity(row.original.id, row.original.quantity + 1);
                }}
              >
                <Plus />
              </TButton>
            </div>
          </div>
        )
      }
    ],
    [tTableColumn, tDishCategory, tDishStatus, updateQuantity]
  );
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <TButton variant='outline' type='button'>
          {tButton(triggerKey)}
        </TButton>
      </SheetTrigger>
      <SheetContent className='w-[1200px] sm:max-w-[1200px] p-4' side={side}>
        <SheetHeader className='h-14 mb-2'>
          <SheetTitle>{tSheet('choose-dish-title')}</SheetTitle>
          <SheetDescription>{tSheet('choose-dish-description')}</SheetDescription>
        </SheetHeader>
        <TDataTable
          setRowsSelected={setRowsSelected}
          hasDbClickToSelect
          data={dishesChoose}
          className='!h-[calc(100%_-_6.75rem)] mb-2'
          columns={columns}
          filter={{ placeholder: { key: 'input-placeholder-dish' }, columnId: 'name' }}
          hideColumn={hideColumn}
          onlyOneSelected={onlyOneSelected}
        />
        <SheetFooter>
          <TButton
            type='button'
            disabled={rowsSelected.length === 0}
            onClick={() => {
              if (submit) {
                submit(
                  rowsSelected.map((dish) => ({
                    ...dish,
                    options: capitalize(
                      dish.optionsCheckbox
                        .filter(({ enabled }) => enabled)
                        .map(({ value }) => value)
                        .concat([dish.newOptions ?? ''])
                        .join(', ')
                    )
                  }))
                );
              }
              setOpen(false);
            }}
          >
            {tButton(submitKey)}
          </TButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
