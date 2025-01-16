'use client';

import { PencilIcon, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import type { DishChooseBody, DishDtoDetailChoose } from '@/schemaValidations/dish.schema';
import type { DishToOrder, OrderDtoDetail } from '@/schemaValidations/order.schema';
import type { TMessageKeys } from '@/types/message.type';
import type { ColumnDef } from '@tanstack/react-table';

import ChooseDishTable from '@/app/[locale]/manage/dishes/choose-dish-table';
import EditOrderForm from '@/app/[locale]/manage/orders/edit-order-form';
import TablePayment from '@/app/[locale]/manage/orders/table/[number]/table-payment';
import { useCreateOrderMutation, useUpdateOrderMutation } from '@/app/queries/useOrder';
import { useGetTableDetailNowQuery, useResetTableMutation, useUpdateBuffetModeMutation } from '@/app/queries/useTable';
import { useAppStore } from '@/components/app-provider';
import QRCodeTable from '@/components/qrcode-table';
import TButton from '@/components/t-button';
import TDataTable, { TCellActions } from '@/components/t-data-table';
import TImage from '@/components/t-image';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { DishCategory, OrderStatus, PaymentStatus } from '@/constants/enum';
import { toast } from '@/hooks/use-toast';
import { useRouter } from '@/i18n/routing';
import {
  formatCurrency,
  formatDateTimeToLocaleString,
  getOptions,
  getEnumValues,
  getPriceString,
  handleErrorApi,
  OrderStatusIcon,
  removeAccents,
  simpleMatchText
} from '@/lib/utils';

export default function OrderTableDetail({ number }: { number: string }) {
  const tOrderStatus = useTranslations('order-status');
  const tButton = useTranslations('t-button');
  const tTableColumn = useTranslations('t-data-table.column');
  const tInfo = useTranslations('t-info');
  const tToast = useTranslations('t-toast');
  const tFilter = useTranslations('t-data-table.filter');

  const router = useRouter();

  const [hasBuffet, setHasBuffet] = useState(false);

  const updateOrderMutation = useUpdateOrderMutation();
  const createOrderMutation = useCreateOrderMutation();
  const { data, refetch } = useGetTableDetailNowQuery(number);
  const tableDetail = data?.payload.data;

  const updateBuffetModeMutation = useUpdateBuffetModeMutation();
  const resetTableMutation = useResetTableMutation();

  const orders = useMemo(() => {
    return tableDetail?.orders ?? [];
  }, [tableDetail]);

  const isPaid = useMemo(() => {
    if (tableDetail) {
      return tableDetail.paymentStatus === PaymentStatus.Paid;
    }
    return false;
  }, [tableDetail]);

  const dishBuffetId = useMemo(() => {
    const dishBuffetCombo = orders.find((order) => order.dishSnapshot.category === DishCategory.ComboBuffet);
    if (dishBuffetCombo) {
      return dishBuffetCombo.dishSnapshot.dishId;
    }
  }, [orders]);

  useEffect(() => {
    setHasBuffet(!!tableDetail?.dishBuffetId);
  }, [tableDetail]);

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
        filterFn: (row, _, filterValue) => {
          return simpleMatchText(String(row.original.dishSnapshot.name), String(filterValue));
        },
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
              <span className='italic'>{getPriceString(row.original.dishSnapshot)}</span>
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
              disabled={original.status === OrderStatus.Rejected || isPaid}
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
                    <TButton
                      size='icon'
                      tooltip='edit'
                      variant='outline'
                      disabled={row.original.status === OrderStatus.Paid || row.original.status === OrderStatus.Rejected || isPaid}
                    >
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
    [isPaid, tOrderStatus, tTableColumn, updateOrderMutation]
  );

  const { socket, showAlertDialog } = useAppStore();

  useEffect(() => {
    function onUpdateOrder(order: OrderDtoDetail) {
      const {
        dishSnapshot: { name },
        quantity,
        status,
        tableNumber
      } = order;

      if (tableNumber !== number) return;

      refetch();

      toast({
        description: tToast('on-update-order', { name, quantity, tableNumber, status: tOrderStatus(status) })
      });
    }

    function onNewOrder(orderCount: number, tableNumber: string) {
      if (tableNumber !== number) return;
      toast({
        description: tToast('on-new-order', { tableNumber, orderCount })
      });
      refetch();
    }

    function onPayment(tableNumber: string) {
      if (tableNumber !== number) return;
      toast({
        description: tToast('on-payment', { tableNumber })
      });
      refetch();
    }

    function onCallStaff(tableNumber: string) {
      if (tableNumber !== number) return;
      toast({
        description: tToast('guest-call-staff', { tableNumber })
      });
      refetch();
    }

    function onRequestPayment(tableNumber: string) {
      if (tableNumber !== number) return;
      toast({
        description: tToast('guest-request-payment', { tableNumber })
      });
      refetch();
    }

    socket?.on('call-staff', onCallStaff);
    socket?.on('request-payment', onRequestPayment);

    socket?.on('update-order', onUpdateOrder);
    socket?.on('new-order', onNewOrder);
    socket?.on('payment', onPayment);

    return () => {
      socket?.off('update-order', onUpdateOrder);
      socket?.off('new-order', onNewOrder);
      socket?.off('payment', onPayment);

      socket?.off('call-staff', onCallStaff);
      socket?.off('request-payment', onRequestPayment);
    };
  }, [number, refetch, socket, tOrderStatus, tToast]);

  const resetTable = () => {
    resetTableMutation.mutateAsync(number).then((res) => {
      const messageKey = res.payload.message as TMessageKeys<'t-toast'>;
      toast({
        description: tToast(messageKey)
      });
    });
    router.push('/manage/orders');
  };

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

  const handleBuffetMode = (checked: boolean) => {
    const key = checked ? 'on-buffet' : 'off-buffet';
    showAlertDialog({
      onAction: async () => {
        const result = await updateBuffetModeMutation.mutateAsync({
          tableNumber: number,
          dishBuffetId: checked ? (dishBuffetId ?? null) : null
        });
        setHasBuffet(!!result.payload.data.dishBuffetId);
        console.log(hasBuffet);
        toast({
          description: tToast(result.payload.message as TMessageKeys<'t-toast'>, { tableNumber: number })
        });
      },
      title: key,
      description: {
        key,
        values: {
          number
        }
      }
    });
  };

  return (
    <>
      <div className='flex items-center gap-4 h-full max-[1366px]:flex-col max-[1366px]:gap-2 max-[1366px]:mr-2 max-[1366px]:p-2'>
        <div className='flex flex-col h-full items-center flex-1 gap-2 my-4 border-r max-[1366px]:flex-row max-[1366px]:flex-none max-[1366px]:justify-start max-[1366px]:w-full max-[1366px]:border-r-0 max-[1366px]:border-b max-[1366px]:my-0 max-[1366px]:h-[150px] '>
          {tableDetail && (
            <>
              <QRCodeTable
                token={tableDetail.token}
                tableNumber={number}
                className='mx-0 max-[1366px]:w-[150px]'
                size={300}
                isFillText={false}
                isPaid={isPaid}
              />
              <div className='flex flex-col gap-2 max-[1366px]:grid max-[1366px]:grid-cols-3 max-[1366px]:flex-1 max-[1366px]:gap-6'>
                <div className='flex items-center justify-center gap-2'>
                  <span className='text-sm font-semibold'>{tInfo('table-capacity', { capacity: tableDetail?.capacity })}</span> <Users size={18} />
                </div>
                <div className='flex items-center justify-center gap-2'>
                  <span className='text-sm font-semibold'>{tInfo('guest-of-table', { guest: tableDetail.guests.length })}</span> <Users size={18} />
                </div>
                <div className='flex items-center justify-center gap-2'>
                  <span className='text-sm font-semibold'>{tInfo('pending-order', { pending })}</span>
                  <OrderStatusIcon.Pending size={18} />
                </div>
                <div className='flex items-center justify-center gap-2'>
                  <span className='text-sm font-semibold'>{tInfo('cooking-order', { cooking })}</span> <OrderStatusIcon.Processing size={18} />
                </div>
                <div className='flex items-center justify-center gap-2'>
                  <span className='text-sm font-semibold'>{tInfo('delivered-order', { delivered })}</span> <OrderStatusIcon.Delivered size={18} />
                </div>
                <div className='flex items-center justify-center gap-2'>
                  <span className='text-sm font-semibold'>{tInfo('rejected-order', { rejected })}</span> <OrderStatusIcon.Rejected size={18} />
                </div>
              </div>

              <div className='flex flex-col gap-2 min-w-[250px]'>
                {dishBuffetId && (
                  <div className='flex items-center gap-4'>
                    <Label htmlFor='buffet-mode' className='text-sm font-semibold'>
                      {tInfo('has-buffet')}
                    </Label>
                    <Switch id='buffet-mode' checked={hasBuffet} onCheckedChange={handleBuffetMode} disabled={isPaid} />
                  </div>
                )}

                <div className='flex items-center justify-center gap-2'>
                  <span className='text-sm font-semibold text-red-500'>{tInfo('amount', { amount: formatCurrency(amount) })}</span>
                </div>
                {isPaid && <TButton onClick={resetTable}>{tInfo('reset-table')}</TButton>}
                <Dialog>
                  <DialogTrigger asChild>{!isPaid && <TButton disabled={amount == 0}>{tButton('payment')}</TButton>}</DialogTrigger>
                  <DialogContent className='w-full h-full max-w-full max-h-full flex flex-col gap-4'>
                    <TablePayment number={number} isPaid={isPaid} />
                    <DialogFooter className='w-max-[1500px] gap-4 w-[1500px] md:w-[1300px] mx-auto flex flex-row items-center sm:justify-center justify-center'>
                      <DialogClose asChild>
                        <TButton variant={isPaid ? 'default' : 'outline'}>{isPaid ? tButton('confirm') : tButton('cancel')}</TButton>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </>
          )}
        </div>
        <TDataTable
          columns={columns}
          data={orders}
          childrenToolbar={
            <ChooseDishTable
              dishChooseBody={dishChooseBody}
              submit={createOrders}
              submitKey='create-order'
              triggerKey='create-order'
              disabledBtnTriiger={isPaid}
            />
          }
          className='pr-2 flex-[3] max-[1366px]:h-[calc(100%_-_152px)] max-[1366px]:pr-0'
          filter={{
            columnId: 'dish-name',
            placeholder: {
              key: 'input-placeholder-default'
            }
          }}
          filterCustom={(table) => {
            return (
              <Select
                onValueChange={(value) => {
                  const statusCol = table.getColumn('status');
                  if (statusCol) {
                    statusCol.setFilterValue(value);
                  }
                }}
                value={(table.getColumn('status')?.getFilterValue() as string) ?? ''}
                disabled={table.getRowCount() == 0}
              >
                <SelectTrigger className='min-w-60'>
                  <SelectValue placeholder={tFilter('select-placeholder-status')} />
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
          }}
        />
      </div>
    </>
  );
}
