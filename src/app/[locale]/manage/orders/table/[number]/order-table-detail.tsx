'use client';

import { PencilIcon, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo } from 'react';

import type { DishChooseBody, DishDtoDetailChoose } from '@/schemaValidations/dish.schema';
import type { DishToOrder, OrderDtoDetail } from '@/schemaValidations/order.schema';
import type { ColumnDef } from '@tanstack/react-table';

import ChooseDishTable from '@/app/[locale]/manage/dishes/choose-dish-table';
import EditOrderForm from '@/app/[locale]/manage/orders/edit-order-form';
import TablePayment from '@/app/[locale]/manage/orders/table/[number]/table-payment';
import { useCreateOrderMutation, useUpdateOrderMutation } from '@/app/queries/useOrder';
import { useGetTableDetailNowQuery } from '@/app/queries/useTable';
import { useAppStore } from '@/components/app-provider';
import QRCodeTable from '@/components/qrcode-table';
import TButton from '@/components/t-button';
import TDataTable, { TCellActions } from '@/components/t-data-table';
import TImage from '@/components/t-image';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DishCategory, OrderStatus } from '@/constants/enum';
import { toast } from '@/hooks/use-toast';
import {
  formatCurrency,
  formatDateTimeToLocaleString,
  getOptions,
  getEnumValues,
  getPrice,
  handleErrorApi,
  OrderStatusIcon,
  removeAccents
} from '@/lib/utils';

