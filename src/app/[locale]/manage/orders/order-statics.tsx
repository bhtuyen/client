import { BellRing, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { useGetTablesDetailNowQuery } from '@/app/queries/useTable';
import { useAppStore } from '@/components/app-provider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { OrderStatus } from '@/constants/enum';
import { Link } from '@/i18n/routing';
import { OrderStatusIcon, cn } from '@/lib/utils';

type OrderStatusCount = Record<OrderStatus, number>;
export default function OrderStatics() {
  const { socket } = useAppStore();
  const { data, refetch } = useGetTablesDetailNowQuery();
  const tableDetails = data.payload.data;

  const tInfo = useTranslations('t-info');

  useEffect(() => {
    function onUpadteOrder() {
      refetch();
    }

    socket?.on('update-order', onUpadteOrder);

    return () => {
      socket?.off('update-order', onUpadteOrder);
    };
  }, [refetch, socket]);

  return (
    <ScrollArea className='h-full'>
      <div className='flex flex-col gap-4 h-full pr-3'>
        {tableDetails.map(({ number, id, guests, orders }) => {
          const countObject = orders.reduce<OrderStatusCount>((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
          }, {} as OrderStatusCount);

          const isEmpty = guests.length == 0;

          return (
            <Link
              href={`/manage/orders/table/${number}`}
              key={id}
              className={cn('text-sm flex items-stretch gap-2 border p-2 rounded-md cursor-pointer min-h-36', {
                'bg-secondary': !isEmpty,
                'border-transparent': !isEmpty
              })}
            >
              <div className='flex flex-col flex-[2] items-center justify-center gap-2 relative'>
                {!isEmpty && <BellRing className='size-6 absolute top-2 right-2 animate-bounce' />}
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
    </ScrollArea>
  );
}
