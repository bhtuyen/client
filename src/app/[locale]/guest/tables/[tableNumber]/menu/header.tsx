'use client';
import { BellRing, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { TMessageKeys } from '@/types/message.type';

import CartAndOrderDialog from '@/app/[locale]/guest/tables/[tableNumber]/menu/cart-and-order-dialog';
import { useCallStaffMutation } from '@/app/queries/useGuest';
import { useOrderByTableQuery } from '@/app/queries/useOrder';
import TButton from '@/components/t-button';
import TImage from '@/components/t-image';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

export default function Header({ tableNumber }: { tableNumber: string }) {
  const tButton = useTranslations('t-button');
  const tGuest = useTranslations('guest');
  const tToast = useTranslations('t-toast');
  const { data, refetch } = useOrderByTableQuery(tableNumber);
  const orders = data?.payload.data || [];

  const callStaffMutation = useCallStaffMutation();

  const handleCallStaff = () => {
    callStaffMutation
      .mutateAsync({ tableNumber })
      .then((res) => {
        const messageKey = res.payload.message as TMessageKeys<'t-toast'>;
        toast({
          description: tToast(messageKey)
        });
      })
      .catch(() => {
        toast({
          description: tToast('call-staff-fail')
        });
      });
  };

  return (
    <nav className='h-14 flex justify-between px-4'>
      <div className='flex items-center '>
        <TImage src='/vietnam.png' alt='logo' width={30} height={30} />
        <Separator orientation='vertical' className='mx-2 h-[60%] w-[0.5px] bg-[#cecece]' />
        <Badge className='bg-[#f2f2f2] h-[60%] rounded-3xl mr-2 text-black'>{tGuest('table-number', { tableNumber })}</Badge>
        <TButton
          onClick={handleCallStaff}
          className='bg-[#f2f2f2] h-[60%] rounded-3xl flex items-center gap-1 text-black'
          variant={'ghost'}
          tooltip='call-staff'
        >
          <BellRing width={'20px'} height={'20px'} />
          {tButton('call-staff')}
        </TButton>
      </div>
      <div className='flex items-center gap-2'>
        <CartAndOrderDialog orders={orders} refetch={refetch} tableNumber={tableNumber} />
        <div className='rounded-full bg-[#f2f2f2] h-[60%] aspect-square flex items-center justify-center'>
          <UserRound color='#000000' />
        </div>
      </div>
    </nav>
  );
}
