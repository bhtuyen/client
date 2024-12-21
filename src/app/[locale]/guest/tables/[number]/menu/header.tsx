'use client';
import { BellRing, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';

import CartAndOrderDialog from '@/app/[locale]/guest/tables/[number]/menu/cart-and-order-dialog';
import TButton from '@/components/t-button';
import TImage from '@/components/t-image';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function Header({ number }: { number: string }) {
  const tButton = useTranslations('t-button');
  const tGuest = useTranslations('guest');

  return (
    <nav className='h-14 flex justify-between px-4'>
      <div className='flex items-center '>
        <TImage src='/vietnam.png' alt='logo' width={30} height={30} />
        <Separator orientation='vertical' className='mx-2 h-[60%] w-[0.5px] bg-[#cecece]' />
        <Badge className='bg-[#f2f2f2] h-[60%] rounded-3xl mr-2 text-black'>{tGuest('table-number', { number })}</Badge>
        <TButton className='bg-[#f2f2f2] h-[60%] rounded-3xl flex items-center gap-1 text-black'>
          <BellRing width={'20px'} height={'20px'} />
          {tButton('call-staff')}
        </TButton>
      </div>
      <div className='flex items-center gap-2'>
        <CartAndOrderDialog number={number} />
        <div className='rounded-full bg-[#f2f2f2] h-[60%] aspect-square flex items-center justify-center'>
          <UserRound color='#000000' />
        </div>
      </div>
    </nav>
  );
}
