'use client';
import { BellRing, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import type { OrderDtoDetail } from '@/schemaValidations/order.schema';

import CartAndOrderDialog from '@/app/[locale]/guest/menu/cart-and-order-dialog';
import { useOrderByTableQuery } from '@/app/queries/useOrder';
import { useAppStore } from '@/components/app-provider';
import TButton from '@/components/t-button';
import TImage from '@/components/t-image';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

export default function Header() {
  const { socket, tableNumber } = useAppStore();
  const { refetch } = useOrderByTableQuery(tableNumber, !!tableNumber);

  const tButton = useTranslations('t-button');
  const tOrderStatus = useTranslations('order-status');

  useEffect(() => {
    function onUpadteOrder(data: OrderDtoDetail) {
      const {
        dishSnapshot: { name },
        quantity,
        status
      } = data;

      toast({
        description: `Món ${name} (SL: ${quantity}) đã được cập nhật sang trạng thái ${tOrderStatus(status)}`
      });
      refetch();
    }
    function onPayment(data: OrderDtoDetail[]) {
      toast({
        description: `Bạn đã thanh toán thành công ${data.length} đơn`
      });
      refetch();
    }

    socket?.on('update-order', onUpadteOrder);
    socket?.on('payment', onPayment);

    return () => {
      socket?.off('update-order', onUpadteOrder);
      socket?.off('payment', onPayment);
    };
  }, [refetch, socket, tOrderStatus]);
  return (
    <nav className='h-[60px] flex justify-between px-4'>
      <div className='flex items-center'>
        <TImage src='/vietnam.png' alt='logo' width={30} height={30} />
        <Separator orientation='vertical' className='mx-2 h-[60%] w-[0.5px] bg-[#cecece]' />
        <Badge className='bg-[#f2f2f2] h-[60%] rounded-3xl mr-2'>Bàn {tableNumber}</Badge>
        <TButton className='bg-[#f2f2f2] h-[60%] rounded-3xl flex items-center gap-1'>
          <BellRing width={'20px'} height={'20px'} />
          {tButton('call-staff')}
        </TButton>
      </div>
      <div className='flex items-center gap-2'>
        <CartAndOrderDialog />
        <div className='rounded-full bg-[#f2f2f2] h-[60%] aspect-square flex items-center justify-center'>
          <UserRound color='#000000' />
        </div>
      </div>
    </nav>
  );
}
