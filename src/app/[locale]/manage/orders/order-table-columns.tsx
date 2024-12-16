'use client';

import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { PopoverClose } from '@radix-ui/react-popover';
import { useTranslations } from 'next-intl';
import { useContext } from 'react';

import type { OrderDtoDetail } from '@/schemaValidations/order.schema';
import type { ColumnDef } from '@tanstack/react-table';

import OrderGuestDetail from '@/app/[locale]/manage/orders/order-guest-detail';
import { OrderTableContext } from '@/app/[locale]/manage/orders/order-table';
import TButton from '@/components/t-button';
import TImage from '@/components/t-image';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrderStatus } from '@/constants/enum';
import { formatDateTimeToLocaleString, getEnumValues, getPrice, simpleMatchText } from '@/lib/utils';

const orderTableColumns: ColumnDef<OrderDtoDetail>[] = [
  {
    accessorKey: 'tableNumber',
    header: 'Bàn',
    cell: ({ row }) => <div>{row.getValue('tableNumber')}</div>,
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true;
      return simpleMatchText(String(row.getValue(columnId)), String(filterValue));
    }
  },
  {
    id: 'guestName',
    header: 'Khách hàng',
    cell: function Cell({ row }) {
      const { orderObjectByGuestId } = useContext(OrderTableContext);
      const guest = row.original.guest;
      return (
        <div>
          {!guest && (
            <div>
              <span>Đã bị xóa</span>
            </div>
          )}
          {guest && (
            <Popover>
              <PopoverTrigger>
                <div>
                  <span className='font-semibold'>(#{guest.id})</span>
                </div>
              </PopoverTrigger>
              <PopoverContent className='w-[320px] sm:w-[440px]'>
                <OrderGuestDetail guest={guest} orders={orderObjectByGuestId[guest.id]} />
                <PopoverClose />
              </PopoverContent>
            </Popover>
          )}
        </div>
      );
    },
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true;
      return simpleMatchText(row.original.guest.tableNumber ?? 'Đã bị xóa', String(filterValue));
    }
  },
  {
    id: 'dishName',
    header: 'Món ăn',
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <Popover>
          <PopoverTrigger asChild>
            <TImage
              src={row.original.dishSnapshot.image}
              alt={row.original.dishSnapshot.name}
              width={50}
              height={50}
              className='rounded-md object-cover w-[50px] h-[50px] cursor-pointer'
            />
          </PopoverTrigger>
          <PopoverContent>
            <div className='flex flex-wrap gap-2'>
              <TImage
                src={row.original.dishSnapshot.image}
                alt={row.original.dishSnapshot.name}
                width={100}
                height={100}
                className='rounded-md object-cover w-[100px] h-[100px]'
              />
              <div className='space-y-1 text-sm'>
                <h3 className='font-semibold'>{row.original.dishSnapshot.name}</h3>
                <div className='italic'>{getPrice(row.original.dishSnapshot)}</div>
                <div>{row.original.dishSnapshot.description}</div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <span>{row.original.dishSnapshot.name}</span>
            <Badge className='px-1' variant={'secondary'}>
              x{row.original.quantity}
            </Badge>
          </div>
          <span className='italic'>{getPrice(row.original.dishSnapshot)}</span>
        </div>
      </div>
    )
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: function Cell({ row }) {
      const { changeStatus } = useContext(OrderTableContext);
      const changeOrderStatus = async (status: OrderStatus) => {
        changeStatus({
          orderId: row.original.id,
          dishId: row.original.dishSnapshot.dishId!,
          status: status,
          quantity: row.original.quantity
        });
      };
      const tOrderStatus = useTranslations('order-status');
      return (
        <Select
          onValueChange={(value: OrderStatus) => {
            changeOrderStatus(value);
          }}
          defaultValue={OrderStatus.Pending}
          value={row.getValue('status')}
        >
          <SelectTrigger className='w-[140px]'>
            <SelectValue placeholder='Theme' />
          </SelectTrigger>
          <SelectContent>
            {getEnumValues(OrderStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {tOrderStatus(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
  },
  {
    id: 'orderHandlerName',
    header: 'Người xử lý',
    cell: ({ row }) => <div>{row.original.orderHandler?.name ?? ''}</div>
  },
  {
    accessorKey: 'createdAt',
    header: () => <div>Tạo/Cập nhật</div>,
    cell: ({ row }) => (
      <div className='space-y-2 text-sm'>
        <div className='flex items-center space-x-4'>{formatDateTimeToLocaleString(row.getValue('createdAt'))}</div>
        <div className='flex items-center space-x-4'>{formatDateTimeToLocaleString(row.original.updatedAt as unknown as string)}</div>
      </div>
    )
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: function Actions({ row }) {
      const { setOrderIdEdit } = useContext(OrderTableContext);
      const openEditOrder = () => {
        setOrderIdEdit(row.original.id);
      };

      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <TButton variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <DotsHorizontalIcon className='h-4 w-4' />
            </TButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={openEditOrder}>Sửa</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];

export default orderTableColumns;
