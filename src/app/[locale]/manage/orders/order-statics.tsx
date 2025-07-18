'use client';
import { BellRing, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo } from 'react';

import { useGetTablesDetailNowQuery } from '@/app/queries/useTable';
import { useAppStore } from '@/components/app-provider';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { OrderStatus } from '@/constants/enum';
import { toast } from '@/hooks/use-toast';
import { Link } from '@/i18n/routing';
import { OrderStatusIcon, cn } from '@/lib/utils';

type OrderStatusCount = Record<OrderStatus, number>;
export default function OrderStatics() {
  const { socket } = useAppStore();
  const { data, refetch } = useGetTablesDetailNowQuery();
  const tableDetails = useMemo(() => data?.payload.data || [], [data]);

  const tInfo = useTranslations('t-info');
  const tToast = useTranslations('t-toast');

  useEffect(() => {
    function onUpadteOrder() {
      refetch();
    }

    function onCallStaff(tableNumber: string) {
      toast({
        description: tToast('guest-call-staff', { tableNumber })
      });
      refetch();
    }

    function onRequestPayment(tableNumber: string) {
      toast({
        description: tToast('guest-request-payment', { tableNumber })
      });
      refetch();
    }

    socket?.on('update-order', onUpadteOrder);
    socket?.on('call-staff', onCallStaff);
    socket?.on('request-payment', onRequestPayment);

    return () => {
      socket?.off('update-order', onUpadteOrder);
      socket?.off('call-staff', onCallStaff);
      socket?.off('request-payment', onRequestPayment);
    };
  }, [refetch, socket, tToast]);

  return (
    <ScrollArea className='h-full'>
      <div className='flex flex-col gap-4 h-full pr-3 max-[1366px]:flex-row max-[1366px]:pr-0 max-[1366px]:pb-2'>
        {tableDetails.map(({ number, id, guests, orders, requestPayment, callStaff }) => {
          const countObject = orders.reduce<OrderStatusCount>((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
          }, {} as OrderStatusCount);

          const isEmpty = guests.length == 0;

          return (
            <Link
              href={`/manage/orders/table/${number}`}
              key={id}
              className={cn(
                'text-sm flex items-stretch shadow-md gap-2 border p-2 rounded-md cursor-pointer min-h-36 max-[1366px]:w-[300px] max-[1366px]:p-0 max-[1366px]:h-[132px] max-[1366px]:min-h-0',
                {
                  'bg-secondary': !isEmpty,
                  'border-transparent': !isEmpty
                }
              )}
            >
              <div className='flex flex-col flex-[2] items-center justify-center gap-2 relative'>
                {!isEmpty && (
                  <BellRing
                    className={cn('size-6 absolute top-2 right-2', {
                      'animate-bounce': requestPayment || callStaff
                    })}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('bell clicked');
                    }}
                  />
                )}
                <div className='font-semibold text-center text-lg'>{tInfo('table-number', { number })}</div>
                <div className='flex items-center gap-2'>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Users className='size-5' />
                      </TooltipTrigger>
                      <TooltipContent>{tInfo('serving-guest-tooltip', { guests: guests.length })}</TooltipContent>
                    </Tooltip>
                    <span>{guests.length}</span>
                  </TooltipProvider>
                </div>
              </div>
              <Separator
                orientation='vertical'
                className={cn('flex-shrink-0 h-auto', {
                  'bg-muted-foreground': !isEmpty
                })}
              />
              {isEmpty && <div className='flex flex-[1] items-center justify-center text-sm'>{tInfo('table-ready')}</div>}
              {!isEmpty && (
                <div className='flex flex-col items-center justify-center flex-[1] gap-2'>
                  <TooltipProvider>
                    <div className='flex gap-2 items-center'>
                      <Tooltip>
                        <TooltipTrigger>
                          <OrderStatusIcon.Pending className='size-5' />
                        </TooltipTrigger>
                        <TooltipContent>{tInfo('pending-order-tooltip', { orders: countObject[OrderStatus.Pending] ?? 0 })}</TooltipContent>
                      </Tooltip>
                      <span>{countObject[OrderStatus.Pending] ?? 0}</span>
                    </div>

                    <div className='flex gap-2 items-center'>
                      <Tooltip>
                        <TooltipTrigger>
                          <OrderStatusIcon.Processing className='size-5' />
                        </TooltipTrigger>
                        <TooltipContent>{tInfo('cooking-order-tooltip', { orders: countObject[OrderStatus.Processing] ?? 0 })}</TooltipContent>
                      </Tooltip>
                      <span>{countObject[OrderStatus.Processing] ?? 0}</span>
                    </div>

                    <div className='flex gap-2 items-center'>
                      <Tooltip>
                        <TooltipTrigger>
                          <OrderStatusIcon.Delivered className='size-5' />
                        </TooltipTrigger>
                        <TooltipContent>{tInfo('delivered-order-tooltip', { orders: countObject[OrderStatus.Delivered] ?? 0 })}</TooltipContent>
                        <span>{countObject[OrderStatus.Delivered] ?? 0}</span>
                      </Tooltip>
                    </div>
                    <div className='flex gap-2 items-center'>
                      <Tooltip>
                        <TooltipTrigger>
                          <OrderStatusIcon.Rejected className='size-5' />
                        </TooltipTrigger>
                        <TooltipContent>{tInfo('rejected-order-tooltip', { orders: countObject[OrderStatus.Rejected] ?? 0 })}</TooltipContent>
                        <span>{countObject[OrderStatus.Rejected] ?? 0}</span>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </div>
              )}
            </Link>
          );
        })}
      </div>
      <ScrollBar orientation='horizontal' />
    </ScrollArea>
  );
}