export default function OrderTableDetail({ number }: { number: string }) {
  const tOrderStatus = useTranslations('order-status');
  const tButton = useTranslations('t-button');
  const tTableColumn = useTranslations('t-data-table.column');
  const tInfo = useTranslations('t-info');

  const updateOrderMutation = useUpdateOrderMutation();
  const createOrderMutation = useCreateOrderMutation();
  const { data, refetch } = useGetTableDetailNowQuery(number);
  const tableDetail = data?.payload.data;

  const orders = useMemo(() => {
    return tableDetail?.orders ?? [];
  }, [tableDetail]);

  const isTablePayment = useMemo(() => {
    return orders.every((order) => order.status === OrderStatus.Paid);
  }, [orders]);

  console.log(isTablePayment);

  const { pending, cooking, delivered, rejected, amount } = useMemo(() => {
    return {
      pending: orders.filter((order) => order.status === OrderStatus.Pending).length,
      cooking: orders.filter((order) => order.status === OrderStatus.Processing).length,
      delivered: orders.filter((order) => order.status === OrderStatus.Delivered).length,
      rejected: orders.filter((order) => order.status === OrderStatus.Rejected).length,
      amount: orders.reduce(
        (acc, { dishSnapshot, quantity, status }) =>
          acc + (dishSnapshot.category !== DishCategory.Buffet && status !== OrderStatus.Rejected ? dishSnapshot.price : 0) * quantity,
        0
      )
    };
  }, [orders]);

  const columns = useMemo<ColumnDef<OrderDtoDetail>[]>(
    () => [
      {
        id: 'dish-name',
        header: () => <div className='text-left'>{tTableColumn('dish-name')}</div>,
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <TImage
              src={row.original.dishSnapshot.image}
              alt={row.original.dishSnapshot.name}
              width={50}
              height={50}
              className='rounded-md object-center size-[150px]'
            />
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
        accessorKey: 'options',
        header: () => <div className='text-left w-[150px]'>{tTableColumn('options')}</div>,
        cell: ({ row }) => (
          <ul className='text-left w-[150px] space-y-1'>
            {getOptions(row.original.options).map((option) => (
              <li key={removeAccents(option)} className='capitalize'>
                ✅ {option}
              </li>
            ))}
          </ul>
        )
      },
      {
        accessorKey: 'status',
        header: () => <div className='capitalize text-center'>{tTableColumn('status')}</div>,
        cell: ({ row: { original } }) =>
          original.status !== OrderStatus.Paid ? (
            <Select
              onValueChange={async (status: OrderStatus) => {
                try {
                  await updateOrderMutation.mutateAsync({
                    id: original.id,
                    dishId: original.dishSnapshot.dishId,
                    status,
                    quantity: original.quantity,
                    options: original.options
                  });
                } catch (error) {
                  handleErrorApi({ error });
                }
              }}
              value={original.status}
              disabled={original.status === OrderStatus.Rejected}
            >
              <SelectTrigger>
                <SelectValue placeholder='Theme' />
              </SelectTrigger>
              <SelectContent>
                {getEnumValues(OrderStatus)
                  .filter((status) => status !== OrderStatus.Paid)
                  .map((status) => (
                    <SelectItem key={status} value={status}>
                      {tOrderStatus(status)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          ) : (
            <div className='flex items-center justify-center'>
              <TImage src='/paid.png' alt='paid' width={60} height={60} />
            </div>
          )
      },
      {
        id: 'order-handler',
        header: () => <div className='capitalize text-center'>{tTableColumn('order-handler')}</div>,
        cell: ({ row }) => <div className='capitalize text-center'>{row.original.orderHandler?.name ?? ''}</div>
      },
      {
        id: 'create-update',
        header: () => <div className='text-center'>{tTableColumn('create-update')}</div>,
        cell: ({ row }) => (
          <div className='space-y-2 text-sm flex flex-col items-center'>
            <span className='items-center'>{formatDateTimeToLocaleString(row.original.createdAt)}</span>
            <span className='items-center'>{formatDateTimeToLocaleString(row.original.updatedAt)}</span>
          </div>
        )
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => (
          <TCellActions
            editOption={{
              render: (
                <Sheet>
                  <SheetTrigger asChild>
                    <TButton size='icon' tooltip='edit' variant='outline' disabled={row.original.status !== OrderStatus.Pending}>
                      <PencilIcon height={16} width={16} />
                    </TButton>
                  </SheetTrigger>
                  <SheetContent side='right' className='w-[500px]'>
                    <SheetHeader>
                      <SheetTitle>Edit order</SheetTitle>
                      <SheetDescription></SheetDescription>
                    </SheetHeader>
                    <EditOrderForm orderId={row.original.id} />
                  </SheetContent>
                </Sheet>
              )
            }}
          />
        )
      }
    ],
    [tOrderStatus, tTableColumn, updateOrderMutation]
  );

  const { socket } = useAppStore();

  useEffect(() => {
    function onUpadteOrder(data: OrderDtoDetail) {
      refetch();
      const {
        dishSnapshot: { name },
        quantity,
        status
      } = data;

      toast({
        description: `Món ${name} (SL: ${quantity}) đã được cập nhật sang trạng thái ${tOrderStatus(status)}`
      });
    }

    function onNewOrder(data: OrderDtoDetail[]) {
      const { guest } = data[0];

      toast({
        description: `Khách hàng tại bàn ${guest?.tableNumber} vừa đặt ${data.length} đơn`
      });
      refetch();
    }

    function onPayment() {
      toast({
        description: `Khách hàng tại bàn ${number} đã thanh toán thành công`
      });
      refetch();
    }

    socket?.on('update-order', onUpadteOrder);
    socket?.on('new-order', onNewOrder);
    socket?.on('payment', onPayment);

    return () => {
      socket?.off('update-order', onUpadteOrder);
      socket?.off('new-order', onNewOrder);
      socket?.off('payment', onPayment);
    };
  }, [number, refetch, socket, tOrderStatus]);

  const handlePayment = () => {};

  const dishChooseBody = useMemo<DishChooseBody>(() => {
    return {
      categories: [DishCategory.Paid, DishCategory.ComboBuffet, DishCategory.ComboPaid, DishCategory.Buffet],
      ignores: []
    };
  }, []);

  const createOrders = async (dishes: DishDtoDetailChoose[]) => {
    if (createOrderMutation.isPending) return;
    try {
      const result = await createOrderMutation.mutateAsync({
        tableNumber: number,
        dishes: dishes.map<DishToOrder>(({ id: dishId, options, quantity }) => ({ dishId, options, quantity }))
      });
      toast({
        description: result.payload.message
      });
      refetch();
    } catch (error) {
      handleErrorApi({ error });
    }
  };

  return (
    <>
      <div className='flex items-center gap-4 h-full'>
        <div className='flex flex-col h-full items-center gap-2 my-4 flex-1 border-r '>
          {tableDetail && (
            <>
              <QRCodeTable token={tableDetail.token} tableNumber={number} className='mx-0' size={300} isFillText={false} />
              <div className='flex items-center gap-2'>
                <span className='text-sm font-semibold'>{tInfo('table-capacity', { capacity: tableDetail?.capacity })}</span> <Users size={18} />
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-semibold'>{tInfo('guest-of-table', { guest: tableDetail.guests.length })}</span> <Users size={18} />
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-semibold'>{tInfo('pending-order', { pending })}</span>
                <OrderStatusIcon.Pending size={18} />
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-semibold'>{tInfo('cooking-order', { cooking })}</span> <OrderStatusIcon.Processing size={18} />
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-semibold'>{tInfo('delivered-order', { delivered })}</span> <OrderStatusIcon.Delivered size={18} />
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-semibold'>{tInfo('rejected-order', { rejected })}</span> <OrderStatusIcon.Rejected size={18} />
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-semibold text-red-500'>{tInfo('amount', { amount: formatCurrency(amount) })}</span>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <TButton onClick={handlePayment}>{tButton('payment')}</TButton>
                </DialogTrigger>
                <DialogContent className='w-full h-full max-w-full max-h-full flex flex-col gap-4'>
                  <TablePayment number={number} />
                  <DialogFooter className='w-max-[1500px] gap-4 w-[1500px] md:w-[1300px]  mx-auto flex flex-row items-center sm:justify-center justify-center'>
                    <DialogClose asChild>
                      <TButton variant='outline'>Hủy</TButton>
                    </DialogClose>
                    <TButton>Xác nhận</TButton>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
        <TDataTable
          columns={columns}
          data={orders}
          childrenToolbar={
            <ChooseDishTable dishChooseBody={dishChooseBody} submit={createOrders} submitKey='create-order' triggerKey='create-order' />
          }
          className='pr-2 flex-[3]'
          filter={{
            columnId: 'dish-name',
            placeholder: {
              key: 'input-placeholder-default'
            }
          }}
        />
      </div>
    </>
  );
}
