import { capitalize } from 'lodash';
import { Minus, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import type { DishDtoDetailChoose, DishChooseBody, DishGroupDto } from '@/schemaValidations/dish.schema';
import type { TMessageKeys } from '@/types/message.type';
import type { ColumnDef } from '@tanstack/react-table';

import { useDishesChooseQuery, useDishGroupQuery } from '@/app/queries/useDish';
import TButton from '@/components/t-button';
import TDataTable from '@/components/t-data-table';
import TImage from '@/components/t-image';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { DishCategory } from '@/constants/enum';
import { buildKey, getEnumValues, getOptions, getPriceString, simpleMatchText } from '@/lib/utils';
type ChooseDishTableProps = {
  dishChooseBody: DishChooseBody;
  submit?: (dishes: DishDtoDetailChoose[]) => void;
  submitKey?: TMessageKeys<'t-button'>;
  triggerKey?: TMessageKeys<'t-button'>;
  hasOptions?: boolean;
  hideColumn?: string[];
  onlyOneSelected?: boolean;
  side?: 'top' | 'bottom' | 'left' | 'right';
  disabledBtnTriiger?: boolean;
};

type DishChoose = DishDtoDetailChoose & {
  optionsCheckbox: { value: string; enabled: boolean; key: string }[];
  newOptions: string | undefined;
};
export default function ChooseDishTable({
  dishChooseBody,
  onlyOneSelected = false,
  submit,
  disabledBtnTriiger = false,
  submitKey = 'confirm',
  triggerKey = 'choose-dish',
  hideColumn = [],
  side = 'right'
}: ChooseDishTableProps) {
  const [rowsSelected, setRowsSelected] = useState<DishChoose[]>([]);
  const [open, setOpen] = useState(false);
  const [dishesChoose, setDishesChoose] = useState<DishChoose[]>([]);
  const { data } = useDishesChooseQuery(dishChooseBody, open);
  const [groupNames, setGroupNames] = useState<DishGroupDto[]>([]);

  const dishGroupQuery = useDishGroupQuery();
  const dishGroups = useMemo(() => dishGroupQuery.data?.payload.data || [], [dishGroupQuery.data]);

  useEffect(() => {
    setGroupNames(dishGroups);
  }, [dishGroups]);

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

  const hasSelectedComboBuffet = useMemo(() => {
    return rowsSelected.some((dish) => dish.category === DishCategory.ComboBuffet);
  }, [rowsSelected]);

  const tTableColumn = useTranslations('t-data-table.column');
  const tTablePlaceholder = useTranslations('t-data-table.placeholder');
  const tDishStatus = useTranslations('dish-status');
  const tButton = useTranslations('t-button');
  const tSheet = useTranslations('t-sheet');
  const tDishCategory = useTranslations('dish-category');
  const tFilter = useTranslations('t-data-table.filter');

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
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={hasSelectedComboBuffet && row.original.category == DishCategory.ComboBuffet}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        ),
        enableHiding: false
      },
      {
        accessorKey: 'image',
        header: () => <div className='text-center w-52'>{tTableColumn('image')}</div>,
        cell: ({ row }) => (
          <div className='w-52'>
            <TImage
              src={row.getValue('image') ?? '/restaurant.jpg'}
              alt={row.original.name}
              width={150}
              height={150}
              className='aspect-square size-52 rounded-md shadow-md mx-auto'
              quality={100}
            />
          </div>
        )
      },
      {
        accessorKey: 'name',
        header: () => <div className='w-[150px]'>{tTableColumn('name')}</div>,
        cell: ({ row }) => <div className='capitalize w-[150px]'>{row.original.name}</div>,
        filterFn: (row, _, filterValue) => {
          return simpleMatchText(String(row.original.name), String(filterValue));
        }
      },
      {
        accessorKey: 'description',
        header: () => <div className='w-auto'>{tTableColumn('description')}</div>,
        cell: ({ row }) => <div className='whitespace-pre-line w-auto capitalize'>{row.original.description}</div>
      },
      {
        accessorKey: 'price',
        header: () => <div className='text-right w-[100px]'>{tTableColumn('price')}</div>,
        cell: ({ row }) => <div className='text-right w-[100px]'>{getPriceString(row.original)}</div>
      },
      {
        accessorKey: 'category',
        header: () => <div className='text-center w-[100px]'>{tTableColumn('category')}</div>,
        cell: ({ row }) => <div className='text-center w-[100px]'>{tDishCategory(row.original.category)}</div>,
        filterFn: (row, _, filterValue) => {
          return row.original.category == filterValue;
        }
      },
      {
        accessorKey: 'groupId',
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
                placeholder={tTablePlaceholder('more-options')}
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
        id: 'quantity',
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
    [tTableColumn, tDishCategory, tDishStatus, updateQuantity, tTablePlaceholder, hasSelectedComboBuffet]
  );
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <TButton variant='outline' type='button' className='mr-2 max-[1366px]:mr-0' disabled={disabledBtnTriiger}>
          {tButton(triggerKey)}
        </TButton>
      </SheetTrigger>
      <SheetContent className='w-[1300px] sm:max-w-[1300px] p-4' side={side}>
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
          filterCustom={(table) => {
            return (
              <div className='flex gap-2 items-center'>
                <Select
                  onValueChange={(value) => {
                    const categoryCol = table.getColumn('category');
                    if (categoryCol) {
                      categoryCol.setFilterValue(value);
                    }
                  }}
                  value={(table.getColumn('category')?.getFilterValue() as string) ?? ''}
                >
                  <SelectTrigger className='min-w-60'>
                    <SelectValue placeholder={tFilter('select-placeholder-category')} />
                  </SelectTrigger>
                  <SelectContent>
                    {getEnumValues(DishCategory)
                      .filter((category) => {
                        if (!dishChooseBody.comboBuffetId && category === DishCategory.Buffet) {
                          return false;
                        }
                        if (dishChooseBody.comboBuffetId && category === DishCategory.ComboBuffet) {
                          return false;
                        }
                        return true;
                      })
                      .map((category) => (
                        <SelectItem key={category} value={category}>
                          {tDishCategory(category)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Select
                  onValueChange={(value) => {
                    const groupNameCol = table.getColumn('group-name');
                    if (groupNameCol) {
                      groupNameCol.setFilterValue(value);
                    }
                  }}
                  value={(table.getColumn('group-name')?.getFilterValue() as string) ?? ''}
                >
                  <SelectTrigger className='min-w-60'>
                    <SelectValue placeholder={tFilter('select-placeholder-group-name')} />
                  </SelectTrigger>
                  <SelectContent>
                    {groupNames.map(({ id, name }) => (
                      <SelectItem key={id} value={id}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          }}
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
                        .filter(({ enabled, value }) => enabled && value && value.trim())
                        .map(({ value }) => value)
                        .concat([dish.newOptions ?? ''])
                        .filter((value) => value && value.trim())
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
